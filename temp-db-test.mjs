import "dotenv/config"; import { db } from "./lib/db"; try { await db.$connect(); console.log("connected"); await db.$disconnect(); } catch (error) { console.error(error); process.exit(1); }
