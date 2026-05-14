import Product from "../models/product.model.js"
import Store from "../models/store.model.js"
import { Response } from "express"
import { STORE_CATEGORY_MAP } from "../utils/appConstants.js";
import fs from 'fs';
import csv from "csv-parser";

export const addProduct = async (req: any, res: Response) => {
    try {
        const { name, description, price, category, storeId, stock } = req.body

        const store = await Store.findOne({ _id: storeId, vendor: req.user._id })

        if(!store) {
            return res.status(404).json({ message: 'Store not found or you are not the owner' });
        }

        const allowedCategories = STORE_CATEGORY_MAP[store.storeType];

        if(!allowedCategories || !allowedCategories.includes(category)) {
            return res.status(400).json({
                message: `Category '${category}' is not allowed for store type '${store.storeType}'`,
                allowedCategories
            });
        }

        const imageUrl = req.file ? req.file.path : "";

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

        res.status(201).json({
            message: 'Product added successfully!',
            product
        });
    } catch(error) {
        console.error("Error in addProduct:", error);
        res.status(500).json({ message: 'Error adding product' });
    }
};

export const getProductsByStore = async (req: any, res: Response) => {
    try {
        const { storeId } = req.params;
        const products = await Product.find({ store: storeId }).sort({ createdAt: -1 });
        res.status(200).json({
            count: products.length,
            products
        });
    } catch (error) {
        console.error("Error in getProductByStore:", error);
        res.status(500).json({ message: 'Error fetching products' });
    }
};

export const getAllProducts = async (req: any, res: Response) => {
    try {

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const { search, category, minPrice, maxPrice, storeId } = req.query;
        let queryObject: any = {};

        if (category) {
            queryObject.category = category;
        }

        if (storeId) {
            queryObject.store = storeId;
        }

        if (minPrice || maxPrice) {
            queryObject.price = {} ;
            if (minPrice) queryObject.price.$gte = Number(minPrice);
            if (maxPrice) queryObject.price.$lte = Number(maxPrice);
        }

        if (search) {
            queryObject.$text = { $search: search as string };
        }

        const products = await Product.find(queryObject)
            .populate("store", "name location storeType")
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
    } catch (error: any) {
        console.error("Error in getAllProducts:", error);
        res.status(500).json({ message: 'Error fetching products', error: error.message })
    }
};

export const deleteProduct = async (req: any, res: Response) => {
    try {
        const { productId } = req.params;

        const product = await Product.findOneAndDelete({
            _id: productId,
            vendor: req.user._id,
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found or unauthorized' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error("Error in deleteProduct:", error);
        res.status(500).json({ message: 'Error deleting product' });
    }
};

export const updateProduct = async (req: any, res: Response) => {
    try {
        const { productId } = req.params;
        const updates = req.body

        const product = await Product.findOneAndUpdate(
            { _id: productId, vendor: req.user._id },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found or unauthorized'})
        }

        res.status(200).json({ message: 'Product updated Successfully', product });
    } catch (error) {
        console.error("Error in updateProduct:", error);
        res.status(500).json({ message: 'Error updating product '});
    }
};

export const bulkuploadProducts = async (req: any, res: Response) => {
    try {
        const { storeId } = req.body;
        const vendorId = req.user._id;  

        const store = await Store.findOne({ _id: storeId, vendor: vendorId });
        if (!store) {
            return res.status(404).json({ message: 'Store not found or unauthorized' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a csv file' });
        }

        const products: any[] = [];
        const allowedCategories = STORE_CATEGORY_MAP[store.storeType];

        fs.createReadStream(req.file.path)
            .pipe(csv()) 
            .on('data', (row) => {
                if (allowedCategories.includes(row.category)) {
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
            .on('end', async () => {
                if (products.length === 0) { 
                    return res.status(400).json({ message: 'No Valid products found in CSV' });
                }

                await Product.insertMany(products);

                fs.unlinkSync(req.file.path);

                res.status(201).json({
                    message: `Successfully uploaded ${products.length} products!`,
                });
            })
    } catch (error) {
        console.error("Error in bulkUpload", error);
        res.status(500).json({ message: 'Error processing CSV file '});
    }
};