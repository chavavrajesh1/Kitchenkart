import { Response } from "express";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import sendEmail from "../utils/sendEmail.js";

// Place an order (ACID Transactions & Bulk Operations)
export const placeOrder = asyncHandler( async(req: any, res: Response ) => {
    const { address } = req.body;
    const userId = req.user._id;

    // Transaction Session Starts
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const cart = await Cart.findOne ({ user: userId }).session(session);
        if (!cart || cart.items.length === 0) {
            res.status(400);
            throw new Error("Your cart is empty");
        }

        const bulkOps = [];

        for (const item of cart.items) {
            const product = await Product.findById(item.product).session(session);

            if (!product || product.stock < item.quantity) {
                res.status(400);
                throw new Error(`Product ${product?.name || 'Unknown'} is out of stock`);
            }

            // Database Operations
            bulkOps.push({
                updateOne: {
                    filter: { _id: item.product },
                    update: { $inc: { stock: -item.quantity } },
                }
            });
        }

        await Product.bulkWrite(bulkOps, { session });

        const [order] = await Order.create([{
            user: userId,
            store: cart.store,
            items: cart.items,
            totalAmount: cart.totalAmount,
            address: address,
        }], { session });

        await Cart.findOneAndDelete({ user: userId }).session(session);

        await session.commitTransaction();
        session.endSession();

        sendEmail({
            email: req.user.email,
            subject: "Order Confirmed - KitchenKart",
            message: `Order Placed Successfully! ID: ${order._id}`,
            html: `<h2>Hi ${req.user.name}, Your order of ₹${order.totalAmount} is confirmed!</h2>`
        }).catch((mailErr) => console.error("Email Error:", mailErr.message));

        res.status(201).json({
            success: true,
            message: "Order Placed Successfully!",
            orderId: order._id,
            order
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        throw error;
    }
});

// Get Logged-in User Orders
export const getMyOrders = asyncHandler(async (req: any, res: Response) => {
    const orders = await Order.find({ user: req.user._id })
        .populate("store", "name location")
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
});

// Get single Order details
export const getOrderDetails = asyncHandler(async (req: any, res: Response) => {
    const order = await Order.findById(req.params.orderId)
        .populate("items.product", "name image price")
        .populate("store", "name location phone");

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    res.status(200).json({ success: true, order });
});

// Update Order Status (For Admin/Vendor)
export const updateOrderStatus = asyncHandler(async (req: any, res: Response) => {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
        req.params.orderId,
        { orderStatus: status },
        { new: true, runValidators: true }
    );

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    res.status(200).json({ success: true, message: "Order Status Updated", order });
});

// Get All Orders for a Specific Store (For Vendor Dashboard)
export const getStoreOrders = asyncHandler(async (req: any, res: Response) => {
    const { storeId } = req.params;
    const orders = await Order.find({ store: storeId })
        .populate("user", "name email phone")
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
})
