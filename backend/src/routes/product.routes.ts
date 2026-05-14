import { Router } from "express";
import { isVendor, protect } from "../middleware/auth.middleware.js";
import { 
    addProduct, 
    bulkuploadProducts, 
    deleteProduct, 
    getAllProducts, 
    getProductsByStore, 
    updateProduct 
} from "../controllers/product.controller.js";
import { upload } from "../config/cloudinary.js"; // This is for Images
import multer from "multer"; // This is for local CSV handling

const router = Router();

// Local multer setup for CSV (Files will be stored temporarily in 'uploads' folder)
const localUpload = multer({ dest: 'uploads/' });

router.get('/all', getAllProducts);
router.get('/store/:storeId', getProductsByStore);

// Use 'upload' (Cloudinary) for single image
router.post('/add', protect, isVendor, upload.single('image'), addProduct);

// Use 'localUpload' (Multer Local) for CSV Bulk Upload
router.post('/bulk-upload', protect, isVendor, localUpload.single('file'), bulkuploadProducts);

router.put('/:productId', protect, isVendor, updateProduct);
router.delete('/:productId', protect, isVendor, deleteProduct);

export default router;