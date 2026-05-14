import { Router } from "express";
import { isVendor, protect } from "../middleware/auth.middleware.js";
import { getMyOrders, getOrderDetails, placeOrder, updateOrderStatus } from "../controllers/order.controller.js";

const router = Router();

router.use(protect);
router.post("/place", placeOrder);
router.get("/my-orders", getMyOrders);
router.get("/:orderId", getOrderDetails);
router.patch("/status/:orderId", isVendor, updateOrderStatus);

export default router;

