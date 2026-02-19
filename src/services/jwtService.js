import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import authConfig from '../config/authConfig.js';

class JwtService {
  constructor() {
    this.secret = authConfig.jwtSecret;
  }

  generateToken(student_id, drive_id, expiresAt) {
    const payload = {
      student_id,
      drive_id,
    };

    const expiresIn = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

    const token = jwt.sign(
      { ...payload, jti: crypto.randomUUID() },
      this.secret,
      { expiresIn }
    );

    return token;
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.secret);
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  generateAuthToken(payload, expiresIn) {
    return jwt.sign(
      { ...payload, jti: crypto.randomUUID() },
      this.secret,
      { expiresIn }
    );
  }

  verifyAuthToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      return null;
    }
  }

  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // only for debugging purposes
  decodeToken(token) {
    try {
      const decoded = jwt.decode(token);
      return decoded;
    } catch (error) {
      console.error('Token decode failed:', error);
      return null;
    }
  }
}

export default new JwtService();