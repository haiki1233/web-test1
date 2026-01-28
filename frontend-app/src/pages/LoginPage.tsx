import { Button, Input, Form, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from 'react-hook-form';  // Món mới
import { zodResolver } from "@hookform/resolvers/zod";  // Cầu nối
import { loginSchema, LoginFormData } from "../schemas";    // Luật lệ

const { Title, Text } = Typography;

const LoginPage = () => {
    const navigate = useNavigate(); // cái này giống như vô lăng để lái sang trang khác

    // Khởi tạo Form với "luạt sư" Zod
    const {
        control,
        handleSubmit,
        formState: {errors, isSubmitting}   // Lấy lỗi và trạng thái
    } = useForm<LoginFormData>({
        resolver:zodResolver(loginSchema)   // gắn luật vào form
    })

    // Hàm này chỉ chạy khi Form KHÔNG CÓ LỖI (Zod đã duyệt)
    const onSubmit = async (data: LoginFormData) => {
        try {
            // data bây giờ chắc chắn có email và password đúng chuẩn
            const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (result.status === 'success') {
                message.success("Đăng nhập thành công!");
                localStorage.setItem('accessToken', result.token);
                localStorage.setItem('username', result.username);
                navigate('/');
            } else {
                message.error(result.message)
            }
        } catch (error) {
            message.error("Lỗi kết nối Server!");
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', background: '#f0f2f5' }}>
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Title level={3}>🔐 Đăng Nhập</Title>
                    <Text type="secondary">Sổ tay fullstack Pro</Text>
                </div>

                {/* Form của Antd kết hợp React Hook Form */}
                <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>

                    {/* EMAIL FIELD */}
                    <Form.Item 
                        label="Email"
                        validateStatus={errors.email ? "error" : ""}
                        help={errors.email?.message}    // tự động hiện báo lỗi của Zod
                    >
                        <Controller 
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <Input {...field} prefix={<UserOutlined />} placeholder="Nhập email..." />
                            )}
                        />
                    </Form.Item>

                    {/* PASSWORD FIELD */}
                    <Form.Item 
                        label="Mật khẩu"
                        validateStatus={errors.password ? "error" : ""}
                        help={errors.password?.message}
                    >
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <Input.Password {...field} prefix={<LockOutlined />} placeholder="Nhập mật khẩu..." />
                                )}
                            />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block size="large" loading={isSubmitting}>Đăng nhập</Button>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;

