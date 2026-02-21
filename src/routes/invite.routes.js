import { Router } from 'express';
import jwtAuth from '../middleware/jwtAuth.js';
import requireRole from '../middleware/requireRole.js';
import inviteController from '../controller/invite.controller.js';

const router = Router();

// Only TNP users can send magic link invites
router.post('/magic/send', jwtAuth, requireRole('tnp'), (req, res) => inviteController.sendMagicInvites(req, res));

export default router;
