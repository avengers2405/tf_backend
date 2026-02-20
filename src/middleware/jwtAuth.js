import jwtService from '../services/jwtService.js';
import authConfig from '../config/authConfig.js';

const jwtAuth = (req, res, next) => {
    const cookieToken = req.cookies?.[authConfig.accessCookieName];
    const authorization = req.headers.authorization || '';
    const [scheme, bearerToken] = authorization.split(' ');
    const token = cookieToken || (scheme === 'Bearer' ? bearerToken : null);

    if (!token) {
        res.status(401).json({ error: 'missing access token' });
        return;
    }

    const payload = jwtService.verifyAuthToken(token);

    if (!payload || payload.type !== 'access' || !payload.sub) {
        res.status(401).json({ error: 'invalid access token', payload });
        return;
    }

    req.user = payload;
    next();
};

export default jwtAuth;