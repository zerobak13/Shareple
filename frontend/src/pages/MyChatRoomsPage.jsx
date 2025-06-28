import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyChatRoomsPage = () => {
    const [rooms, setRooms] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:8080/api/chat/my-chat-rooms", {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => setRooms(data))
            .catch(err => console.error("채팅방 불러오기 실패:", err));
    }, []);

    return (
        <div style={{ padding: '2rem' }}>
            <h2>💬 내 채팅 목록</h2>
            <ul>
                {rooms.map(room => (
                    <li
                        key={room.id}
                        onClick={() => navigate(`/chat/${room.id}`)}
                        style={{
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderBottom: '1px solid #ddd'
                        }}
                    >
                        🛍️ 상품명: {room.productName} / 👤 상대: {room.otherNickname}

                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MyChatRoomsPage;
