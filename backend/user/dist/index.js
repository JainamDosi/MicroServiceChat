import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { createClient } from 'redis';
import UserRoutes from './routes/user.js';
import { connectRabbitMQ } from './config/rabbitmq.js';
dotenv.config();
connectDB();
connectRabbitMQ();
export const redisClient = createClient({
    url: process.env.REDIS_URL,
});
redisClient.connect().then(() => {
    console.log("Connected to Redis");
}).catch((error) => {
    console.error("Error connecting to Redis", error);
    process.exit(1);
});
const app = express();
const port = process.env.PORT;
app.use("/api/v1", UserRoutes);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=index.js.map