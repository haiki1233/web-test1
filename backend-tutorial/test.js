// 1. gọi thư viện express vào để dùng
const express = require('express');

// 2. tạo 1 app ứng dụng từ express
const test = express();
const mongoose = require('mongoose') // 1. gọi thư viện mongoose

// khai báo cổng port mà server sẽ chạy
// (giống như số nhà để người khác tìm đến)
const port = 3000;

// cho phép Express đọc dữ liệu JSON từ body request
test.use(express.json());


// 2. chuỗi kết nối (thay thế bằng chuỗi kết nối của em hoặc bằng link local bên dưới)
// nếu em chưa tạo được trên clould, hãy cài mongoDB community Server vào máy
// và dùng link này: 'mongodb://127.0.0.1:27017/hoc-backend'
const mongoURI= 'mongodb+srv://dbuser:i7fgctDvTqFHOnzo@cluster0.cshrkpg.mongodb.net/?appName=Cluster0'

// 3. Thực hiện kết nối
mongoose.connect(mongoURI)
    .then(() => console.log("Đã kết nối thành công với MongoDB!"))
    .catch((err) => console.error("Lỗi kết nối với Mongo:", err));



// 1. định nghĩa khung xương (Schema) cho user
// Nghĩa là: Một user bắt buộc phải có những trường nào?
const userSchema = new mongoose.Schema({
    username: String, // tên đăng nhập là chuỗi
    email: String, // email là chuỗi
    password: String, // mật khẩu
    createAt: { // ngày tạo
        type: Date,
        default: Date.now // mặc định lấy giờ hiện tại
    }
});

// 2. Tạo Model (người quản lý dữ liệu dựa trên Schema)
// Mongoose sẽ tự tạo collection tên là 'users' (số nhiều) trong db
const User = mongoose.model('User', userSchema);

// 3. API Đăng ký (nâng cấp lưu vào DB thật)
test.post('/register-real', async (req, res) =>{
    try{
        const {username, password, email} = req.body;

        // tạo 1 user mới từ dữ liệu gửi lên
        const newUser = new User({
            username: username,
            password: password,
            email: email
        });

        // lưu vào MongoDB (hàm .save() trả về Promise nên cần await)
        await newUser.save();

        res.json({
            message: "Đăng ký thành công! Đã lưu vào Database.",
            user: newUser
        })
    }catch(error){
        res.status(500).json({error: "lỗi server: " + error.message});
    }
});

// 4. Định nghĩa API đầu tiên
// khi ai đó truy cập đường dẫn gốc /chao-thay bằng phương thức get
test.get('/chao-thay', (req,res)=>{
    // req (request): yêu cầu gửi lên
    // res (response): phản hồi trả về

    // trả về một dòng chữ
    res.send('Em đã sẵn sàng học backend! Thầy dạy tiếp đi ạ.');
});

// Ví dụ 1: Query Parameters
// URL sẽ có dạng: http://localhost:3000/tim-kiem?tuKhoa=ao&mauSac=do
test.get('/tim-kiem', (req, res)=>{
    // req.query là nơi chứa các tham số sau dấu ?
    const tuKhoa = req.query.tuKhoa;
    const mauSac = req.query.mauSac;

    // xử lý logic (ở đây mình chỉ in ra thôi)
    console.log(`Khách hàng đang tìm kiếm:`, tuKhoa, "Màu:", mauSac);

    // trả về kết quả
    res.send(`Bạn đang tìm kiếm: ${tuKhoa}, có màu: ${mauSac}`)
})

// Ví dụ 2: Path Parameters (dùng dấu :)
// URL sẽ có dạng: http://localhost:3000/san-pham/123
// trong đó 123 là ID  của sản phẩm
test.get('/san-pham/:id', (req, res)=>{
    // req.params là nơi chứa các biến trên đường dẫn
    const maSanPham = req.params.id;

    // giả lập locgic lấy dữ liệu từ DB
    res.send(`Đây là chi tiết cảu sản phẩm có mã số: ${maSanPham}`);
})

// Ví dụ 3: Trả về JSON (chuẩn hóa API)
test.get('/profile/:ten', (req, res)=>{
    const tenNguoiDung = req.params.ten;
    const tuoi = req.query.tuoi;

    // res.json() sẽ tự động chuyển Object thành chuỗi JSON chuẩn
    res.json({
        message: "Lấy thông tin thành công",
        user: {
            name: tenNguoiDung,
            age: tuoi,
            role: "học viên backend"
        },
        status: "success"
    });
});

// BTVN: tính tổng từ đường dẫn /tinh-tong/:soA/:soB
test.get('/tinh-tong/:soA/:soB', (req, res)=>{

    const soA =req.params.soA;
    const soB = req.params.soB;

    // ép kiểu
    const soA_Number = Number(soA);
    const soB_Number = Number(soB);

    // kiểm tra xem có phải số hay không
    if(isNaN(soA) || isNaN(soB)){
        return res.status(400).json({
            error: "Dữ liệu không hợp lệ. Vui lòng nhập số",
            status: "error"
        })
    }

    const sum = soA_Number + soB_Number;

    res.json({
        ketQua: sum,
        phepTinh: `${soA} + ${soB}`,
        status: "success"
    })

})


// API Đăng nhập (dùng POST vì cần bảo mật password)
test.post('/login', (req, res) =>{
    // dữ liệu client gửi lên nằm trong req.body (cái hộp kín)
    const {username, password} =  req.body;

    console.log("dữ liệu nhận được:", req.body);

    // giả lập kiểm tra đăng nhập
    if (username === "admin" && password === "123456"){
        res.json({
            message: "Đăng nhập thành công!",
            token: "chuoi-ma-bi-mat-xyz",
            status: "success"
        })
    }else{
        res.status(401).json({
            message: "sai tài khoản mật khẩu",
            status: "fail"
        })
    }
})

// phần đăng ký
test.post('/register', (req, res) =>{
    const {username, password, email} = req.body;

    console.log("dữ liệu nhận được:", req.body.username);

    res.json({
        message: `Đã tạo tài khoản cho ${username} thành công`,
        token: "mat-khau-cua-ban",
        status: "success"
    })
})

// 5. khởi động server và lắng nghe tại cổng đã chọn
test.listen(port, ()=>{
    console.log(`Server đang chạy tại địa chỉ: http://localhost:${port}`);
});