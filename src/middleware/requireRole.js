import logger from '../services/logger.js';

/**
 * Middleware to check if user has required role
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 */
const requireRole = (allowedRoles) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    return (req, res, next) => {
        const userRole = req.cookies?.user_role;
        
        if (!userRole) {
            logger.warning(`Access denied: No role found in cookies for user ${req.user?.sub}`);
            res.status(403).json({ 
                error: 'Access denied',
                message: 'User role not found'
            });
            return;
        }
        
        if (!roles.includes(userRole)) {
            logger.warn(`Access denied: User ${req.user?.sub} with role ${userRole} attempted to access resource requiring roles: ${roles.join(', ')}`);
            res.status(403).json({ 
                error: 'Access denied',
                message: `Only ${roles.join(' or ')} users can perform this action`
            });
            return;
        }
        
        next();
    };
};

export default requireRole;
