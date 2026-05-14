import Store from "../models/store.model.js"
import { Request,Response } from "express"

interface AuthRequest extends Request {
    user?: any; // ఇక్కడ req.user లో వచ్చే డేటా కోసం
}

export const addStore = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, storeType, description, address, contactNumber } = req.body

        const store = await Store.create({
            vendor: req.user._id,
            name,
            storeType,
            description,
            address,
            contactNumber
        });

        res.status(201).json({
            message: `${storeType} added successfully!`,
            store
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding store', error });
    }
};

export const getMyStores = async (req: AuthRequest, res: Response) => {
    try {
        const stores = await Store.find({ vendor: req.user._id });
        res.status(200).json(stores);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your stores'});
    }
};

export const getStores = async (req: Request, res: Response) => {
    try {
        const { search, type } = req.query;

        let query: any = { isVerified: true };

        if (type) {
            query.storeType = type;
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const stores = await Store.find(query);
        res.status(200).json(stores);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stores' });
    }
};

export const verifyStore = async (req: any, res: Response) => {
    try {
        const { storeId } = req.params;
        const { status } = req.body;

        const store = await Store.findByIdAndUpdate(
            storeId,
            { isVerified: status },
            { returnDocument: 'after' }
        );

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        res.status(200).json({ message: `Store verification status updated to ${status}`, store });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying store' });
    }
};