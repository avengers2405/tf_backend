import jwtService from '../services/jwtService.js';

const jwtAuth = (req, res, next) => {
    const authorization = req.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
        res.status(401).json({ error: 'missing access token' });
        return;
    }

    const payload = jwtService.verifyAuthToken(token);

    if (!payload || payload.type !== 'access' || !payload.sub) {
        res.status(401).json({ error: 'invalid access token' });
        return;
    }

    req.user = payload;
    next();
};

export default jwtAuth;