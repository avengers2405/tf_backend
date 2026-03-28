import authService from '../services/authService.js';
import authConfig from '../config/authConfig.js';
import prisma from '../db/prisma.js';
import emailService from '../services/emailService.js';
import logger from '../services/logger.js';

function setSessionCookies(res, accessToken, refreshToken, role) {
  const accessOptions = authConfig.getAccessCookieOptions();
  const refreshOptions = authConfig.getRefreshCookieOptions();
  const roleOptions = authConfig.getRoleCookieOptions();
  
  // console.log('Setting cookies with sameSite:', authConfig.cookieSameSite, 'secure:', authConfig.isProduction);
  logger.info('Setting session cookies', { sameSite: authConfig.cookieSameSite, secure: authConfig.isProduction });
  
  res.cookie(
    authConfig.accessCookieName,
    accessToken,
    accessOptions
  );

  res.cookie(
    authConfig.refreshCookieName,
    refreshToken,
    refreshOptions
  );

  if (role) {
    res.cookie(
      authConfig.roleCookieName,
      role,
      roleOptions
    );
  }
  
  // console.log('Cookies set successfully');
  logger.info('Cookies set successfully', { roleSet: Boolean(role) });
}

function clearSessionCookies(res) {
  res.clearCookie(authConfig.accessCookieName, {
    path: '/',
    httpOnly: true,
    secure: authConfig.isProduction,
    sameSite: authConfig.cookieSameSite,
  });

  res.clearCookie(authConfig.refreshCookieName, {
    path: '/',
    httpOnly: true,
    secure: authConfig.isProduction,
    sameSite: authConfig.cookieSameSite,
  });

  res.clearCookie(authConfig.roleCookieName, {
    path: '/',
    httpOnly: true,
    secure: authConfig.isProduction,
    sameSite: authConfig.cookieSameSite,
  });
}

function getRefreshTokenFromRequest(req) {
  return req.cookies?.[authConfig.refreshCookieName] || req.body?.refresh_token || null;
}

