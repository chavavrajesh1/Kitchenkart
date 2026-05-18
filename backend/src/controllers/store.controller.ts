import { Request, Response } from "express";
import Store from "../models/store.model.js";
import asyncHandler from "../utils/asyncHandler.js";

interface AuthRequest extends Request {
    user?: any;
}

// Add a new Store
export const addStore = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, storeType, description, address, contactNumber } = req.body;

    const store = await Store.create({
        vendor: req.user._id,
        name,
        storeType,
        description,
        address,
        contactNumber
    });

    res.status(201).json({
        success: true,
        message: `${storeType} added successfully!`,
        store
    });
});

// Get All Stores Belonging to the Logged-in Vendor
export const getMyStores = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stores = await Store.find({ vendor: req.user._id });

    res.status(200).json({
        success: true,
        count: stores.length,
        stores
    });
});

// Get All Verified Stores (With Search & Type Filters for customers)
export const getStores = asyncHandler(async (req: Request, res: Response) => {
    const { search, type } = req.query;

    let query: any = { isVerified: true };

    if (type) {
        query.storeType = type;
    }

    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    const stores = await Store.find(query);

    res.status(200).json({
        success: true,
        count: stores.length,
        stores
    });
});

// Verify Store (Admin Action)
export const verifyStore = asyncHandler(async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const { status } = req.body;

    const store = await Store.findByIdAndUpdate(
        storeId,
        { isVerified: status },
        { new: true, runValidators: true }
    );

    if (!store) {
        res.status(404);
        throw new Error('Store not found');
    }

    res.status(200).json({
        success: true,
        message: `Store verification status updated to ${status}`,
        store
    });
}); 