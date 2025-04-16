const mailer = require("nodemailer");

const sendMail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.Mailer_HOST,
        port: process.env.Mailer_PORT,
        secure: true, // true for port 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    const mailOpts = {
        from: `"Lody Shop App <Dopagrmaing@gmail.com>"`,
        to: options.email,
        subject: options.subject,
        text: options.message
    }
    await transporter.sendMail(mailOpts)
}

module.exports = sendMail