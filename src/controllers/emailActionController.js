import { PrismaClient } from '@prisma/client';
import jwtService from '../services/jwtService.js';

import prisma from '../db/prisma.js';

class EmailActionController {
  async handleEmailConfirmation(req, res) {
    try {
      const token = req.query.token;

      if (!token) {
        res.status(400).json({ error: 'Token is required' });
        return;
      }

      const payload = jwtService.verifyToken(token);
      if (!payload) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }

      const { student_id, drive_id } = payload;

      const tokenHash = jwtService.hashToken(token);

      const driveResponse = await prisma.driveResponse.findUnique({
        where: {
          student_id_drive_id: {
            student_id,
            drive_id,
          },
        },
        include: {
          drive: true,
          student: true,
        },
      });

      if (!driveResponse) {
        res.status(404).json({ error: 'Drive response not found' });
        return;
      }

      if (driveResponse.email_token_hash !== tokenHash) {
        res.status(401).json({ error: 'Token mismatch' });
        return;
      }

      if (driveResponse.is_interested !== null) {
        res.status(200).json({
          message: 'You have already confirmed your interest',
          student: driveResponse.student.name,
          company: driveResponse.drive.company_name,
        });
        return;
      }

      await prisma.driveResponse.update({
        where: {
          student_id_drive_id: {
            student_id,
            drive_id,
          },
        },
        data: {
          is_interested: true,
          responded_at: new Date(),
        },
      });

      res.status(200).json({
        message: 'Interest confirmed successfully',
        student: driveResponse.student.name,
        company: driveResponse.drive.company_name,
      });
    } catch (error) {
      console.error('Email confirmation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new EmailActionController();