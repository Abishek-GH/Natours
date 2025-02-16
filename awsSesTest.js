const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config({ path: `./config.env` });

// AWS SES Transporter
const transporter = nodemailer.createTransport({
  host: 'email-smtp.us-east-1.amazonaws.com', // Change if using another region
  port: 465, // Use 465 for SSL or 587 for TLS
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SES_ACCESS_KEY,
    pass: process.env.SES_SECRET_KEY,
  },
});

// Function to send email
async function sendTestEmail() {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: 'abishek3622@gmail.com', // Send to your verified email
    subject: '🎉 AWS SES Test Email',
    text: 'Hello Bro, this is a test email from AWS SES via Nodemailer!',
    html: '<h2>Hello Bro! 👋</h2><p>This is a <strong>test email</strong> from AWS SES using Nodemailer.</p>',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ AWS SES Email Sent Successfully:', info.messageId);
  } catch (error) {
    console.error('❌ AWS SES Failed:', error.message);
  }
}

// Call the function
sendTestEmail();
