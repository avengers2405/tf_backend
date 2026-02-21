import authService from '../services/authService.js';

class InviteController {
  normalizeEmails(emails) {
    const list = Array.isArray(emails) ? emails : [];

    return [...new Set(
      list
        .map((email) => String(email ?? '').trim().toLowerCase())
        .filter((email) => email.length > 0)
    )];
  }

  async sendMagicInvites(req, res) {
    try {
      const { emails, custom_message, expires_at } = req.body;
      const normalizedEmails = this.normalizeEmails(emails);

      if (normalizedEmails.length === 0) {
        res.status(400).json({ error: 'emails array is required' });
        return;
      }

      if (normalizedEmails.length > 200) {
        res.status(400).json({ error: 'maximum 200 emails allowed per request' });
        return;
      }

      const expiresAt = new Date(expires_at);
      if (!expires_at || Number.isNaN(expiresAt.getTime())) {
        res.status(400).json({ error: 'valid expires_at is required' });
        return;
      }

      if (expiresAt.getTime() <= Date.now()) {
        res.status(400).json({ error: 'expires_at must be in the future' });
        return;
      }

      const createdByUserId = req.user?.sub || null;

      const results = await authService.issueInviteMagicLinks({
        emails: normalizedEmails,
        message: custom_message ? String(custom_message).trim() : undefined,
        expiresAt,
        createdByUserId,
        targetRole: 'recruiter', // For now, only recruiter invites
      });

      const sentCount = results.filter((item) => item.status === 'sent').length;
      const failedCount = results.length - sentCount;

      res.status(200).json({
        message: 'invite processing completed',
        expires_at: expiresAt.toISOString(),
        sent: sentCount,
        failed: failedCount,
        results,
      });
    } catch (error) {
      console.error('Send invite magic-link error:', error);
      res.status(500).json({ error: 'internal server error' });
    }
  }
}

export default new InviteController();
