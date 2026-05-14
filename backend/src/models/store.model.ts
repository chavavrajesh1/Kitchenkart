import mongoose, { Schema, Model } from "mongoose";
import { IStore } from "../interfaces/store.interface";

const storeSchema = new Schema<IStore>({
    vendor: { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true },
    storeType: {
        type: String,
        enum: [
            'Veg-Restaurant',
            'NonVeg-Restaurant',
            'Kirana-Store',
            'Dairy-Items',
            'Sweets-Hots',
            'Vegetables',
            'Meat-Fish',
            'IceCream'
        ],
        required: true
    },
    description: { type: String, required: true },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    image: { type: String },
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },    
},{ timestamps: true });

const Store: Model<IStore> = mongoose.model<IStore>('Store', storeSchema);
export default Store;