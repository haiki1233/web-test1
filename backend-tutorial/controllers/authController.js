const User = require('../models/User'); // gọi model User
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Hàm đăng ký
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) return res.status(400).json({ message: "Emai đã tồn tại!"});

        const salt = await bcrypt.genSalt(10);
        const handlePassword = await bcrypt.hash(password, salt);

        const newUser = new User({ username, email, password: handlePassword});
        await newUser.save();

        res.json({ message: "Đăng ký thành công!", user: newUser });
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hàm đăng nhập
exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({ email });

        if(!user) return res.status(400).json({ message: "Email không tồn tại!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu!" });

        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });

        const displayName = user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user.username;

        res.json({ message: "Đăng nhập thành công!", token, username: displayName, status: "success" });
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
};