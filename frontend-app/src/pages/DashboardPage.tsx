import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Card, message, Modal, Space, Upload, Image, Typography } from "antd";
import { PlusOutlined, LogoutOutlined, UploadOutlined } from "@ant-design/icons";
import { Navigate, useNavigate } from "react-router-dom";
import type { UploadFile } from "antd";
import { Pagination } from 'antd';
import { FetchParams, Note } from "../types";
import NoteList from "../component/NoteList";
import Chat from "../component/Chat";
import axiosClient from "../api/axiosClient";

const { Title } = Typography;



// Dùng axiosClient
// Không cần truyền token, không cần .json(), không cần check res.ok thủ công
// nhận params
const fetchNotesAPI = async ({page, search} : FetchParams) => {
    // Vì axiosClient đã trả về reponse.data rồi, nên ta hứng kết quả thôi
    // axios sẽ tự chuyển object params thnagf ?page=1&search=abc
    const reponse:any = await axiosClient.get('/my-notes', {
        params: {
            page: page,
            limit: 5,
            search: search
        }
    });
    return reponse;    // trả về cục {data, pagination}
};


const DashboardPage = () => {
    // STATE
    // const [notes, setNotes] = useState<Note[]>([]);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [username, setUsername] = useState(localStorage.getItem('username') || 'User');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [editingNote, setEditingNote] = useState<Note | null>(null);

    // State phân trang
    const [page, setPage] = useState(1);    // Đang ở trang mấy
    const [searchText, setSearchText] = useState('');   // Đang timd chữ gì




    const queryClient = useQueryClient();   // Để điều khiển bộ nhớ đệm


    // useQuery tự động gọi API, tự lưu cache, tự xử lý loading/error
    const { data, isLoading} = useQuery({
        // khi page hoặc searchText đổi, React Query coi là dữ liệu khác -> tự tải lại
        queryKey: ['notes', page, searchText],    // Tên định danh cho dữ liệu này (như ID trong kho)
        
        // Truyền tham số vào hàm fetch
        queryFn: () => fetchNotesAPI({ page, search: searchText }), // Hàm gọi API
        // staleTime: 1000 * 60,   // (Tùy chọn) dữ liệu coi là "mới" trong 60s, không cần gọi lại
        
        // giữ dữ liệu cũ hiển thị trng lucd đang tải laijtrnag mới (UX mượt hơn)
        placeholderData: (previousData) => previousData,
    });

    // Lấy danh sách note và thông tin phân trang từ data trả về
    // lưu ý data?.data là sách note, data?.pagination là thông tin từ data là thôn tin trang
    const notes = data?.data || [];
    const totalNotes = data?.pagination?.total || 0;
    
    
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (!token) {
            navigate('/login'); //Nếu không có vé, đá về trang login ngay
        } else {
            queryClient.invalidateQueries({ queryKey: ['notes']})
        }
    },[token]);

    const getHeaders = () => ({ 'Authorization': `Bearer ${token}` });

    // const fetchNotes = async () => {
    //     try {
    //         const res = await fetch(`${API_URL}/my-notes`, { headers: getHeaders() });
    //         const data = await res.json();
    //         if (data.data) setNotes(data.data);
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };

    const handleCreateNote = async () => {
        if (!newNoteContent.trim()) return message.warning("Nhập nội dung đi!");
        const formData = new FormData();
        formData.append('content', newNoteContent);
        if (fileList.length > 0) formData.append('image', fileList[0].originFileObj as Blob);

        try {
            const result: any = await axiosClient.post('/notes', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',  // Riêng upload ảnh thì báo cái này
                }
            })
            if (result.note) {
                message.success("Đã đăng!");
                setNewNoteContent('');
                setFileList([]);
                
                queryClient.invalidateQueries({ queryKey: ['notes'] });
                // Nghĩa là: Hủy cái cache 'notes' cũ đi, tự động tải lại cái mới về
            }
        } catch (e) { message.error("Lỗi đăng bài!");}
    };

    const handleDeleteNote = async (id:string) => {
        Modal.confirm({
            title: "Xóa nhé?",
            onOk: async () => {
                await axiosClient.delete(`/notes/${id}`);
                message.success("Bay màu!");
                queryClient.invalidateQueries({ queryKey: ['notes'] });
            }
        });
    };

    const openEditModal = (note: Note) => {
        setIsEditModalOpen(true);
        setEditingNote(note);
        setEditContent(note.content);
    };

    const handleUpdateNote = async () => {
        if (!editingNote) return;

        try {
            // const res = await fetch(`${API_URL}/notes/${editingNote._id}`, {
            //     method: 'PUT',
            //     headers: {
            //         ...getHeaders(),
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({ content : editContent })
            // });

            // if (res.ok) {
            //     message.success("Bạn sửa thành công!");
            //     setIsEditModalOpen(false);
            //     setEditingNote(null);
            //     queryClient.invalidateQueries({ queryKey: ['notes'] });
            // }


            // Cách mới (Axios)
            // tham số 1: URL chứa ID (/notes/12346)
            // tham số 2: Object chứa dữ liệu mới ({ content: "Nội dung mới" })
            await axiosClient.put(`/notes/${editingNote._id}`, {
                content: editContent
            });

            // Nếu chạy đến đây nghĩa là thành công (Axios tự bắt lỗi nếu thất bại)
            message.success("Cập nhật thành công!");

            setIsEditModalOpen(false);  // Đóng modal
            queryClient.invalidateQueries({ queryKey: ['notes'] }); // Làm mới dánh sách
        } catch (error) {
            message.error("Lỗi khi sửa ghi chú!");
        }
    }

    const handleLogout = () => {
        localStorage.clear();   //xóa sạch túi
        navigate('/login');
    };

    return (
        <div style={{ padding: '20px', width: 800, margin: '0 auto' }}>
            <Card
                title={<Title level={4}>📝 Sổ tay của {username}</Title>}
                extra={<Button danger icon={<LogoutOutlined />} onClick={handleLogout}>Đăng xuất</Button>}
            >
                {/* Khu vực tìm kiếm & thêm mới */}
                <div style={{ marginBottom: 20}}>
                    {/* Ô tìm kiếm mới */}
                    <Input.Search
                        placeholder="Tìm kiếm ghi chú..."
                        allowClear
                        onSearch={(value) => {
                            setSearchText(value);   //cập nhật từ khóa tìm kiếm
                            setPage(1); //  Reset về trang 1 khi tìm kiếm mới
                        }}
                        style={{ marginBottom: 15 }}
                        size="large"
                    />

                    {/* Form nhập liêu */}
                    <Space.Compact style={{ width: '100%' }}>
                        <Input size="large" value={newNoteContent} onChange={e => setNewNoteContent(e.target.value)} placeholder="Viết gì đó..." onPressEnter={handleCreateNote}/>
                        <Upload fileList={fileList} beforeUpload={() => false} onChange={({fileList}) => setFileList(fileList)} maxCount={1} showUploadList={false}>
                            <Button size="large" icon={<UploadOutlined />}>Ảnh</Button>
                        </Upload>
                        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleCreateNote}>Lưu</Button>
                    </Space.Compact>
                    {fileList.length > 0 && <div style={{color: 'blue'}}>Đã chọn ảnh: {fileList[0].name}</div>}
                </div>

                {/* Danh sách ghi chứ */}
                <NoteList 
                    notes={notes} 
                    onEdit={openEditModal} 
                    onDelete={handleDeleteNote}
                    loading={isLoading}
                />
               

                {/* Thanh phân trang */}
                <div style={{ marginTop: 20, textAlign: 'center' }}>
                    <Pagination
                        current={page}          // Trang hiện tại
                        total={totalNotes}      // tổng số ghi chú (để nó tự định số trang)
                        pageSize={5}            // số lượng mỗi trang
                        onChange={(newPage) => setPage(newPage)}    // Khi bấm chuyển trang
                        showSizeChanger={false}     // Tắt nút chọn số lượng mỗi trang cho gọn
                    />
                </div>
            </Card>

            {/* Modal sửa ghi chú (ẩn đi, khi sửa thì mở ra) */}
            <Modal
                title="chỉnh sửa ghi chú"
                open={isEditModalOpen}
                onOk={handleUpdateNote}
                onCancel={() => setIsEditModalOpen(false)}
            >
                <Input.TextArea 
                    rows={4}
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    onPressEnter={handleUpdateNote}
                />
            </Modal>

            {/* chat */}
            <Chat username={username} />
        </div>
    );
};


export default DashboardPage;