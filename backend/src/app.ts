import express, {Application, Request, Response} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import storeRoutes from './routes/store.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.route.js';
import orderRoutes from './routes/order.route.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "KitchenKart API is running!" });
});

// app.use((err: any, req: Request, res: Response, next: any) => {
//     const statusCode = err.statusCode || 500;
//     res.status(statusCode).json({
//         success: false,
//         message: err.message || "Internal Server Error",
//         stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
//     });
// });

app.use(errorHandler);


export default app;



