import mongoose from 'mongoose';
import { LogModel } from './models/logs.js';
import "dotenv/config";

mongoose.connect(process.env.MONGO_URL).then(async () => {
    console.log("[INFO]: Connected to MongoDB");

    await LogModel.insertOne({
        message: "MongoDB connection established",
        level: "info",
    })
}).catch(err => {
    console.error("[ERROR]: MongoDB connection error:", err);
});

export default mongoose;