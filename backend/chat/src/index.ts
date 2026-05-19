import express from 'express'
import dotenv from 'dotenv'
import connectDB from './Config/db.js';
import chatRoutes from './routes/chat.js'
dotenv.config();

const app = express();
app.use(express.json());

connectDB();

app.use('/api/v1', chatRoutes);
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})