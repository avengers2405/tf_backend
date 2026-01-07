import mongoose from './mongo.js';
import prisma from './prisma.js';

var res = await mongoose.model('Log').find().sort({ _id: -1 }).limit(5);
console.log("[DEBUG]: Last 5 Logs in MongoDB:", JSON.stringify(res), "\n\n");

res = await prisma.user.findMany();
console.log("[DEBUG]: Users in PostgreSQL:", JSON.stringify(res), "\n\n");

export { mongoose, prisma };