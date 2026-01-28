import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { Card, Input, Button, List, Avatar } from "antd";
import { SendOutlined, UserOutlined } from "@ant-design/icons";
import { Message } from "../types";

// kết nối Socket (lấy link từ biến môi trường)
const socket = io(import.meta.env.VITE_API_URL || "http://localhost:3000");

// Định nghĩa Props: Compponent này nhận vào cái gì?
interface ChatProps {
  username: string;
}

// Khái báo Component với kiểu React.FC (Functional Component) nhận vào ChatProps

function Chat({ username }: ChatProps) {
  const [currentMessage, setCurrentMessage] = useState<string>("");

  // State chứa danh sách tin nhắn (Mảng các Message)
  const [messageList, setMessageList] = useState<Message[]>([]);

  const socketRef = useRef<any>(null);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL || "http://localhost:3000")

    socketRef.current.on("connect", () => {
      console.log("✅ Connected socket:", socket.id);
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Disconnected socket");
    });
      // khi nhận tin nhắn, báo cho TS biết data nhận đucợ là kiểu Message
      socketRef.current.on("receive_message", (data: Message) => {
        setMessageList((list) => [...list, data]);
      });

      return () => {
        socketRef.current?.disconnect();
      }
    }, []);

  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    if (!socketRef.current) {
      console.error("❌ Socket chưa sẵn sàng");
      return;
    }

    console.log("socketRef:", socketRef.current);

    if (currentMessage !== "") {
      const messageData: Message = {
        author: username || "Ẩn danh",
        message: currentMessage,
        time: new Date().toLocaleString(),
      };

      socketRef.current.emit("send_message", messageData);
      setCurrentMessage("");
    }
  };

  return (
    <Card title="💬 Phòng Chat Chung" style={{ marginTop: 20 }}>
      <div style={{ height: 300, overflowY: "auto", marginBottom: 10 }}>
        <List
          dataSource={messageList}
          renderItem={(msg) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={<UserOutlined />}
                    style={{
                      backgroundColor:
                        msg.author === username ? "#87d068" : "#1890ff",
                    }}
                  />
                }
                title={<span>{msg.author} <small style={{color: 'gray', fontSize: 10}}>{msg.time}</small></span>}
                description={msg.message}
              />
            </List.Item>
          )}
        />
      </div>

      <div style={{ display: 'flex', gap : 10 }}>
            <Input
                placeholder="Nhập tin nhắn..."
                value={currentMessage}
                onChange={(event) => setCurrentMessage(event.target.value)}
                onPressEnter={sendMessage}
            />
            <Button type="primary" icon={<SendOutlined />} onClick={sendMessage}>Gửi</Button>
        </div>
    </Card>
  );
}

export default Chat;
