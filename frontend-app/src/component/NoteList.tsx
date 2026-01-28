import { List, Button, Image, Typography, Tag, Skeleton } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Note } from "../types";
import { fa } from "zod/locales";

const { Text } = Typography;

// Định nghĩa Props: Compoment này cần làm những gì từ cha (App) gửi xuống
interface NoteListProps {
    notes: Note[];  // cần cái danh sách để hiển thị
    onEdit: (note: Note) => void;   // cần cái hàm để gọi khi bấm sửa
    onDelete: (id: string) => void; // cần cái hàm để gọi khi bấm xóa
    loading: boolean;   // Mới: nhận trạng thái đang tải
}

const NoteList = ({ notes, onEdit, onDelete, loading }: NoteListProps) => {
    return (
        <List
            loading={loading}   // Antd hỗ trợ sẵn loading cho list
            dataSource={notes}
            pagination={{ pageSize: 5}}
            renderItem={(note) => (
                <List.Item
                    actions={[
                        <Button key="edit" type="text" icon={<EditOutlined />} style={{color: 'orange' }} onClick={() => onEdit(note)}>Sửa</Button>,
                        <Button key="delete" type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(note._id)}>Xóa</Button>
                    ]}
                >
                    {/* Skeleton: khi đang tải thì hiện khung xương, tải xong hiện nội dung */}
                    <Skeleton avatar title={false} loading={loading} active>
                        <List.Item.Meta 
                        avatar={note.imageUrl ? <Image width={100} src={note.imageUrl} style={{ borderRadius: 5 }} /> : null}
                        title={<Text strong>{note.content}</Text>}
                        description={<Tag color="blue">{note.createdAt ? new Date(note.createdAt).toLocaleString() : "Vừa xong"}</Tag>}
                    />
                    </Skeleton>
                </List.Item>
            )}
        />
    );
};

export default NoteList;