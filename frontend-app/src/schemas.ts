import { z } from "zod";

// 1. Luật cho form đăng nhập
export const loginSchema = z.object({
    email: z.string()
        .min(1, "Vui lòng nhập email!") // không được để trống
        .email("Email không hợp lệ!"),  // phải đúng dạng a@b.c

    password: z.string()
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự!"),   // độ dài tỗi thiểu
});

// Typescript sẽ tự động suy ra kiểu dữ liệu từ luật trên
export type LoginFormData = z.infer<typeof loginSchema>;
