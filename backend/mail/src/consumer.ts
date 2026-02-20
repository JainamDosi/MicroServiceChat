import amqp from 'amqplib'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config();

export const startSendOtpConsumer = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USERNAME,
            password: process.env.RABBITMQ_PASSWORD,
        });
        const channel = await connection.createChannel();
        console.log("Connected to RabbitMQ for mail service");

        await channel.assertQueue("send-otp", { durable: true });
        channel.consume("send-otp", async (msg) => {
            if (msg) {
                try {
                    const { to, subject, body } = JSON.parse(msg.content.toString());

                    const transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 465,
                        auth: {
                            user: process.env.SMTP_USER,
                            pass: process.env.SMTP_PASS,
                        },
                    });
                    await transporter.sendMail({
                        from: "Chat app",
                        to,
                        subject,
                        text: body,
                    });
                    console.log("Email sent successfully");
                    channel.ack(msg);
                }
                catch (error) {
                    console.error("Error in send otp consumer from nodemailer", error);
                }
            }
        });
    }
    catch (error) {
        console.error("Error in send otp consumer", error);
    }
}