# KitchenKart Backend 🛒
A robust, production-ready Multi-Vendor E-Commerce Backend built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Key Architectural Highlights (Mid-Senior Standards)
* **ACID Transactions:** Implemented Mongoose sessions (`startSession`) in the Order service to ensure strict data consistency and prevent race conditions during checkout.
* **Database Write Optimization:** Utilized `Product.bulkWrite()` and `insertMany` for high-performance bulk updates and creation.
* **Node.js Streams for Bulk Upload:** Built a memory-efficient CSV product bulk upload feature using Node.js Streams (`fs.createReadStream`) and `csv-parser` to handle large files without blocking the event loop.
* **Centralized Error Handling:** Integrated a global Error Handling Middleware and a custom `asyncHandler` wrapper to eliminate `try-catch` boilerplate and ensure uniform API responses.
* **Advanced MongoDB Features:** Implemented Compound Indexes for query optimization and Text Search Indexes for fast product searching.
* **Secure Authentication:** Model-level `pre-save` hashing hooks using `bcryptjs` for robust user password security.

## 🛠️ Tech Stack
* **Backend:** Node.js, Express.js, TypeScript
* **Database:** MongoDB (Mongoose ORM)
* **Libraries:** Bcryptjs, JsonWebToken, CSV-Parser, Multer

## 💻 Getting Started

### Prerequisites
* Node.js (v18 or higher)
* MongoDB Local or Atlas URI

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/chavavrajesh1/Kitchenkart.git](https://github.com/chavavrajesh1/Kitchenkart.git)
   cd Kitchenkart


