import { Schema } from "mongoose";

export interface IStore {
    vendor: Schema.Types.ObjectId;
    name: string;
    storeType:
        | 'Veg-Restaurant'
        | 'NonVeg-Restaurant'
        | 'Kirana-Store'
        | 'Dairy-Items'
        | 'Sweets-Hots'
        | 'Vegetables'
        | 'Meat-Fish'
        | 'IceCream';
    description: string;
    address: string;
    contactNumber: string;
    image?: string;
    isVerified: boolean;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
}