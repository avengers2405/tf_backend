import { Router } from 'express';
import authController from '../controller/auth.controller.js';
import jwtAuth from '../middleware/jwtAuth.js';

const router = Router();

router.post('/register', (req, res) => authController.register(req, res));
router.post('/magic-link/request', (req, res) => authController.requestMagicLink(req, res));
router.get('/magic-link/verify', (req, res) => authController.verifyMagicLink(req, res));
router.post('/magic-link/verify', (req, res) => authController.verifyMagicLink(req, res));
router.get('/invite-magic/verify', (req, res) => authController.verifyInviteMagicLink(req, res));
router.post('/invite-magic/verify', (req, res) => authController.verifyInviteMagicLink(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refresh(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.get('/me', jwtAuth, (req, res) => authController.me(req, res));

export default router;
