import React, { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useParams } from 'react-router-dom';

const ChatRoomPage = () => {
    const { roomId } = useParams();  // 채팅방 ID
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [myKakaoId, setMyKakaoId] = useState(null);
    const clientRef = useRef(null);

    useEffect(() => {
        // ✅ 내 Kakao ID 가져오기
        fetch(`http://localhost:8080/api/auth/me`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                setMyKakaoId(data.kakaoId);
            })
            .catch(err => {
                console.error("사용자 정보 불러오기 실패:", err);
            });

        // ✅ 과거 메시지 로드
        fetch(`http://localhost:8080/api/chat/messages/${roomId}`, {
            credentials: 'include',
        })
            .then(res => {
                if (!res.ok) throw new Error("서버 응답 실패");
                return res.json();
            })
            .then(data => setMessages(data))
            .catch(err => {
                console.error("이전 메시지 불러오기 실패:", err);
            });

        // ✅ 실시간 수신
        const socket = new SockJS('http://localhost:8080/ws');
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
        if (clientRef.current && input.trim() !== '' && myKakaoId) {
            clientRef.current.publish({
                destination: `/app/chat/${roomId}`,
                body: JSON.stringify({
                    content: input,
                    senderKakaoId: myKakaoId  // ✅ 보낸 사람 ID 포함
                })
            });
            setInput('');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2>채팅방 ID: {roomId}</h2>
            <div style={{ border: '1px solid gray', height: '300px', overflowY: 'scroll', padding: '1rem' }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{ textAlign: msg.senderKakaoId === myKakaoId ? 'right' : 'left' }}>
                        <b>{msg.senderKakaoId === myKakaoId ? "나" : msg.senderKakaoId}:</b> {msg.content}
                    </div>
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
