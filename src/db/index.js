import prisma from './prisma.js';

res = await prisma.user.findMany({ take: 5 });
console.log("[DEBUG]: Users in PostgreSQL:", JSON.stringify(res), "\n\n");

export { prisma };