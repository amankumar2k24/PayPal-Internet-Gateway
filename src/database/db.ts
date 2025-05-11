import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();

mongoose.set("strictQuery", false);

export const mongooseConnection = mongoose.connect(
    process.env.DB_URL, {}
).then(result => console.log('Database successfully connected')).catch(err => console.log(err));
