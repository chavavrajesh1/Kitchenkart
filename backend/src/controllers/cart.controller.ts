import { Response } from "express";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";

// 1. Add to Cart (కొత్త ఐటమ్ యాడ్ చేయడం లేదా క్వాంటిటీ పెంచడం)
export const addToCart = async (req: any, res: Response) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user._id;

        // ప్రొడక్ట్ ఉందో లేదో చెక్ చేయడం
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // స్టాక్ చెక్ చేయడం
        if (product.stock < quantity) {
            return res.status(400).json({ message: `Only ${product.stock} items left in stock` });
        }

        const storeId = product.store;
        let cart = await Cart.findOne({ user: userId });

        if (cart) {
            // వేరే స్టోర్ నుండి ఐటమ్ యాడ్ చేస్తుంటే ఎర్రర్ పంపడం
            if (cart.store.toString() !== storeId.toString()) {
                return res.status(400).json({
                    message: "Cart contains items from another store. Please clear your cart first.",
                    existingStore: cart.store
                });
            }

            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

            if (itemIndex > -1) {
                // ఆల్రెడీ కార్ట్‌లో ఉంటే క్వాంటిటీ అప్‌డేట్
                cart.items[itemIndex].quantity += quantity;
                cart.items[itemIndex].price = product.price; // లేటెస్ట్ ప్రైస్ అప్‌డేట్
            } else {
                // కొత్త ఐటమ్‌ని యాడ్ చేయడం
                cart.items.push({ product: productId, quantity, price: product.price });
            }
        } else {
            // కొత్త కార్ట్ క్రియేట్ చేయడం
            cart = new Cart({
                user: userId,
                store: storeId,
                items: [{ product: productId, quantity, price: product.price }]
            });
        }

        await cart.save();
        res.status(200).json({ message: "Item added to cart", cart });

    } catch (error: any) {
        console.error("Error in addToCart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 2. Update Quantity (క్వాంటిటీ పెంచడానికి/తగ్గించడానికి - '+', '-' బటన్స్ కోసం)
export const updateCartQuantity = async (req: any, res: Response) => {
    try {
        const { productId, action } = req.body; // action: 'inc' (పెంచడం) or 'dec' (తగ్గించడం)
        const userId = req.user._id;

        let cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex === -1) return res.status(404).json({ message: "Item not in cart" });

        if (action === 'inc') {
            cart.items[itemIndex].quantity += 1;
        } else if (action === 'dec') {
            if (cart.items[itemIndex].quantity > 1) {
                cart.items[itemIndex].quantity -= 1;
            } else {
                // క్వాంటిటీ 1 కన్నా తగ్గితే ఐటమ్‌ని తీసేయాలి
                cart.items.splice(itemIndex, 1);
            }
        }

        // ఐటమ్స్ అన్నీ అయిపోతే కార్ట్‌ని డిలీట్ చేయడం
        if (cart.items.length === 0) {
            await Cart.findOneAndDelete({ user: userId });
            return res.status(200).json({ message: "Cart cleared", cart: null });
        }

        await cart.save();
        res.status(200).json({ message: "Quantity updated", cart });
    } catch (error) {
        res.status(500).json({ message: "Error updating quantity" });
    }
};

// 3. Remove From Cart (ఒక ఐటమ్‌ని కార్ట్ నుండి పూర్తిగా తీసేయడం)
export const removeFromCart = async (req: any, res: Response) => {
    try {
        const { productId } = req.body;
        const userId = req.user._id;

        let cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = cart.items.filter(item => item.product.toString() !== productId);

        if (cart.items.length === 0) {
            await Cart.findOneAndDelete({ user: userId });
            return res.status(200).json({ message: "Cart cleared" });
        }

        await cart.save();
        res.status(200).json({ message: "Item removed", cart });
    } catch (error) {
        res.status(500).json({ message: "Error removing items" });
    }
};

// 4. Get Cart (యూజర్ కార్ట్ వివరాలను చూడటానికి)
export const getCart = async (req: any, res: Response) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id })
            .populate("items.product", "name image price stock") // ప్రొడక్ట్ డీటెయిల్స్ తో పాటు
            .populate("store", "name location");

        if (!cart) return res.status(200).json({ items: [], totalAmount: 0 });

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: "Error fetching cart" });
    }
};

// 5. Clear Cart (మొత్తం కార్ట్‌ని ఒకేసారి క్లియర్ చేయడానికి)
export const clearCart = async (req: any, res: Response) => {
    try {
        await Cart.findOneAndDelete({ user: req.user._id });
        res.status(200).json({ message: "Cart cleared successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error clearing cart" });
    }
};