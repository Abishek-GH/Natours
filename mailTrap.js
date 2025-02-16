const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config({ path: `./config.env` });

console.log(process.env.EMAIL_PORT);
async function testMailtrap() {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'Abishek Kumar <abishek3622@gmail.com>',
    to: 'test@example.com',
    subject: 'Mailtrap Test',
    text: 'This is a test email from Mailtrap.',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Mailtrap Test Success:', info.messageId);
  } catch (error) {
    console.error('❌ Mailtrap Test Failed:', error.message);
  }
}

testMailtrap();