class AuthController {
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        logger.warn('Register missing fields', { usernameProvided: Boolean(username), emailProvided: Boolean(email) });
        res.status(400).json({ error: 'username, email and password are required' });
        return;
      }

      const normalizedEmail = String(email).trim().toLowerCase();

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username },
            { email: normalizedEmail },
          ],
        },
      });

      if (existingUser) {
        logger.warn('Register conflict', { username, email: normalizedEmail });
        res.status(409).json({ error: 'username or email already exists' });
        return;
      }

      const hashedPassword = authService.hashPassword(password);

      const createdUser = await prisma.user.create({
        data: {
          username,
          email: normalizedEmail,
          password: hashedPassword
        },
      });

      const token = await authService.issueMagicLinkToken(createdUser.id);
      const callbackPath = authConfig.authMagicLinkPath.startsWith('/')
        ? authConfig.authMagicLinkPath
        : `/${authConfig.authMagicLinkPath}`;
      const magicLink = `${authConfig.frontendUrl}${callbackPath}?token=${encodeURIComponent(token)}`;

      void emailService.sendAuthMagicLinkEmail({
        email: createdUser.email,
        magicLink,
      }).catch((emailError) => {
        logger.error('Registration verification email error', { error: emailError?.message });
        // console.error('Registration verification email error:', emailError);
      });

      res.status(201).json({
        message: 'registration successful, verify your email before login',
        ...(process.env.NODE_ENV !== 'production' ? { preview_link: magicLink } : {}),
        user: {
          id: createdUser.id,
          username: createdUser.username,
          email: createdUser.email,
          is_verified: createdUser.is_verified,
        },
      });
    } catch (error) {
      // console.error('Registration error:', error);
      logger.error('Registration error', { error: error?.message });
      res.status(500).json({ error: 'internal server error' });
    }
  }

  async requestMagicLink(req, res) {
    try {
      const { identifier } = req.body;

      if (!identifier) {
        res.status(400).json({ error: 'identifier is required' });
        return;
      }

      const user = await authService.findUserByIdentifier(identifier);

      if (!user) {
        res.status(200).json({
          message: 'If the account exists, a verification link will be sent',
        });
        return;
      }

      const token = await authService.issueMagicLinkToken(user.id);

      const callbackPath = authConfig.authMagicLinkPath.startsWith('/')
        ? authConfig.authMagicLinkPath
        : `/${authConfig.authMagicLinkPath}`;
      const magicLink = `${authConfig.frontendUrl}${callbackPath}?token=${encodeURIComponent(token)}`;

      const userEmail = await authService.findUserEmailById(user.id);

      if (userEmail) {
        void emailService.sendAuthMagicLinkEmail({
          email: userEmail,
          magicLink,
        }).catch((emailError) => {
          logger.error('Resend verification email error', { error: emailError?.message });
          // console.error('Resend verification email error:', emailError);
        });
      }

      res.status(200).json({
        message: 'If the account exists, a verification link will be sent',
        ...(process.env.NODE_ENV !== 'production' ? { preview_link: magicLink } : {}),
      });
    } catch (error) {
      logger.error('Request magic-link error', { error: error?.message });
      // console.error('Request magic-link error:', error);
      res.status(500).json({ error: 'internal server error' });
    }
  }

  async verifyMagicLink(req, res) {
    try {
      const token = req.query.token || req.body.token;

      if (!token) {
        res.status(400).json({ error: 'token is required' });
        return;
      }

      const verifiedUser = await authService.consumeMagicLinkToken(token);

      if (!verifiedUser) {
        res.status(401).json({ error: 'invalid or expired token' });
        return;
      }

      const tokens = await authService.issueSessionTokens(verifiedUser.id);
      const role = await authService.resolveUserRole(verifiedUser.id);

      setSessionCookies(res, tokens.accessToken, tokens.refreshToken, role);

      res.status(200).json({
        message: 'email verification successful',
        user: {
          id: verifiedUser.id,
          username: verifiedUser.username,
          email: verifiedUser.email,
          is_verified: verifiedUser.is_verified,
          role,
        },
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });
    } catch (error) {
      logger.error('Verify magic-link error', { error: error?.message });
      // console.error('Verify magic-link error:', error);
      res.status(500).json({ error: 'internal server error' });
    }
  }

  async verifyInviteMagicLink(req, res) {
    try {
      const token = req.query.token || req.body.token;

      if (!token) {
        res.status(400).json({ error: 'token is required' });
        return;
      }

      const result = await authService.consumeInviteMagicLinkToken(token);

      if (!result) {
        res.status(401).json({ error: 'invalid or expired token' });
        return;
      }

      const { user, role: targetRole } = result;

      const tokens = await authService.issueSessionTokens(user.id);
      
      // Use the role from the invite token (already set up during consumption)
      const role = targetRole || await authService.resolveUserRole(user.id);

      setSessionCookies(res, tokens.accessToken, tokens.refreshToken, role);

      res.status(200).json({
        message: 'invite link verified and login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          is_verified: user.is_verified,
          role,
        },
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });
    } catch (error) {
      logger.error('Verify invite magic-link error', { error: error?.message });
      // console.error('Verify invite magic-link error:', error);
      res.status(500).json({ error: 'internal server error' });
    }
  }

  async login(req, res) {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
          logger.warn('Login missing fields', { identifierProvided: Boolean(identifier), passwordProvided: Boolean(password) });
        res.status(400).json({ error: 'identifier and password are required' });
        return;
      }

      const user = await authService.validatePasswordLogin(identifier, password);

      if (!user) {
          logger.warn('Login failed: user not found', { identifier });
        res.status(401).json({ error: 'invalid credentials' });
        return;
      }

      if (!user.is_verified) {
        res.status(403).json({ error: 'email is not verified' });
        return;
      }

      const tokens = await authService.issueSessionTokens(user.id);
      const role = await authService.resolveUserRole(user.id);

      // console.log('Login successful for user:', user.id, 'role:', role);
        logger.info('Login successful', { userId: user.id, role });
      setSessionCookies(res, tokens.accessToken, tokens.refreshToken, role);

      res.status(200).json({
        message: 'login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          is_verified: user.is_verified,
          role,
        },
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });
    } catch (error) {
      // console.error('Login error:', error);
        logger.error('Login error', { error: error?.message });
      res.status(500).json({ error: 'internal server error' });
    }
  }

  async refresh(req, res) {
    try {
      const refresh_token = getRefreshTokenFromRequest(req);

      if (!refresh_token) {
        logger.warn('Refresh missing token');
        res.status(400).json({ error: 'refresh_token is required' });
        return;
      }

      const rotated = await authService.rotateRefreshToken(refresh_token);

      if (!rotated) {
        logger.warn('Refresh failed: invalid or expired token');
        res.status(401).json({ error: 'invalid or expired refresh token' });
        return;
      }

      const role = await authService.resolveUserRole(rotated.userId);

      setSessionCookies(res, rotated.accessToken, rotated.refreshToken, role);

      res.status(200).json({
        message: 'token refreshed',
        access_token: rotated.accessToken,
        refresh_token: rotated.refreshToken,
      });
    } catch (error) {
      // console.error('Refresh token error:', error);
      logger.error('Refresh token error', { error: error?.message });
      res.status(500).json({ error: 'internal server error' });
    }
  }

  async logout(req, res) {
    try {
      const refresh_token = getRefreshTokenFromRequest(req);

      if (refresh_token) {
        await authService.revokeRefreshToken(refresh_token);
        logger.info('Logout revoked refresh token');
      }

      clearSessionCookies(res);
      logger.info('Logout cleared session cookies');

      res.status(200).json({ message: 'logout successful' });
    } catch (error) {
      // console.error('Logout error:', error);
      logger.error('Logout error', { error: error?.message });
      res.status(500).json({ error: 'internal server error' });
    }
  }

  async me(req, res) {
    try {
      const payload = req.user;

      const user = await prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      });

      if (!user) {
        res.status(404).json({ error: 'user not found' });
        return;
      }

      const role = await authService.resolveUserRole(user.id);

      res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          is_verified: user.is_verified,
          role,
        },
      });
    } catch (error) {
      // console.error('Me endpoint error:', error);
      logger.error('Me endpoint error', { error: error?.message });
      res.status(500).json({ error: 'internal server error' });
    }
  }
}

export default new AuthController();