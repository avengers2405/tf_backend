import { PrismaClient } from '@prisma/client';
import jwtService from './jwtService.js';
import emailService from './emailService.js';

import prisma from '../db/prisma.js';

class DriveService {
  async createDrive(data) {
    try {
      const drive = await prisma.companyDrive.create({
        data: {
          company_name: data.company_name,
          min_cgpa: data.min_cgpa,
          registration_deadline: data.registration_deadline,
        },
      });

      await this.notifyEligibleStudents(
        drive.drive_id,
        drive.company_name,
        drive.min_cgpa,
        drive.registration_deadline
      );

      return drive.drive_id;
    } catch (error) {
      console.error('Failed to create drive:', error);
      throw error;
    }
  }

  async notifyEligibleStudents(
    drive_id,
    company_name,
    min_cgpa,
    registration_deadline
  ) {
    const eligibleStudents = await prisma.student_TNP.findMany({
      where: { cgpa: { gte: min_cgpa } }
    });

    console.log(`Found ${eligibleStudents.length} eligible students`);

    for (const student of eligibleStudents) {
      try {
        const token = jwtService.generateToken(
          student.student_id,
          drive_id,
          registration_deadline
        );

        const tokenHash = jwtService.hashToken(token);

        await prisma.driveResponse.create({
          data: {
            student_id: student.student_id,
            drive_id: drive_id,
            email_token_hash: tokenHash,
            token_expires_at: registration_deadline,
          },
        });

        const emailSent = await emailService.sendConfirmationEmail({
          student_email: student.email,
          student_name: student.name,
          company_name: company_name,
          token: token,
        });

        // Update email status
        if (emailSent) {
          await prisma.driveResponse.update({
            where: {
              student_id_drive_id: {
                student_id: student.student_id,
                drive_id: drive_id,
              },
            },
            data: {
              notification_sent_at: new Date(),
            },
          });
        }
      } catch (error) {
        console.error(`Failed to notify student ${student.student_id}:`, error);
      }
    }
  }
}

export default new DriveService();