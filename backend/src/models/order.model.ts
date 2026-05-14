import mongoose, { Schema } from "mongoose";

export interface IOrder extends Document {
    user: mongoose.Types.ObjectId;
    store: mongoose.Types.ObjectId;
    items: {
        product: mongoose.Types.ObjectId;
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    address: string;
    paymentStatus: "Pending" | "Completed" | "Failed";
    orderStatus: "Placed" | "Confirmed" | "Preparing" | "Out for Delivery" | "Delivered" | "Cancelled";
}

const orderSchema = new Schema<IOrder>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        store: { type: Schema.Types.ObjectId, ref: "Store", required: true },
        items: [
            {
                product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
            },
        ],
        totalAmount: { type: Number, required: true },
        address: { type: String, required: true },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Completed", "Failed"],
            default: "Pending",
        },
        orderStatus: {
            type: String,
            enum: ["Placed", "Confirmed", "Preparing", "Out for Delivery","Delivered", "Cancelled"],
            default: "Placed",
        },
    },
    { timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", orderSchema);
export default Order;