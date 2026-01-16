import {useState, useEffect} from 'react';
import {
  Button, Input, Form, Card, List, 
  Typography, message, Modal, Space, Tag, Upload, Image
} from 'antd'; // nhập đồ nghề Ant design
import {
  DeleteOutlined, EditOutlined, LogoutOutlined, 
  PlusOutlined, UserOutlined, LockOutlined, UploadOutlined
} from '@ant-design/icons'; // nhập icon
const { Title, Text } = Typography;

import './App.css';
import Chat from './component/chat.jsx';


function App(){

  // 1. State: nơi lưu trữ dữ liệu tạm thời trên màn hình
  const [email, setEmail] = useState(''); // lưu email người dùng nhập
  const [password, setPassword] = useState(''); // lưu password
  const [token, setToken] = useState(localStorage.getItem('accessToken')); //lưu token nếu có
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  // State mới cho ghi chú
  const [notes, setNotes] = useState([]);
  const [newNoteContent, setNewNoteContent] = useState('');

  // State mới cho việc vauwf sửa ghi chú (Dùng modal thay vì prompt)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editContent, setEditContent] = useState('');

  // state lưu file ảnh đang chọn (nhưng chưa upload)
  const [fileList, setFileList] = useState([]);

  // Link backend (Thay vì link Render nếu muốn chạy online, hoặc localhost)
  // const API_URL = 'http://localhost:3000';
  // const API_URL = 'https://my-notes-backend-28cf.onrender.com'; // link render

  // import.meta.env.VITE_API_URL sẽ tự lấy giá trị từ file .env hoặc từ Vercel
  const API_URL = import.meta.env.VITE_API_URL;

  // ----- LOGIC HELPER ------
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  useEffect(() => {
    if (token) fetchNotes();
  }, [token]);

  // 1 lấy dánh sách (có loading)
  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API_URL}/my-notes`, { headers: getHeaders() });
      const data = await res.json();
      if (data.data) setNotes(data.data);
    }catch (error) {
      message.error("lỗi kết nối server!");
    }
  };

  // 2. Đăng nhập (Dùng message của Antd thay alert)
  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (data.status === 'success') {
        message.success("Đăng nhập thành công! Cgào mừng VIP.");
        localStorage.setItem('accessToken', data.token);
        setToken(data.token);
        localStorage.setItem('username', data.username); // Cất tên vào túi
        setUsername(data.username);
      } else {
        message.error(data.message);
      }
    } catch (error) {
      message.error("Không thể kết nối đến Server!");
    }
  }

  // 3. Tạo ghi chú
  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) return message.warning("Vui lòng nhập lại nội dung!");

    // A. đóng gói dữ liệu vào formData (cái hộp container)
    const formData = new FormData();
    formData.append('content', newNoteContent);

    // Nếu có chọn ảnh thì bỏ vào hộp luôn
    if (fileList.length > 0) {
      formData.append('image', fileList[0].originFileObj);
    }

    try {

      // B. Gửi đi (lưu ý: không set content-Type Json nữa, để trình duyệt tự lo)
      const res = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: {
          'Authorization' : `Bearer ${token}`
        },
        body: formData
      });

      const result = await res.json();
      if (result.note) {
        message.success("Đã thêm ghi chú mới!");
        setNewNoteContent('');
        setFileList([]);
        fetchNotes();
      }
    } catch (error) {
      message.error("Lỗi khi tạo ghi chú!");
    }
  };


  const handleDeleteNote = async (noteId) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn không?',
      content: 'Ghi chú này sẽ bị xóa vĩnh viễn.',
      okText: 'Xóa luôn',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await fetch(`${API_URL}/notes/${noteId}`, {
            method: 'DELETE',
            headers: getHeaders(),
          });

          if(res.ok) {
            message.success("Đã xóa ghi chú!");
            fetchNotes();
          }
        } catch (error) {
          message.error("Lỗi khi xóa!");
        }
      }
    });
  };

  // 5. Chuẩn bị sửa (Mở Modal)
  const openEditModal = (note) => {
    setEditingNote(note);
    setEditContent(note.content);
    setIsEditModalOpen(true);
  }


  // 6. Thực hiện sửa (Khi bấm oke trong Modal)
  const handleUpdateNote = async () => {
    try {
      const res = await fetch(`${API_URL}/notes/${editingNote._id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ content: editContent })
      });

      if (res.ok) {
        message.success("Cập nhật thành công!");
        setIsEditModalOpen(false);
        fetchNotes();
      }
    } catch (error) {
      message.error("Lỗi khi sửa!");
    }
  };


  // Hàm logout
  const handleLogout= () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    setToken(null);
    setNotes([]);
    setUsername('');
    message.info("Đã đăng xuất.");
  }

  // 4. Giao diện (Render)
  
  // A. Màn hình đăng nhập
  if (!token) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5'}}>
        <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <Title level={3}>🔐 Đăng Nhập</Title>
            <Text type='secondary'>Sổ tay</Text>
          </div>
          <Form layout='vertical' onFinish={handleLogin}>
            <Form.Item label="Email">
              <Input
                prefix={<UserOutlined />}
                placeholder='Nhập email...'
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Mật Khẩu">
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </Form.Item>
            <Button type='primary' htmlType='submit' block size='large'>
              Đăng nhập ngay
            </Button>
          </Form>
        </Card>
      </div>
    );
  }

  // B. Màn hình chính (Dashboard)
  return (
    <div style={{ padding: '20px', width: 600, margin: '0 auto'}}>
      <Card
        title={<Title level={4}>📝 Sổ tay của tôi</Title>}
        extra={<Button type='dashed' danger icon={<LogoutOutlined />} onClick={handleLogout}>Đăng xuất</Button>}
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      >
        {/* khu vực thêm mới */}
        <div style={{ marginBottom: 20 }}>
          <Space.Compact style={{ width: '100%', marginBottom: 20 }}>
            <Input
              size='large'
              placeholder='Hôm nay bạn nghĩ gì?...'
              value={newNoteContent}
              onChange={e => setNewNoteContent(e.target.value)}
              onPressEnter={handleCreateNote}
            />
            {/* nút upload ảnh */}
            <Upload
              fileList={fileList}
              beforeUpload={() => false} // chặn không cho upload ngay (đợi bấm nút)
              onChange={ ({fileList}) => setFileList(fileList)}
              maxCount={1} // chỉ cho chọn 1 ảnh thôi
              showUploadList={false} // ảnh danh sách rờm rà đi, ta hiển thị số lượng thôi
            >
              <Button size='lagre' icon={<UploadOutlined />} style={{ height: 40}}>
                {fileList.length > 0 ? "đã chọn ảnh" : "ảnh"}
              </Button>
            </Upload>

            <Button type='primary' size='large' icon={<PlusOutlined />} onClick={handleCreateNote}>
              Lưu
            </Button>
          </Space.Compact>

          {/* Hiển thị tên file đang chọn (nếu có) để user biết */}
          {fileList.length > 0 && (
            <div style={{ marginTop: 5, color: 'blue' }}>
              Đang chọn: {fileList[0].name} (Bấm lưu để tải lên)
            </div>
          )}
        </div>
        

        {/* Danh sách ghi chú */}
        <List
          dataSource={notes}
          pagination={{ pageSize: 5,}}
          renderItem={(note) => (
            <List.Item
              actions={[
                <Button type='text' icon={<EditOutlined />} style={{ color: 'orange'}} onClick={() => openEditModal(note)}>
                  Sửa
                </Button>,
                <Button type='text' danger icon={<DeleteOutlined />} onClick={() => handleDeleteNote(note._id)}>
                  Xóa
                </Button>
              ]}
            >
              <List.Item.Meta
                // Avatar bây giờ sẽ là cái ảnh (nếu có)
                avatar={
                  note.imageUrl ? (
                    <Image width={100} src={note.imageUrl} style={{ borderRadius: 5 }} />
                  ) : null
                }
                title={<Text strong >{note.content}</Text>}
                description={<Tag color="blue">{note.createdAt ? new Date(note.createdAt).toLocaleString() : "Vừa xong"}</Tag>}
              />
            </List.Item>
          )}
        />
        <Chat username={username || "User"} />
      </Card>

      {/* Modal sửa ghi chú (ẩn đi, chỉ hiện khi bấm sửa) */}
      <Modal
        title="Chỉnh sửa ghi chú"
        open={isEditModalOpen}
        onOk={handleUpdateNote}
        onCancel={() => setIsEditModalOpen(false)}
      >
        <Input.TextArea 
          rows={4}
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
        />
      </Modal>
    </div>
  );
}

export default App;