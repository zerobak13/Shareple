import React, { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useParams } from 'react-router-dom';

const ChatRoomPage = () => {
    const { roomId } = useParams();  // 채팅방 ID
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const clientRef = useRef(null);

    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws'); // 백엔드 WebSocket 엔드포인트
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                client.subscribe(`/topic/chat/${roomId}`, message => {
                    const body = JSON.parse(message.body);
                    setMessages(prev => [...prev, body]);
                });
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [roomId]);

    const sendMessage = () => {
        if (clientRef.current && input.trim() !== '') {
            clientRef.current.publish({
                destination: `/app/chat/${roomId}`,
                body: JSON.stringify({ content: input })
            });
            setInput('');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2>채팅방 ID: {roomId}</h2>
            <div style={{ border: '1px solid gray', height: '300px', overflowY: 'scroll', padding: '1rem' }}>
                {messages.map((msg, idx) => (
                    <div key={idx}>{msg.content}</div>
                ))}
            </div>
            <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="메시지를 입력하세요"
            />
            <button onClick={sendMessage}>전송</button>
        </div>
    );
};

export default ChatRoomPage;
