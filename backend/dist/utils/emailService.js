"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendWelcomeEmail = async (to, name) => {
    try {
        // Generate test SMTP service account from ethereal.email for local development
        // In production, this would use process.env.SMTP_HOST etc.
        let testAccount = await nodemailer_1.default.createTestAccount();
        let transporter = nodemailer_1.default.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        let info = await transporter.sendMail({
            from: '"Team Task Manager" <no-reply@taskmanager.local>',
            to,
            subject: "Welcome to Team Task Manager! 🚀",
            text: `Hi ${name},\n\nWelcome to Team Task Manager! We're thrilled to have you on board.\n\nGet started by creating your first project or joining an existing one.\n\nCheers,\nThe Task Manager Team`,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #3b82f6;">Welcome to Team Task Manager! 🚀</h2>
        <p>Hi <b>${name}</b>,</p>
        <p>We're thrilled to have you on board.</p>
        <p>Get started by creating your first project or joining an existing one so you can collaborate with your team efficiently!</p>
        <br>
        <p>Cheers,<br>The Task Manager Team</p>
      </div>`,
        });
        console.log("Welcome Email sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer_1.default.getTestMessageUrl(info));
        return info;
    }
    catch (error) {
        console.error("Error sending welcome email:", error);
    }
};
exports.sendWelcomeEmail = sendWelcomeEmail;
//# sourceMappingURL=emailService.js.map