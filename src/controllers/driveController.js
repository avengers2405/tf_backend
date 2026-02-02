import driveService from '../services/driveService.js';

class DriveController {
  async createDrive(req, res) {
    try {
      const { company_name, min_cgpa, registration_deadline } = req.body;

      if (!company_name || min_cgpa === undefined || !registration_deadline) {
        res.status(400).json({
          error: 'Missing required fields: company_name, min_cgpa, registration_deadline',
        });
        return;
      }

      if (min_cgpa < 0 || min_cgpa > 10) {
        res.status(400).json({ error: 'CGPA must be between 0 and 10' });
        return;
      }

      const deadlineDate = new Date(registration_deadline);
      if (deadlineDate <= new Date()) {
        res.status(400).json({ error: 'Registration deadline must be in the future' });
        return;
      }

      const drive_id = await driveService.createDrive({
        company_name,
        min_cgpa,
        registration_deadline: deadlineDate,
      });

      res.status(201).json({
        success: true,
        message: 'Company drive created and notifications sent',
        drive_id,
      });
    } catch (error) {
      console.error('Drive creation error:', error);
      res.status(500).json({ error: 'Failed to create drive' });
    }
  }
}

export default new DriveController();