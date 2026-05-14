import mongoose, { Document, Schema } from 'mongoose';
// Constants నుండి PRODUCT_CATEGORIES ని ఇంపోర్ట్ చేయండి
import { PRODUCT_CATEGORIES } from '../utils/appConstants.js'; 

export interface IProduct extends Document {
    store: mongoose.Types.ObjectId;
    vendor: mongoose.Types.ObjectId;
    name: string;
    description: string;
    price: number;
    category: typeof PRODUCT_CATEGORIES[number]; // TypeScript type safety కోసం
    image: string;
    isAvailable: boolean;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema: Schema = new Schema({
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    vendor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    category: {
        type: String,
        required: true,
        // నేరుగా Constants లోని అరేని ఇక్కడ వాడుతున్నాం
        enum: PRODUCT_CATEGORIES 
    },
    image: {
        type: String,
        default: ""
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    stock: {
        type: Number,
        default: 10
    }    
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

productSchema.index({ name: 'text', description: 'text'});

productSchema.virtual('availableStatus').get(function(this: IProduct) {
    return this.stock > 0;
});

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;