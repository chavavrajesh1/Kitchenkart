# 🛒 Kitchen Kart - Backend

**Kitchen Kart** is a high-performance, scalable **Grocery & Vegetable Delivery API** built with **Node.js**, **TypeScript**, and **MongoDB**. It features a multi-vendor architecture, allowing store owners to manage inventory while providing customers with a seamless shopping experience.

---

## 🚀 Key Features

### 🔐 Authentication & Security
* **JWT-based Auth:** Secure login and registration with Role-Based Access Control (RBAC).
* **Email Verification:** Integrated **Nodemailer** for OTP/Account verification.
* **Middleware Protected:** Custom middlewares for `protect`, `isVendor`, and `isAdmin`.

### 🏪 Vendor & Product Management
* **Multi-Store Support:** Vendors can create and manage their specific stores.
* **Dynamic Categories:** Store-type specific category mapping (e.g., Grocery stores can't sell Electronics).
* **Bulk Upload:** Optimized **CSV File Processing** using `csv-parser` for adding thousands of products in seconds.
* **Image Management:** Cloud-based image storage integrated with **Cloudinary**.

### 🛒 Cart & Order Lifecycle
* **Smart Cart:** Persistent cart logic with single-store constraint (prevents multi-store checkout conflicts).
* **Inventory Management:** **Automated Stock Reduction** using MongoDB `bulkWrite` upon successful order placement.
* **Order Tracking:** Full lifecycle support from `Placed` to `Delivered`.
* **Email Receipts:** Automatic order confirmation emails sent to customers.

---

## 🛠 Tech Stack

| Technology | Purpose |
| --- | --- |
| **Node.js** | Server-side Runtime |
| **TypeScript** | Static Typing & Code Reliability |
| **Express.js** | Web Framework |
| **MongoDB** | NoSQL Database |
| **Mongoose** | ODM for MongoDB |
| **Cloudinary** | Image Hosting |
| **Multer** | File Upload Handling |
| **Nodemailer** | Transactional Emails |

---

