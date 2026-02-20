import crypto from 'crypto';
import prisma from '../db/prisma.js';
import jwtService from './jwtService.js';
import authConfig from '../config/authConfig.js';

const SCRYPT_KEYLEN = 64;
const PASSWORD_SCHEME = 'scrypt';

class AuthService {
  getTnpDelegate() {
    return prisma.tnp ?? null;
  }

  getRecruiterDelegate() {
    return prisma.recruiter ?? null;
  }

  hashPassword(password) {
    const normalized = this.normalizeSecret(password);
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .scryptSync(normalized, salt, SCRYPT_KEYLEN)
      .toString('hex');

    return `${PASSWORD_SCHEME}$${salt}$${hash}`;
  }

  verifyPassword(plainPassword, storedPassword) {
    if (!storedPassword || !plainPassword) {
      return false;
    }

    if (storedPassword.startsWith(`${PASSWORD_SCHEME}$`)) {
      const [, salt, storedHash] = storedPassword.split('$');
      if (!salt || !storedHash) {
        return false;
      }

      const candidateHash = crypto
        .scryptSync(this.normalizeSecret(plainPassword), salt, SCRYPT_KEYLEN)
        .toString('hex');

      const storedBuffer = Buffer.from(storedHash, 'hex');
      const candidateBuffer = Buffer.from(candidateHash, 'hex');

      if (storedBuffer.length !== candidateBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(storedBuffer, candidateBuffer);
    }

    return storedPassword === plainPassword;
  }

  async findUserByIdentifier(identifier) {
    if (!identifier) {
      return null;
    }

    const normalized = identifier.trim();

    if (normalized.includes('@')) {
      const userByEmail = await prisma.user.findUnique({
        where: {
          email: normalized.toLowerCase(),
        },
      });

      if (userByEmail) {
        return userByEmail;
      }

      const student = await prisma.student.findFirst({
        where: {
          OR: [
            { primary_email: normalized },
            { secondary_email: normalized },
            { student_email: normalized },
          ],
        },
        include: {
          user: true,
        },
      });

      if (student?.user) {
        return student.user;
      }

      const teacher = await prisma.teacher.findUnique({
        where: {
          email: normalized,
        },
        include: {
          user: true,
        },
      });

      if (teacher?.user) {
        return teacher.user;
      }

      const tnpDelegate = this.getTnpDelegate();
      const tnp = tnpDelegate
        ? await tnpDelegate.findUnique({
            where: {
              email: normalized,
            },
            include: {
              user: true,
            },
          })
        : null;

      if (tnp?.user) {
        return tnp.user;
      }

      const recruiterDelegate = this.getRecruiterDelegate();
      const recruiter = recruiterDelegate
        ? await recruiterDelegate.findUnique({
            where: {
              email: normalized,
            },
            include: {
              user: true,
            },
          })
        : null;

      return recruiter?.user ?? null;
    }

    return prisma.user.findUnique({
      where: {
        username: normalized,
      },
    });
  }

  async validatePasswordLogin(identifier, password) {
    const user = await this.findUserByIdentifier(identifier);

    if (!user) {
      return null;
    }

    const isValidPassword = this.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  async resolveUserRole(userId) {
    if (!userId) {
      return 'student';
    }

    const student = await prisma.student.findUnique({
      where: {
        user_id: userId,
      },
      select: {
        user_id: true,
      },
    });

    if (student) {
      return 'student';
    }

    const tnpDelegate = this.getTnpDelegate();
    const tnpProfile = tnpDelegate
      ? await tnpDelegate.findUnique({
          where: {
            user_id: userId,
          },
          select: {
            user_id: true,
          },
        })
      : null;

    if (tnpProfile) {
      return 'tnp';
    }

    const recruiterDelegate = this.getRecruiterDelegate();
    const recruiterProfile = recruiterDelegate
      ? await recruiterDelegate.findUnique({
          where: {
            user_id: userId,
          },
          select: {
            user_id: true,
          },
        })
      : null;

    if (recruiterProfile) {
      return 'recruiter';
    }

    const teacher = await prisma.teacher.findUnique({
      where: {
        user_id: userId,
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        teacher_roles: {
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      return 'student';
    }

    const roleNames = teacher.teacher_roles
      .map((assignment) => assignment.role?.name?.toLowerCase?.())
      .filter(Boolean);

    const normalizedRoleNames = roleNames.map((name) => name.replace(/[\s_-]+/g, ''));

    if (normalizedRoleNames.some((name) => name.includes('recruit'))) {
      return 'recruiter';
    }

    if (normalizedRoleNames.some((name) => name.includes('tnp') || name.includes('placement') || name.includes('trainingandplacement'))) {
      return 'tnp';
    }

    const departmentHint = String(teacher.department ?? '').toLowerCase().replace(/[\s_-]+/g, '');
    const usernameHint = String(teacher.user?.username ?? '').toLowerCase().replace(/[\s_-]+/g, '');
    const emailHint = String(teacher.user?.email ?? teacher.email ?? '').toLowerCase();

    if (
      departmentHint.includes('tnp') ||
      departmentHint.includes('tpo') ||
      departmentHint.includes('placement') ||
      departmentHint.includes('training') ||
      usernameHint.includes('tnp') ||
      usernameHint.includes('tpo') ||
      emailHint.includes('tnp') ||
      emailHint.includes('tpo') ||
      emailHint.includes('placement')
    ) {
      return 'tnp';
    }

    return 'teacher';
  }

  async findUserEmailById(userId) {
    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        email: true,
      },
    });

    if (user?.email) {
      return user.email;
    }

    const student = await prisma.student.findUnique({
      where: {
        user_id: userId,
      },
      select: {
        primary_email: true,
        secondary_email: true,
        student_email: true,
      },
    });

    if (student) {
      return student.primary_email || student.student_email || student.secondary_email;
    }

    const teacher = await prisma.teacher.findUnique({
      where: {
        user_id: userId,
      },
      select: {
        email: true,
      },
    });

    if (teacher?.email) {
      return teacher.email;
    }

    const tnpDelegate = this.getTnpDelegate();
    const tnp = tnpDelegate
      ? await tnpDelegate.findUnique({
          where: {
            user_id: userId,
          },
          select: {
            email: true,
          },
        })
      : null;

    if (tnp?.email) {
      return tnp.email;
    }

    const recruiterDelegate = this.getRecruiterDelegate();
    const recruiter = recruiterDelegate
      ? await recruiterDelegate.findUnique({
          where: {
            user_id: userId,
          },
          select: {
            email: true,
          },
        })
      : null;

    return recruiter?.email ?? null;
  }

  async issueMagicLinkToken(userId) {
    const token = jwtService.generateAuthToken(
      {
        sub: userId,
        type: 'magic',
      },
      authConfig.magicTokenExpiresIn
    );

    const payload = jwtService.verifyAuthToken(token);
    if (!payload?.jti || !payload?.exp) {
      throw new Error('Failed to generate magic verification token');
    }

    await prisma.auth_Magic_Token.create({
      data: {
        user_id: userId,
        token_hash: jwtService.hashToken(token),
        jti: payload.jti,
        expires_at: new Date(payload.exp * 1000),
      },
    });

    return token;
  }

  async consumeMagicLinkToken(token) {
    const payload = jwtService.verifyAuthToken(token);
    if (!payload || payload.type !== 'magic' || !payload.sub) {
      return null;
    }

    const tokenHash = jwtService.hashToken(token);
    const tokenRow = await prisma.auth_Magic_Token.findUnique({
      where: {
        token_hash: tokenHash,
      },
      include: {
        user: true,
      },
    });

    if (!tokenRow) {
      return null;
    }

    if (tokenRow.user_id !== payload.sub) {
      return null;
    }

    if (tokenRow.used_at || tokenRow.expires_at.getTime() <= Date.now()) {
      return null;
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.auth_Magic_Token.update({
        where: {
          id: tokenRow.id,
        },
        data: {
          used_at: new Date(),
        },
      });

      const user = await tx.user.update({
        where: {
          id: tokenRow.user_id,
        },
        data: {
          is_verified: true,
        },
      });

      return user;
    });

    return result;
  }

  async issueSessionTokens(userId) {
    const accessToken = jwtService.generateAuthToken(
      {
        sub: userId,
        type: 'access',
      },
      authConfig.accessTokenExpiresIn
    );

    const refreshToken = jwtService.generateAuthToken(
      {
        sub: userId,
        type: 'refresh',
      },
      authConfig.refreshTokenExpiresIn
    );

    const refreshPayload = jwtService.verifyAuthToken(refreshToken);
    if (!refreshPayload?.jti || !refreshPayload?.exp) {
      throw new Error('Failed to generate refresh session token');
    }

    await prisma.auth_Session.create({
      data: {
        user_id: userId,
        refresh_token_hash: jwtService.hashToken(refreshToken),
        jti: refreshPayload.jti,
        expires_at: new Date(refreshPayload.exp * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async rotateRefreshToken(refreshToken) {
    const payload = jwtService.verifyAuthToken(refreshToken);
    if (!payload || payload.type !== 'refresh' || !payload.sub) {
      return null;
    }

    const refreshHash = jwtService.hashToken(refreshToken);

    const activeSession = await prisma.auth_Session.findUnique({
      where: {
        refresh_token_hash: refreshHash,
      },
    });

    if (!activeSession) {
      return null;
    }

    if (
      activeSession.revoked_at ||
      activeSession.expires_at.getTime() <= Date.now() ||
      activeSession.user_id !== payload.sub
    ) {
      return null;
    }

    const nextAccessToken = jwtService.generateAuthToken(
      {
        sub: payload.sub,
        type: 'access',
      },
      authConfig.accessTokenExpiresIn
    );

    const nextRefreshToken = jwtService.generateAuthToken(
      {
        sub: payload.sub,
        type: 'refresh',
      },
      authConfig.refreshTokenExpiresIn
    );

    const nextRefreshPayload = jwtService.verifyAuthToken(nextRefreshToken);
    if (!nextRefreshPayload?.jti || !nextRefreshPayload?.exp) {
      throw new Error('Failed to rotate refresh session token');
    }

    await prisma.$transaction(async (tx) => {
      await tx.auth_Session.update({
        where: {
          id: activeSession.id,
        },
        data: {
          revoked_at: new Date(),
        },
      });

      await tx.auth_Session.create({
        data: {
          user_id: payload.sub,
          refresh_token_hash: jwtService.hashToken(nextRefreshToken),
          jti: nextRefreshPayload.jti,
          expires_at: new Date(nextRefreshPayload.exp * 1000),
        },
      });
    });

    return {
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
      userId: payload.sub,
    };
  }

  async revokeRefreshToken(refreshToken) {
    const payload = jwtService.verifyAuthToken(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      return false;
    }

    const tokenHash = jwtService.hashToken(refreshToken);

    const result = await prisma.auth_Session.updateMany({
      where: {
        refresh_token_hash: tokenHash,
        revoked_at: null,
      },
      data: {
        revoked_at: new Date(),
      },
    });

    return result.count > 0;
  }

  verifyAccessToken(accessToken) {
    const payload = jwtService.verifyAuthToken(accessToken);

    if (!payload || payload.type !== 'access' || !payload.sub) {
      return null;
    }

    return payload;
  }

  normalizeSecret(value) {
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error('Invalid secret value');
    }

    return value;
  }
}

export default new AuthService();
