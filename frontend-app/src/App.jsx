import {useState, useEffect} from 'react';
import './App.css';
// import { replaceOne } from '../../backend-tutorial/models/User';

function App(){

  // 1. State: nơi lưu trữ dữ liệu tạm thời trên màn hình
  const [email, setEmail] = useState(''); // lưu email người dùng nhập
  const [password, setPassword] = useState(''); // lưu password
  const [token, setToken] = useState(localStorage.getItem('accessToken')); //lưu token nếu có


  // State mới cho ghi chú
  const [notes, setNotes] = useState([]);
  const [newNoteContent, setNewNoteContent] = useState('');

  // 1. useEffect: tự động chạy hàm này khi vừa vao web hoặc khi vừa đnagư nhập
  useEffect(() => {
    if(token){
      fetchNotes();
    }
  }, [token]); // chạy lại mỗ khi biến token thay đổi

  // 2. hàm lấy danh sách ghi chú (READ)
  const fetchNotes = async () => {
    try {
      const response = await fetch('https://my-notes-backend-28cf.onrender.com/my-notes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}` // gửi kèm theo vé token
        }
      });

      const data = await response.json();
      if(data.data) {
        setNotes(data.data); // lưu dữ liệu lấy được vào State để hiển thị
      }
    }catch (error){
      console.error("lỗi lấy ghi chú:", error);
    }
  };

  // 3. Hàm tạo ghi chú mới (CREATE)
  const handleCreateNote = async (e) => {
    e.preventDefault(); // chặn load lại trang

    if (!newNoteContent) return; // không cho gửi giấy trắng

    try {
      const response = await fetch('https://my-notes-backend-28cf.onrender.com/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // vẫn phải kẹp vé
        },
        body: JSON.stringify({content: newNoteContent })
      });

      const result = await response.json();
      if (result.note) {
        alert("Đã lưu ghi chú!");
        setNewNoteContent(''); // xóa ô nhập liệu cho sạch
        fetchNotes(); // Gọi lại hàm lấy danh sách để cập nhật cái mới vừa thêm
      }
    }catch (error){
      alert("lỗi khi lưu ghi chú");
    }
  }

  // Hàm xóa ghi chú
  const handleDeleteNote = async (noteId) => {
    // hỏi lại cho chắc (User experience)
    if (!window.confirm("Bạn có muốn xóa ghi chú này không?")) return;

    try {
      const response = await fetch(`https://my-notes-backend-28cf.onrender.com/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization' : `Bearer ${token}` // Vẫn phải có vé mới được xóa
        }
      });

      if (response.ok) {
        alert("Đã xóa!");
        fetchNotes(); // Gọi lại danh sách để cập nhật giao diện
      } else {
        alert("Có lỗi khi xóa!");
      }
    } catch (error) {
      console.error("lỗi xóa", error);
    }
  };

  // Hàm sửa ghi chú
  const handleEditNote = async (noteId, currentContent) => {
    // 1. Hiện hộp thoại cho người dùng nhập nội dung mới
    // nó sẽ hiện nội dung cũ để sữa cho dễ
    const newContent = window.prompt("Sửa ghi chú của bạn:", currentContent);

    // 2. Nếu người dùng bấm "Hủy" hoặc xóa trắng thì thôi không cần sửa
    if (newContent === null || newContent.trim() === "") return;

    try {
      // 3. Gọi API (Dùng method PUT)
      const response = await fetch(`https://my-notes-backend-28cf.onrender.com/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newContent }) // gửi nội dung mới lên
      });

      if (response.ok) {
        alert("Đã sửa thành công!");
        fetchNotes(); // tải lại danh sách để thấy thay đổi
      } else {
        alert("Có lỗi khi sửa!");
      }
    } catch (error) {
      console.error("Lỗi sửa", error);
    }
  };

  // hàm xử lý khi bấm nút đăng nhập
  const handleLogin = async (e) =>{
    e.preventDefault();  // chặn lại việc load lại trang web (mặc định của form)

    try {
      
      // 2. Gọi BACKEND (Fetch API)
      const response = await fetch('https://my-notes-backend-28cf.onrender.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // báo cho server biết mình gửi JSON
        },
        body: JSON.stringify({
          // đóng gói dữ liệu
          email: email,
          password: password
        })
      });

      const data = await response.json(); // giải nén kết quả trả về

      // 3. Xử lý kết quả 
      if (data.status === 'success'){
        alert("Đăng nhập thành công!");

        // Quan trọng: lưu Token vào túi (localStorage) để f5 không bị mất
        localStorage.setItem('accessToken', data.token);

        // cập nhật state để giao diện đổi ngay lập tức
        setToken(data.token);
      }else{
        alert(data.message); // hiện lỗi nếu sai pass
      }
    }catch (error){
      alert("lỗi kết nối server! Bạn đã bật backend chưa?");
    }
  };

  // Hàm đăng xuất
  const handleLogout= ()=>{
    localStorage.removeItem('accessToken'); // Xóa token trong túi
    setToken(null); // xóa token trong state
  }

  // 4. Giao diện (Render)
  return (
    <div style={{ padding: "20px 50px", fontFamily: 'Arial' }}>
      <h1>📝 Sổ tay Fullstack</h1>
      {/* viết form ở đây */}
      {/* Điều kiện: Nếu có token rồi thì hiện lời chào, chưa có thì hiện ra form */}
      {token ? (
        <div style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Xin chào, VIP Member!</h3>
            <button onClick={handleLogout} style={{ background: 'red', color: 'white' }}>Đăng xuất</button> 
          </div>

          {/* form thêm ghi chú */}
          <div style={{ background: '#f0f0f0', padding: 15, borderRadius: 8,marginTop: 20 }}>
            <h4>Thêm ghi chú mới: </h4>
            <form onSubmit={handleCreateNote} style={{ display: 'flex', gap: 10 }}>
              <input 
                type="text"
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder='Hôm nay bạn nghĩ gì?...'
                style={{ flex: 1, padding: 10 }}
              />
              <button type='submit' style={{ background: 'green', color: 'white'}}>Lưu ngay</button>
            </form>
          </div>

          {/* Danh sách ghi chú */}
          <div style={{ marginTop: 30 }}>
            <h4>Danh sách ghi chú của tôi:</h4>
            {notes.length === 0 ? <p>Chưa có ghi chú nào...</p> : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {notes.map((note) =>(
                  <li key={note._id} style={{
                    borderBottom: '1px solid #ccc',
                    padding: '10px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ flex: 1}}>
                      {/* nội dung cột bên trái */}
                      <span style={{ fontWeight: 'bold' }}>{note.content}</span> <br/>
                      <small style={{ color: 'gray' }}>
                        {note.createdAt ? new Date(note.createdAt).toLocaleString() : "vừa xong"}
                      </small>
                    </div>
                    
                    {/* nút bấm bên phải */}
                    <div>
                      {/* nút sửa */}
                      <button
                        onClick={() => handleEditNote(note._id, note.content)}
                        style={{ background: 'orange', color: 'white', marginRight: 5, cursor: 'pointer'}}
                      >
                        Sửa
                      </button>

                      {/* nút xóa */}
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        style={{ background: 'red', color: 'white', marginLeft: 10, cursor: 'pointer'}}
                      >
                        Xóa
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <div>
            <label>Email: </label>
            <input 
              type="text" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} // Cập nhật state khi gõ phím
              placeholder='Nhập email...'
            />
          </div>
          <div style={{ marginTop: 10}}>
            <label>Password: </label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button type='submit' style={{marginTop: 20}}>Đăng nhập ngay</button>
        </form>
      )}
    </div>
  );
}

export default App;