import { Response } from "express";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import sendEmail from "../utils/sendEmail.js";

// 1. Place Order (ఆర్డర్ ప్లేస్ చేయడం)
export const placeOrder = async (req: any, res: Response) => {
    try {
        const { address } = req.body;
        const userId = req.user._id;

        // యూజర్ కార్ట్‌ని తీసుకురావడం
        const cart = await Cart.findOne({ user: userId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Your cart is empty" });
        }

        // స్టాక్ చెక్ చేయడం (వాలిడేషన్)
        for (const item of cart.items) {
            const product = await Product.findById(item.product);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Product ${product?.name || 'Unknown'} is out of stock or insufficient quantity`
                });
            }
        }

        // స్టాక్ తగ్గించడం (BulkWrite ఆపరేషన్ - మోస్ట్ ఎఫీషియంట్)
        const bulkOps = cart.items.map((item) => ({
            updateOne: {
                filter: { _id: item.product },
                update: { $inc: { stock: -item.quantity } },
            },
        }));
        await Product.bulkWrite(bulkOps);

        // ఆర్డర్ క్రియేట్ చేయడం
        const order = await Order.create({
            user: userId,
            store: cart.store,
            items: cart.items,
            totalAmount: cart.totalAmount,
            address: address,
        });

        // కార్ట్‌ని క్లియర్ చేయడం
        await Cart.findOneAndDelete({ user: userId });

        // కస్టమర్‌కి ఈమెయిల్ పంపడం
        try {
            const emailHtml = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; border: 1px solid #e0e0e0; padding: 20px;">
                    <h2 style="color: #2e7d32;">Kitchen Kart - ఆర్డర్ కన్ఫర్మ్ అయింది! 🛒</h2>
                    <p>నమస్కారం <b>${req.user.name}</b>,</p>
                    <p>మీ ఆర్డర్ విజయవంతంగా మాకు అందింది. త్వరలోనే మీ ఇంటికి ఫ్రెష్ కూరగాయలు డెలివరీ చేయబడతాయి.</p>
                    <hr style="border: 0; border-top: 1px solid #eee;">
                    <p><b>ఆర్డర్ ఐడి:</b> ${order._id}</p>
                    <p><b>మొత్తం ధర:</b> ₹${order.totalAmount}</p>
                    <p><b>డెలివరీ అడ్రస్:</b> ${address}</p>
                    <hr style="border: 0; border-top: 1px solid #eee;">
                    <p>Kitchen Kartని ఎంచుకున్నందుకు ధన్యవాదాలు!</p>
                </div>
            `;

            await sendEmail({
                email: req.user.email,
                subject: "Order Confirmed - Kitchen Kart 🛒",
                message: `Order placed successfully! Order ID: ${order._id}`,
                html: emailHtml
            });
        } catch (emailError) {
            console.error("Confirmation email failed:", emailError);
        }

        res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            orderId: order._id,
            order
        });

    } catch (error: any) {
        console.error("Order Placement Error:", error);
        res.status(500).json({ message: "Error placing order", error: error.message });
    }
};

// 2. Get My Orders (యూజర్ తన ఆర్డర్లను చూసుకోవడానికి)
export const getMyOrders = async (req: any, res: Response) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate("store", "name location")
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders" });
    }
};

// 3. Get Order Details (ఒక ఆర్డర్ పూర్తి వివరాలు)
export const getOrderDetails = async (req: any, res: Response) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate("items.product", "name image price")
            .populate("store", "name location phone");

        if (!order) return res.status(404).json({ message: "Order not found" });
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: "Error fetching order details" });
    }
};

// 4. Update Order Status (వెండర్ కోసం - ఆర్డర్ స్టేటస్ మార్చడానికి)
export const updateOrderStatus = async (req: any, res: Response) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.orderId,
            { orderStatus: status },
            { new: true, runValidators: true }
        );

        if (!order) return res.status(404).json({ message: "Order not found" });

        res.status(200).json({ message: "Order status updated", order });
    } catch (error) {
        res.status(500).json({ message: "Error updating status" });
    }
};

// 5. Get Store Orders (వెండర్ తన స్టోర్‌కి వచ్చిన ఆర్డర్లను చూడటానికి)
export const getStoreOrders = async (req: any, res: Response) => {
    try {
        const { storeId } = req.params;
        const orders = await Order.find({ store: storeId })
            .populate("user", "name email phone")
            .sort({ createdAt: -1 });
        
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching store orders" });
    }
};