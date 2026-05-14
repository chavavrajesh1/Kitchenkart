import { Response, Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/profile', protect, (req: any, res: Response) => {
    res.json(req.user)
})

export default router;