const nodemailer = require('nodemailer');

// Nodemailer setup
const sendEmail = async (options) => {
  // 1) Create transporter (service that will send email like "gmail", "Mailgun", "mailtrap", "sendGrid")
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define email options (like from, to, subject, email content)
  const mailOptions = {
    from: 'Travel App <support@travelapp.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html,
  };

  // 3) Send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;