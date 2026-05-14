import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { 
    addToCart, 
    getCart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart 
} from "../controllers/cart.controller.js";

const router = Router();

// అన్ని కార్ట్ రూట్స్ కి లాగిన్ (protect) తప్పనిసరి
router.use(protect);

// 1. కార్ట్ వివరాలను పొందడానికి
router.get("/", getCart);

// 2. కొత్త ఐటమ్ యాడ్ చేయడానికి
router.post("/add", addToCart);

// 3. క్వాంటిటీ పెంచడానికి లేదా తగ్గించడానికి (Action: 'inc' or 'dec')
router.put("/update", updateCartQuantity);

// 4. ఒక ఐటమ్‌ను కార్ట్ నుండి తీసేయడానికి
router.delete("/remove", removeFromCart);

// 5. మొత్తం కార్ట్‌ను క్లియర్ చేయడానికి
router.delete("/clear", clearCart);

export default router;