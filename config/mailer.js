const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAILHOST,
    port: process.env.EMAILPORT,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAILPASS,
    },
});



transporter.verify((error, success) => {
    if (error) {
        console.log("Error:", error);
    } else {
        console.log("Server is ready to take our messages");
    }
});


async function sendEmail(email, subject, text) {
    try {
        let info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: subject,
            text: text,
            html:text
        });
        console.log('Message sent: %s', info.messageId);

        return info.messageId;
    } catch (error) {
        console.error('Error occurred while sending email:', error.message);
        throw error;
    }
}

module.exports = {transporter,sendEmail};