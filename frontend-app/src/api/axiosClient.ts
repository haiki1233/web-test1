import axios from "axios";
import { error } from "node:console";
import { config } from "zod/v4/core";

// Tạo ra một cái máy gọi API riêng
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,  // Tự động lấy link server (local hoặc Online)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Cài đặt "Trạm kiểm soát" (Interceptors)
// Trước khi gửi request đi, làm ơn chạy qua hàm này.
axiosClient.interceptors.request.use(
    (config) => {
        // Tự động lấy token trong túi ra
        const token = localStorage.getItem('accessToken');

        // Nếu có token, tự động gắn vào Header
        if(token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;  // cho phép đi tiếp
    },
    (error) => {
        return Promise.reject(error);
    }
);


// Cài đặt xử lý kết quả trả về
// giúp code gọn hơn: Thay vì reponse.data.data thì lấy thẳng response.data
axiosClient.interceptors.response.use(
    (reponse) => {
        return reponse.data;    // Lọc bỏ mấy cái rườm rà của axios, lấy data thôi
    },
    (error) => {
        // Nếu token hết hạn (Lỗi 401), tự động văng ra trang login (Nâng cao)
        if (error.reponse?.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
)

export default axiosClient;