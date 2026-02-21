import jwtService from '../services/jwtService.js';
import authConfig from '../config/authConfig.js';
import logger from '../services/logger.js';
import prisma from '../db/prisma.js';

const jwtAuth = async (req, res, next) => {
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
    logger.info("payload: ", payload);

    // Check if user role is student and attach student details
    if (req.cookies.user_role === 'student') {
        try {
            const student = await prisma.student.findUnique({
                where: {
                    user_id: payload.sub
                },
                select: {
                    registration_number: true
                }
            });

            if (student) {
                req.student = {
                    registration_number: student.registration_number
                };
            } else {
                throw new Error('Student details not found for user ID: ' + payload.sub);
            }
        } catch (error) {
            logger.error("Error fetching student details:", error);
            res.status(401).json({ error: 'invalid jwt, student details not found despite cookies saying that this is a student role'});
            return;
        }
    } else if (req.cookies.user_role === 'teacher') {
        try {
            const teacher = await prisma.teacher.findUnique({
                where: {
                    user_id: payload.sub
                },
                select: {
                    id: true
                }
            });

            if (teacher) {
                req.teacher = {
                    id: teacher.id
                };
            } else {
                throw new Error('Teacher details not found for user ID: ' + payload.sub);
            }
        } catch (error) {
            logger.error("Error fetching teacher details:", error);
            res.status(401).json({ error: 'invalid jwt, teacher details not found despite cookies saying that this is a teacher role'});
            return;
        }
    }

    next();
};

export default jwtAuth;