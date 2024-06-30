const nodemailer = require('nodemailer');
const pug = require('pug');

const { convert } = require('html-to-text');



module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Abishek Kumar ${process.env.EMAIL_FROM}`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            return 1;
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
            // Activate in gmail "Less Secure App" option.
        });
    }


    // Send the actual email
    async send(template, subject) {

        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstNmae: this.firstName,
            url: this.url,
            subject: subject
        });

        // Defined the email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: html,
            text: convert(html)
        }

        await this.newTransport().sendMail(mailOptions);


    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token (valid for only 10 min)');
    }

}

