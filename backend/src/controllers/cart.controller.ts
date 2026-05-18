import { Response } from "express";
import Product from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js"
import Cart from "../models/cart.model.js";

// Add to Cart
export const addToCart = asyncHandler (async (req: any, res: Response ) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    if (product.stock < quantity) {
        res.status(400);
        throw new Error (`Only ${product.stock} items left in stock`);
    }

    const storeId = product.store;
    let cart = await Cart.findOne({ user: userId });

    if (cart) {
        if (cart.store.toString() !== storeId.toString()) {
            res.status(400);
            throw new Error("Cart contains items from another store. Please clear your cart first.");
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
            cart.items[itemIndex].price = product.price;
        } else {
            cart.items.push({ product: productId, quantity, price: product.price });
        }
    } else {
        cart = new Cart({
            user: userId,
            store: storeId,
            items: [{ product: productId, quantity, price: product.price }]
        });
    }

    await cart.save();
    res.status(200).json({ success: true, message: "Item added to cart", cart });
});

// Update Quantity
export const updateCartQuantity = asyncHandler(async (req: any, res: Response) => {
    const { productId, action } = req.body; // action: 'inc' or 'dec'
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        res.status(404);
        throw new Error("Cart not found");
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) {
        res.status(404);
        throw new Error("Item not in cart");
    }

    if (action === 'inc') {
        cart.items[itemIndex].quantity += 1;        
    } else if (action === 'dec') {
        if (cart.items[itemIndex].quantity > 1) {
            cart.items[itemIndex].quantity -= 1;
        } else {
            cart.items.splice(itemIndex, 1);
        }
    }

    // if items zero delete cart
    if (cart.items.length === 0){
        await Cart.findOneAndDelete({ user: userId });
        return res.status(200).json({ success: true, message: "Cart cleared", cart: null })
    }

    await cart.save();
    res.status(200).json({ success: true, message: "Quantity updated", cart });
});

// Remove from cart
export const removeFromCart = asyncHandler (async(req: any, res: Response) => {
    const { productId } = req.body;
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        res.status(404);
        throw new Error("Cart not found");
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);

    if(cart.items.length === 0) {
        await Cart.findOneAndDelete({ user: userId });
        return res.status(200).json({ success: true, message: "Cart Cleared" });
    }

    await cart.save();
    res.status(200).json({ success: true, message: "Item removed", cart });
});

// Get Cart
export const getCart = asyncHandler( async (req: any, res: Response) => {
    const cart = await Cart.findOne({ user: req.user._id })
        .populate("items.product", "name image price stock")
        .populate("store", "name location");

    if (!cart) {
        return res.status(200).json({ success: true, items: [], totalAmount: 0 });
    }

    res.status(200).json({ success: true, cart });
});

// Clear Cart
export const clearCart = asyncHandler( async (req: any, res: Response) => {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.status(200).json({ success: true, message: "Cart cleared successfully" });
});