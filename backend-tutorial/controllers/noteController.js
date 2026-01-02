const Note = require('../models/Note');


// hàm lấy ghi chú
exports.getMyNotes = async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user.userId });
        res.json({ data: notes });
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Hàm tạo ghi chú
exports.createNote = async (req, res) => {
    try {
        const { content } = req.body;
        const newNote = new Note({ content, userId: req.user.userId });
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