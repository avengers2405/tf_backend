import express from "express";
import "dotenv/config";
import cors from 'cors';
//import {  mongoose, prisma } from './db/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/ping', (req, res) => {
    console.log("[INFO]: GET at '/ping'")

    res.send('pong', 200);
})

app.get('/health', async (req, res) => {
    console.log("[INFO]: GET at '/health'")
    console.log("[INFO]: Checking MongoDB connection...")
    const mongoState = mongoose.connection.readyState;
    if (mongoState===1) console.log("[INFO]: MongoDB connection is active");
    else console.log("[WARN]: MongoDB connection state is not active");

    console.log("[INFO]: Checking PostgreSQL connection...")
    // console.log("[DEBUG] query result: ", (await prisma.$queryRaw`SELECT 1 as result`)[0]);
    const { result } = (await prisma.$queryRaw`SELECT 1 as result`)[0];
    if (result===1) console.log("[INFO]: PostgreSQL connection is active");
    else console.log("[WARN]: PostgreSQL connection state is not active");

    res.send("Health Checks done. Check logs for more info.", 200);
})

app.listen(PORT, ()=>{
    console.log(`Backend flying on port ${PORT}`);
})

