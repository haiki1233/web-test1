const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 1. Khởi tạo App
const app = express();
app.use(express.json());
app.use(cors());

// 2. Kết nối Database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Đã kết nối MongoDB"))
    .catch((err) => console.error(err));


// 3. Gọi các tuyến đường routes vào
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');

// 4. Sử dụng Routes
app.use('/', authRoutes); // Các API auth sẽ nằm ở gốc
app.use('/', noteRoutes); // Các API note cũng nằm ở gốc

// 5. Chạy server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
});