import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import { createClient } from 'redis';
import UserRoutes from './routes/user.js'
import { connectRabbitMQ } from './config/rabbitmq.js'
import cors from 'cors'
dotenv.config()

connectDB();

connectRabbitMQ();

export const redisClient = createClient({
    url: process.env.REDIS_URL as string,
});

redisClient.connect().then(() => {
    console.log("Connected to Redis");
}).catch((error) => {
    console.error("Error connecting to Redis", error);
    process.exit(1);
});

const app = express()
app.use(express.json());
app.use(cors());
const port = process.env.PORT;

app.use("/api/v1", UserRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})