const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  magicTokenExpiresIn: process.env.JWT_MAGIC_EXPIRES_IN || '10m',
  frontendUrl: process.env.FRONTEND_URL,
  authMagicLinkPath: process.env.AUTH_MAGIC_LINK_PATH 
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