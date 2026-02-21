const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  magicTokenExpiresIn: process.env.JWT_MAGIC_EXPIRES_IN || '10m',
  frontendUrl: process.env.FRONTEND_URL,
  authMagicLinkPath: process.env.AUTH_MAGIC_LINK_PATH,
  accessCookieName: process.env.AUTH_ACCESS_COOKIE_NAME || 'access_token',
  refreshCookieName: process.env.AUTH_REFRESH_COOKIE_NAME || 'refresh_token',
  roleCookieName: process.env.AUTH_ROLE_COOKIE_NAME || 'user_role',
  cookieSameSite: process.env.AUTH_COOKIE_SAMESITE || 'lax',
  isProduction: process.env.NODE_ENV === 'production',
  accessCookieMaxAgeMs: Number(process.env.AUTH_ACCESS_COOKIE_MAX_AGE_MS) || 15 * 60 * 1000,
  refreshCookieMaxAgeMs: Number(process.env.AUTH_REFRESH_COOKIE_MAX_AGE_MS) || 30 * 24 * 60 * 60 * 1000,
  getAccessCookieOptions() {
    return {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.cookieSameSite,
      path: '/',
      maxAge: this.accessCookieMaxAgeMs,
    };
  },
  getRefreshCookieOptions() {
    return {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.cookieSameSite,
      path: '/',
      maxAge: this.refreshCookieMaxAgeMs,
    };
  },
  getRoleCookieOptions() {
    return {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.cookieSameSite,
      path: '/',
      maxAge: this.refreshCookieMaxAgeMs,
    };
  },
};

export function validateAuthConfig() {
  const requiredEnvs = ['JWT_SECRET', 'FRONTEND_URL'];
  const missing = requiredEnvs.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required auth environment variables: ${missing.join(', ')}`
    );
  }
}

export default authConfig;