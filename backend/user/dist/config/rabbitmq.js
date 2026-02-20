import ampq from 'amqplib';
let channel;
export const connectRabbitMQ = async () => {
    try {
        const connection = await ampq.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USERNAME,
            password: process.env.RABBITMQ_PASSWORD,
        });
        channel = await connection.createChannel();
        console.log("Connected to RabbitMQ");
    }
    catch (error) {
        console.error("Error connecting to RabbitMQ", error);
        process.exit(1);
    }
};
//# sourceMappingURL=rabbitmq.js.map