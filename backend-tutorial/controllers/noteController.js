const Note = require('../models/Note');


// hàm lấy ghi chú
exports.getMyNotes = async (req, res) => {
    try {
        // 1. Lấy tham số từ frontend gửi lên (nếu không gửi thì dùng mặc định)
        // page: trang số mấy (mặc định trang 1)
        // limit: lấy bao nhiêu cái (mặc định là 10 cái)
        // search: từ khóa tìm kiếm (mặc định rỗng)
        const { page = 1, limit = 10, search = '' } = req.query;

        // 2. Xây dựng bộ lọc tìm kiếm
        const query = {
            userId: req.user.userId,
            content: { $regex: search, $options: 'i' }  // tìm gần đúng (regex), không phân biệt hoa thường ('i')
        }

        // 3. Thực hiện truy vấn vơi phân trang
        const notes = await Note.find(query)
            .sort({ createdAt: -1 })    // Sắp xếp mới nhất lên đầu
            .limit(limit * 1)   // Chỉ lấy đúng số lượng limit
            .skip((page - 1) * limit);  // bỏ qua những cái ở trang trước
        
        // 4. Đếm tổng số ghi chú (để frontend biết mà chia trang)
        const total = await Note.countDocuments(query);

        res.json({
            data: notes,
            pagination: {
                total,
                page: page * 1, // trang hiện tại
                limit: limit * 1,   // số lượng mỗi trang
                totalPages: Math.ceil(total / limit)    // tổng số trang
            }
        });
    }catch (error) {
        console.error("Lỗi lấy ghi chú:", error);
        res.status(500).json({ error: error.message });
    }
};

// Hàm tạo ghi chú
exports.createNote = async (req, res) => {
    try {
        const { content } = req.body;

        // kiểm tra xem có file ảnh gửi kèm ko
        // Nếu có thì lấy đường link path, nếu không thì để rỗng
        const imageUrl = req.file ? req.file.path : null;
        
        const newNote = new Note({ 
            content, 
            userId: req.user.userId,
            imageUrl: imageUrl
        });
        
        await newNote.save();
        res.json({ message: "Đã lưu!", note: newNote });
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// hàm xóa ghi chú
exports.deleteNote = async (req, res) => {
    try {
        const noteId = req.params.id;

        // Tìm và xóa (Phải đúng chủ nhân mới xóa được)
        const deleteNote = await Note.findOneAndDelete({ _id: noteId, userId: req.user.userId });

        if (!deleteNote) return res.status(404).json({ message: "không tìm thấy ghi chú để xóa!"});

        res.json({ message: "Đã xóa thành công!"});
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Hàm sửa ghi chú
exports.updateNote = async (req, res) => {
    try {
        const noteId = req.params.id;
        const { content } = req.body;

        const updateNote = await Note.findOneAndUpdate(
            { _id: noteId, userId: req.user.userId },
            { content: content },
            { new: true }
        );

        if (!updateNote) {
            return res.status(404).json({ message: "Không tìm thấy ghi chú!"});
        }

        res.json({ message: "Bạn đã sửa thành công!", note: updateNote })
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
};