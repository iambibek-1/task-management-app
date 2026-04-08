# Email Setup Guide for TaskFlow

## Current Configuration

TaskFlow is currently configured to use **Ethereal Email** for development testing. This is a fake SMTP service that captures emails for testing purposes.

### Development Setup (Current)

The system is configured with these environment variables in `.env`:

```env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=verda.wiegand41@ethereal.email
SMTP_PASS=Wc32nnzRDMpae7gM7k
SMTP_FROM="TaskFlow <noreply@taskflow.com>"
```

### How to View Test Emails

1. When emails are sent in development, check the server console logs
2. Look for lines like: `📧 Preview URL: https://ethereal.email/message/...`
3. Click the preview URL to view the email in your browser
4. The email won't actually be delivered to real email addresses

## Production Email Setup

For production use, replace the Ethereal Email configuration with a real email service:

### Option 1: Gmail SMTP

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="TaskFlow <your-gmail@gmail.com>"
```

**Note:** You'll need to generate an App Password in your Google Account settings.

### Option 2: SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM="TaskFlow <noreply@yourdomain.com>"
```

### Option 3: Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
SMTP_FROM="TaskFlow <noreply@yourdomain.com>"
```

### Option 4: AWS SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-access-key
SMTP_PASS=your-ses-secret-key
SMTP_FROM="TaskFlow <noreply@yourdomain.com>"
```

## Email Features

TaskFlow sends emails for the following events:

### 1. Task Assignment Notifications
- Sent when a user is assigned to a new task
- Includes task title, description, and due date
- Sent to all assigned users

### 2. Task Completion Notifications
- Sent when a task is marked as completed
- Notifies other assigned users about the completion
- Includes who completed the task and when

### 3. Deadline Reminders (Future Feature)
- Can be configured to send reminders before due dates
- Color-coded based on urgency

## Testing Email Functionality

### Method 1: Use the Test Script

```bash
cd backend
npm run build
node dist/utils/testEmail.js
```

### Method 2: Create a Task in the Application

1. Start the backend server: `npm start`
2. Log in as an admin
3. Create a new task and assign it to a user
4. Check the server console for the preview URL
5. Visit the preview URL to see the email

## Troubleshooting

### Common Issues:

1. **"Missing credentials for PLAIN" error**
   - Check that SMTP_USER and SMTP_PASS are set correctly
   - Ensure no extra spaces in the .env file

2. **Connection timeout**
   - Verify SMTP_HOST and SMTP_PORT are correct
   - Check firewall settings

3. **Authentication failed**
   - For Gmail: Use App Password, not regular password
   - For other services: Verify API keys and credentials

4. **Emails not being sent**
   - Check server console logs for error messages
   - Verify the email service is being called in the code

### Debug Mode

The email service includes debug logging. Check the server console for detailed SMTP communication logs when emails are sent.

## Security Notes

- Never commit real email credentials to version control
- Use environment variables for all sensitive configuration
- Consider using app-specific passwords instead of main account passwords
- For production, use dedicated email services rather than personal accounts

## Future Enhancements

- Email templates with better styling
- Bulk email management
- Email delivery status tracking
- Unsubscribe functionality
- Email scheduling for reminders