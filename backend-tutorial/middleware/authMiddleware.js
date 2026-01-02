const jwt = require('jsonwebtoken');

// lấy hàm bảo vệ từ app.js sang đây
const authMiddlieware = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({message: "Chặn lại! Bạn chưa có vé (Token)."});
    }

    try {
        const tokenClean = token.replace('Bearer ', '');
        const verified = jwt.verify(tokenClean, process.env.SECRET_KEY);

        req.user = verified;
        next();
    }catch (err) {
        res.status(400).json({ message: "Vé giả hoặc đã hết hạn!"});
    }
};

module.exports = authMiddlieware;