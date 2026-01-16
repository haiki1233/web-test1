const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// thêm để chat real-time
const http = require('http');  // thư viện có sẵn cảu node.js
const { Server } = require("socket.io");


// 1. Khởi tạo App
const app = express();
app.use(express.json());
app.use(cors());

// Tạo Server
// thay vì để express tự chạy, ta nhét express vào trong http server
const server = http.createServer(app);

// cấu hình Socket.io (cho phép frontend gọi vào)
const io = new Server(server, {
    cors: {
        origin: "*", // cho tất cả các web kết nối
        methods: ["GET", "POST"]
    }
});

// lắng nghe sự kiện chat
io.on("connection", (socket) => {
    const username = socket.handshake.query.username;
    console.log(`👤 ${username} connected (${socket.id})`);

    socket.on("send_message", (data) => {
        io.emit("received_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);
    });
});

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
server.listen(port, () => {
    console.log(`🚀 Server Socket đang chạy tại http://localhost:${port}`);
});