import { Router } from "express";
import { isAdmin, isVendor, protect } from "../middleware/auth.middleware";
import { addStore, getMyStores, getStores, verifyStore } from "../controllers/store.controller";

const router = Router();

router.post('/add', protect, isVendor, addStore);
router.get('/mystores', protect, isVendor, getMyStores);
router.get('/', getStores);
// router.get('/:id', getStoreById);
router.patch('/verify/:storeId', protect, isAdmin, verifyStore)

export default router;