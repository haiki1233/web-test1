import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { Card, Input, Button, List, Avatar } from "antd";
import { SendOutlined, UserOutlined } from "@ant-design/icons";

function Chat({ username }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
        if (!username) return;

        // 👉 tạo socket MỚI khi có username
        socketRef.current = io.connect(import.meta.env.VITE_API_URL, {
            query: { username }, // 👈 gửi username lên server
        });

        socketRef.current.on("received_message", (data) => {
            setMessageList((prev) => [...prev, data]);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [username]); // 👈 quan trọng

  const sendMessage = () => {
        if (!currentMessage.trim()) return;

        const messageData = {
            author: username,
            message: currentMessage,
            time: new Date().toLocaleTimeString(),
        };

        socketRef.current.emit("send_message", messageData);
            setCurrentMessage("");
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
                title={`${msg.author} (${msg.time})`}
                description={msg.message}
              />
            </List.Item>
          )}
        />
      </div>

      <div style={{ display: 'flex' }}>
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
