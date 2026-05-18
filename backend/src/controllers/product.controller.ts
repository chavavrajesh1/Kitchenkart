import Product from "../models/product.model.js";
import Store from "../models/store.model.js";
import { STORE_CATEGORY_MAP } from "../utils/appConstants.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Request, Response } from "express"
import fs from "fs";
import csv from "csv-parser";

// Add Single Product
export const addProduct = asyncHandler(async (req: any, res: Response) => {
    const { name, description, price,category, storeId, stock } = req.body;

    const store = await Store.findOne({ _id: storeId, vendor: req.user._id });
    if (!store) {
        res.status(404);
        throw new Error('Store not found or you are not the owner');
    }

    const allowedCategories = STORE_CATEGORY_MAP[store.storeType];
    if (!allowedCategories || !allowedCategories.includes(category)) {
        res.status(400);
        throw new Error(`Category '${category}' is not allowed for store type '${store.storeType}'`);
    }

    const imageUrl = req.file ? req.file.path : "" ;

    const product = await Product.create({
        store: storeId,
        vendor: req.user._id,
        name,
        description,
        price,
        category,
        stock: stock || 10,
        image: imageUrl
    });

    res.status(201). json({ success: true, message: 'Product addes successfully!', product });
});

// Get Products by Store
export const getProductsByStore = asyncHandler(async (req: any, res: Response) => {
    const { storeId } = req.params;
    const products = await Product.find({ store: storeId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: products.length, products });
});

// Get All Products (Witeh Filter, Search & Pagination)
export const getAllProducts = asyncHandler(async (req: any, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const { search, category, minPrice, maxPrice, storeId } = req.query;
    let queryObject: any = {};

    if (category) queryObject.category = category;
    if (storeId) queryObject.store = storeId;

    if (minPrice || maxPrice) {
        queryObject.price = {};
        if (minPrice) queryObject.price.$gte = Number(minPrice);
        if (maxPrice) queryObject.price.$lte = Number(maxPrice);
    }

    if (search) {
        queryObject.$text = { $search: search as string };
    }

    const products = await Product.find(queryObject)
        .populate("store", "name location storeType" )
        .sort(search ? { score: { $meta: "textScore" } } : { createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalProducts = await Product.countDocuments(queryObject);

    res.status(200).json({
        success: true,
        meta: {
            totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            limit
        },
        products
    });
});

// Delete Product
export const deleteProduct = asyncHandler(async (req: any, res: Response) => {
    const { productId } = req.params;

    const product = await Product.findOneAndDelete({
        _id: productId,
        vendor: req.user._id,
    });

    if (!product) {
        res.status(404);
        throw new Error('Product not found or unauthorized');
    }

    res.status(200).json({ success: true, message: 'Product deleted Successfully' });
});

// Update Product
export const updateProduct = asyncHandler(async (req: any, res: Response) => {
    const { productId } = req.params;
    const updates = req.body;
    
    const product = await Product.findOneAndUpdate(
        { _id: productId, vendor: req.user._id },
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!product) {
        res.status(404);
        throw new Error('Product not found or unauthorized')
    }

    res.status(200).json({ success: true, message: 'Product updated Successfully', product });
});

// Bulk Upload products via CSV
export const bulkuploadProducts = asyncHandler( async (req: any, res: Response, next: any) => {
    const { storeId } = req.body;
    const vendorId = req.user._id;

    const store = await Store.findOne({ _id: storeId, vendor: vendorId });
    if (!store) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(404);
        throw new Error('Store not found or unauthorized');
    }

    if (!req.file) {
        res.status(400);
        throw new Error('Please upload a csv file');
    }

    const products: any[] = [];
    const allowedCategories = STORE_CATEGORY_MAP[store.storeType];

    // CSV Parsing Stream Logic
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
            if (allowedCategories && allowedCategories.includes(row.category)) {
                products.push({
                    name: row.name,
                    description: row.description,
                    price: Number(row.price),
                    category: row.category,
                    stock: Number(row.stock) || 0,
                    store: storeId,
                    vendor: vendorId,
                    image: ""
                });
            }
        })
        .on ('error', (streamErr: any) => {
            if (req.file) fs.unlinkSync(req.file.path);
            next(streamErr);
        })
        .on ('end', async () => {
            try {
                if (products.length === 0) {
                    if (req.file) fs.unlinkSync(req.file.path);
                    res.status(400);
                    return next(new Error('No Valid Products found in CSV or categories mismatched'));
                }

                await Product.insertMany(products);
                if (req.file) fs.unlinkSync(req.file.path);

                res.status(201).json({
                    success: true,
                    message: `Successfully Uploaded ${products.length} products!`,
                });
            } catch (dbErr) {
                if (req.file) fs.unlinkSync(req.file.path);
                next(dbErr);
            }
        })
});