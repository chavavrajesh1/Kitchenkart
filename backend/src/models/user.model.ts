import mongoose, { Model, Schema } from "mongoose";
import { IUser } from "../interfaces/user.interface.js";


const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'customer', 'vendor'],
    },
    PhoneNumber: { type: String },
}, { timestamps: true });

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;