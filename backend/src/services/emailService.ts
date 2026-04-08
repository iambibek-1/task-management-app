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
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      debug: true, // Enable debug output
      logger: true // Log to console
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('✅ Email server connection verified successfully');
    } catch (error) {
      console.error('❌ Email server connection failed:', error);
      console.log('Email configuration:');
      console.log('- Host:', process.env.SMTP_HOST);
      console.log('- Port:', process.env.SMTP_PORT);
      console.log('- User:', process.env.SMTP_USER);
      console.log('- Pass:', process.env.SMTP_PASS ? '***configured***' : 'NOT SET');
    }
  }

  async sendTaskAssignmentEmail(
    userEmail: string,
    userName: string,
    taskTitle: string,
    taskDescription: string,
    dueDate?: Date
  ): Promise<boolean> {
    try {
      console.log(`📧 Attempting to send email to: ${userEmail}`);
      
      const dueDateText = dueDate 
        ? `<p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>`
        : '';

      const mailOptions = {
        from: process.env.SMTP_FROM || '"TaskFlow" <noreply@taskflow.com>',
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
            <p>Please log in to TaskFlow to view more details and manage your tasks.</p>
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      
      // For Ethereal Email, log the preview URL
      if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return false;
    }
  }

  async sendTaskCompletionEmail(
    userEmail: string,
    userName: string,
    taskTitle: string,
    completedBy: string
  ): Promise<boolean> {
    try {
      console.log(`📧 Attempting to send completion email to: ${userEmail}`);
      
      const mailOptions = {
        from: process.env.SMTP_FROM || '"TaskFlow" <noreply@taskflow.com>',
        to: userEmail,
        subject: `Task Completed: ${taskTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Task Completed</h2>
            <p>Hi ${userName},</p>
            <p>A task has been completed:</p>
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="margin-top: 0; color: #0f172a;">${taskTitle}</h3>
              <p style="color: #475569;">Completed by: <strong>${completedBy}</strong></p>
              <p style="color: #475569;">Completed at: <strong>${new Date().toLocaleString()}</strong></p>
            </div>
            <p>Please log in to TaskFlow to view the completion details.</p>
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Completion email sent successfully:', info.messageId);
      
      // For Ethereal Email, log the preview URL
      if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error sending completion email:', error);
      return false;
    }
  }

  async sendBulkTaskAssignmentEmails(
    users: Array<{ email: string; firstName: string; lastName: string }>,
    taskTitle: string,
    taskDescription: string,
    dueDate?: Date
  ): Promise<void> {
    console.log(`📧 Sending bulk emails to ${users.length} users`);
    
    const emailPromises = users.map(user =>
      this.sendTaskAssignmentEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        taskTitle,
        taskDescription,
        dueDate
      )
    );

    try {
      const results = await Promise.allSettled(emailPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      console.log(`📧 Bulk email results: ${successful} successful, ${failed} failed`);
      
      // Log failed emails
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`❌ Failed to send email to ${users[index].email}:`, result.reason);
        }
      });
    } catch (error) {
      console.error('❌ Error in bulk email sending:', error);
    }
  }

  async sendDeadlineReminderEmail(
    userEmail: string,
    userName: string,
    taskTitle: string,
    dueDate: Date
  ): Promise<boolean> {
    try {
      console.log(`📧 Attempting to send deadline reminder to: ${userEmail}`);
      
      const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      const urgencyColor = daysUntilDue <= 1 ? '#ef4444' : daysUntilDue <= 3 ? '#f59e0b' : '#3b82f6';
      
      const mailOptions = {
        from: process.env.SMTP_FROM || '"TaskFlow" <noreply@taskflow.com>',
        to: userEmail,
        subject: `Deadline Reminder: ${taskTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${urgencyColor};">Deadline Reminder</h2>
            <p>Hi ${userName},</p>
            <p>This is a reminder about an upcoming deadline:</p>
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${urgencyColor};">
              <h3 style="margin-top: 0; color: #0f172a;">${taskTitle}</h3>
              <p style="color: #475569;"><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
              <p style="color: #475569;"><strong>Days remaining:</strong> ${daysUntilDue} day(s)</p>
            </div>
            <p>Please log in to TaskFlow to update the task status.</p>
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Deadline reminder sent successfully:', info.messageId);
      
      // For Ethereal Email, log the preview URL
      if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error sending deadline reminder:', error);
      return false;
    }
  }
}