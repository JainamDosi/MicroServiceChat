import mongoose from "mongoose";



const connectDB = async () => {
    const url = process.env.MONGO_URI;
    if (!url) {
        throw new Error("MONGO_URI is not defined");
    }

    try {
        await mongoose.connect(url, {
            dbName: "Chatappmicroservieapp"
        });
        console.log("Connected to MongoDB");
    }
    catch (error) {
        console.error("Error connecting to MongoDB", error);
        process.exit(1);
    }

}

export default connectDB;
