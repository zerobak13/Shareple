import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const ChatRoom = () => {
    const { roomId } = useParams();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const handleSend = () => {
        if (message.trim() === "") return;

        // 일단은 WebSocket 없이 로컬에 저장 (나중에 서버로 보내기)
        setMessages([...messages, { text: message, sender: "나" }]);
        setMessage("");
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>채팅방 #{roomId}</h2>
            <div style={{ border: "1px solid #ccc", height: "300px", padding: "1rem", overflowY: "scroll", marginBottom: "1rem" }}>
                {messages.map((msg, idx) => (
                    <div key={idx}><strong>{msg.sender}:</strong> {msg.text}</div>
                ))}
            </div>
            <div style={{ display: "flex" }}>
                <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="메시지 입력..."
                    style={{ flex: 1, padding: "0.5rem" }}
                />
                <button onClick={handleSend} style={{ padding: "0.5rem 1rem" }}>보내기</button>
            </div>
        </div>
    );
};

export default ChatRoom;
