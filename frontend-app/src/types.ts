// định nhĩa hình dáng cảu một ghi chú
export interface Note {
    _id: string;    // ID là chuỗi ký tự
    content: string;    // nội dung là chữ
    imageUrl?: string;  // ảnh có thể có hoặc không (dấu ?)
    createdAt: string;  // ngày tạo trả về dạng chuỗi
    userId: string;
}

// Định nghĩa dữ liệu trả về khi đăng nhập
export interface LoginResponse {
    status: string;
    message: string;
    token: string;
    username: string;
}

// Định nghĩa hình dáng cho 1 tin nhắn
export interface Message {
    author: string;
    message: string;
    time: string;
}

// Định nghĩa kiểu dữ liệu để phân trang
export interface FetchParams {
    page: number;
    search: string;
}