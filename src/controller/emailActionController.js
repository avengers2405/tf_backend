import jwtService from '../services/jwtService.js';

import prisma from '../db/prisma.js';

class EmailActionController {
  getFrontendBaseUrl() {
    return process.env.EMAIL_ACTION_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  buildStudentName(student) {
    return [student?.first_name, student?.last_name].filter(Boolean).join(' ').trim() || 'Student';
  }

  async confirmInterestByToken(token) {
    if (!token) {
      return {
        status: 400,
        payload: { error: 'Token is required' },
      };
    }

    const payload = jwtService.verifyToken(token);
    if (!payload) {
      return {
        status: 401,
        payload: { error: 'Invalid or expired token' },
      };
    }

    const { student_id, drive_id } = payload;
    const tokenHash = jwtService.hashToken(token);

    const driveResponse = await prisma.drive_Response.findUnique({
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
      return {
        status: 404,
        payload: { error: 'Drive response not found' },
      };
    }

    if (driveResponse.email_token_hash !== tokenHash) {
      return {
        status: 401,
        payload: { error: 'Token mismatch' },
      };
    }

    const studentName = this.buildStudentName(driveResponse.student);

    if (driveResponse.is_interested === true) {
      return {
        status: 200,
        payload: {
          message: 'You have already confirmed your interest',
          already_confirmed: true,
          student: studentName,
          company: driveResponse.drive.company_name,
        },
      };
    }

    await prisma.drive_Response.update({
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

    return {
      status: 200,
      payload: {
        message: 'Interest confirmed successfully',
        already_confirmed: false,
        student: studentName,
        company: driveResponse.drive.company_name,
      },
    };
  }

  async handleEmailConfirmation(req, res) {
    try {
      const token = req.query.token;
      const frontendBaseUrl = this.getFrontendBaseUrl();

      if (!token) {
        res.redirect(`${frontendBaseUrl}/email-action?error=missing_token`);
        return;
      }

      res.redirect(`${frontendBaseUrl}/email-action?token=${encodeURIComponent(token)}`);
    } catch (error) {
      console.error('Email action redirect error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async verifyEmailConfirmation(req, res) {
    try {
      const token = req.query.token;
      const result = await this.confirmInterestByToken(token);
      res.status(result.status).json(result.payload);
    } catch (error) {
      console.error('Email confirmation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new EmailActionController();