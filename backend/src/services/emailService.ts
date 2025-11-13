import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    // For development, you can use ethereal.email or mailtrap.io
    // For production, use your actual SMTP service
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendTaskAssignmentEmail(
    userEmail: string,
    userName: string,
    taskTitle: string,
    taskDescription: string,
    dueDate?: Date
  ): Promise<boolean> {
    try {
      const dueDateText = dueDate 
        ? `<p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>`
        : '';

      const mailOptions = {
        from: process.env.SMTP_FROM || '"Task Manager" <noreply@taskmanager.com>',
        to: userEmail,
        subject: `New Task Assigned: ${taskTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">New Task Assigned</h2>
            <p>Hi ${userName},</p>
            <p>You have been assigned a new task:</p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0f172a;">${taskTitle}</h3>
              <p style="color: #475569;">${taskDescription}</p>
              ${dueDateText}
            </div>
            <p>Please log in to the Task Manager to view more details and manage your tasks.</p>
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendBulkTaskAssignmentEmails(
    users: Array<{ email: string; firstName: string; lastName: string }>,
    taskTitle: string,
    taskDescription: string,
    dueDate?: Date
  ): Promise<void> {
    const emailPromises = users.map(user =>
      this.sendTaskAssignmentEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        taskTitle,
        taskDescription,
        dueDate
      )
    );

    await Promise.all(emailPromises);
  }
}
