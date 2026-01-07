import express from "express";
import "dotenv/config";
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/ping', (req, res) => {
    console.log("[INFO]: GET at '/ping'")
    res.send('pong', 200);
})

app.listen(PORT, ()=>{
    console.log(`Backend flying on port ${PORT}`);
})