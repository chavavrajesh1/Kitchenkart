import nodemailer from 'nodemailer';

const sendEmail = async (options: { email: string; subject: string; message: string; html?: string }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            // ఒకవేళ Gmail పని చేయకపోతే host/port కూడా వాడొచ్చు
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });

        const mailOptions = {
            from: `"KitchenKart" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html // ఒకవేళ HTML పంపాలనుకుంటే ఇది యూజ్ అవుతుంది
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);
        
    } catch (error) {
        console.error("Email sending failed:", error);
        // కావాలంటే ఇక్కడ error ని throw చేయొచ్చు
    }
};

export default sendEmail;