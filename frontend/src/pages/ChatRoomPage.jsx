import React, { useEffect, useRef, useState, useMemo } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useParams } from 'react-router-dom';

const ChatRoomPage = () => {
    const { roomId } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [myKakaoId, setMyKakaoId] = useState(null);

    // 방 메타 & 현재 거래 상태
    const [roomMeta, setRoomMeta] = useState(null); // { productId, ownerKakaoId, otherKakaoId, otherUserId ... }
    const [current, setCurrent] = useState({
        status: 'NONE', rentalId: null, productId: null, ownerId: null, borrowerId: null
    });

    // 제안 모달
    const [proposeOpen, setProposeOpen] = useState(false);
    const [proposeForm, setProposeForm] = useState({ startDate: '', endDate: '', deposit: '' });

    const clientRef = useRef(null);

    // 공통 POST
    const post = async (url) => {
        const res = await fetch(url, { method: 'POST', credentials: 'include' });
        if (!res.ok) throw new Error(await res.text());
        return res;
    };

    // 데이터 로드
    useEffect(() => {
        // 1) 내 정보
        fetch(`http://localhost:8080/api/auth/me`, { credentials: 'include' })
            .then(r => r.json()).then(d => setMyKakaoId(d.kakaoId))
            .catch(e => console.error('me 실패', e));

        // 2) 방 메타
        fetch(`http://localhost:8080/api/chat/rooms/${roomId}`, { credentials: 'include' })
            .then(r => r.json()).then(setRoomMeta)
            .catch(e => console.error('room meta 실패', e));

        // 3) 과거 메시지
        fetch(`http://localhost:8080/api/chat/messages/${roomId}`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : Promise.reject('메시지 실패'))
            .then(setMessages)
            .catch(e => console.error(e));

        // 4) 현재 거래 상태
        fetch(`http://localhost:8080/api/rentals/room/${roomId}/current`, { credentials: 'include' })
            .then(r => r.json()).then(setCurrent)
            .catch(e => console.error('current 실패', e));

        // 5) 실시간
        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                client.subscribe(`/topic/chat/${roomId}`, (frame) => {
                    const msg = JSON.parse(frame.body);
                    setMessages(prev => [...prev, msg]);

                    // 거래 관련 메시지면 current 갱신 (선택)
                    if (msg.type === 'RENTAL_PROPOSAL' || msg.type === 'RENTAL_UPDATE') {
                        fetch(`http://localhost:8080/api/rentals/room/${roomId}/current`, { credentials: 'include' })
                            .then(r => r.json()).then(setCurrent).catch(() => {});
                    }
                });
            }
        });
        client.activate();
        clientRef.current = client;
        return () => client.deactivate();
    }, [roomId]);

    // 채팅 전송
    const sendMessage = () => {
        if (!clientRef.current || !myKakaoId) return;
        const text = input.trim();
        if (!text) return;

        clientRef.current.publish({
            destination: `/app/chat/${roomId}`,
            body: JSON.stringify({ content: text, senderKakaoId: myKakaoId })
        });
        setInput('');
    };

    // 제안 모달
    const openPropose = () => setProposeOpen(true);
    const closePropose = () => setProposeOpen(false);

    const submitPropose = async () => {
        if (!roomMeta) return alert('방 정보가 아직 준비되지 않았습니다.');
        const { startDate, endDate, deposit } = proposeForm;
        if (!startDate || !endDate || !deposit) return alert('모든 값을 입력해주세요.');

        const borrowerIdParam = roomMeta.otherUserId;

        const qs = new URLSearchParams({
            roomId,
            productId: roomMeta.productId,
            borrowerId: borrowerIdParam,
            startDate, endDate, deposit
        });
        try {
            await post(`http://localhost:8080/api/rentals/propose?${qs}`);
            closePropose();
            // 제안 후 상태 새로고침
            const cur = await fetch(`http://localhost:8080/api/rentals/room/${roomId}/current`, { credentials: 'include' }).then(r => r.json());
            setCurrent(cur);
        } catch (e) {
            alert('제안 실패: ' + e.message);
        }
    };

    // 액션
    const accept = async () => {
        try {
            await post(`http://localhost:8080/api/rentals/${current.rentalId}/accept`);
            const cur = await fetch(`http://localhost:8080/api/rentals/room/${roomId}/current`, { credentials: 'include' }).then(r => r.json());
            setCurrent(cur);
        } catch (e) { alert('수락 실패: ' + e.message); }
    };
    const reject = async () => {
        try {
            await post(`http://localhost:8080/api/rentals/${current.rentalId}/reject`);
            const cur = await fetch(`http://localhost:8080/api/rentals/room/${roomId}/current`, { credentials: 'include' }).then(r => r.json());
            setCurrent(cur);
        } catch (e) { alert('거절 실패: ' + e.message); }
    };
    const complete = async () => {
        try {
            await post(`http://localhost:8080/api/rentals/${current.rentalId}/complete`);
            const cur = await fetch(`http://localhost:8080/api/rentals/room/${roomId}/current`, { credentials: 'include' }).then(r => r.json());
            setCurrent(cur);
        } catch (e) { alert('거래완료 실패: ' + e.message); }
    };

    // 내가 주인인가?
     const amOwner = useMemo(() =>
           !!(roomMeta && myKakaoId &&
                  String(roomMeta.ownerKakaoId) === String(myKakaoId)
               ), [roomMeta, myKakaoId]
         );

    // 하단 액션바
    const ActionBar = () => {
        if (current.status === 'NONE') {
            return amOwner ? (
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={openPropose}>거래확정하기</button>
                </div>
            ) : null;
        }
        if (current.status === 'PENDING') {
                 // ✅ 대여자에게만 수락/거절 버튼, 주인은 안내 문구
                     if (!amOwner) {
                       return (
                             <div style={{ display:'flex', gap:8 }}>
                                   <button onClick={accept}>수락</button>
                                  <button onClick={reject}>거절</button>
                                 </div>
                           );
                    }
                 return <div style={{color:'#888'}}>대여자가 수락/거절을 선택할 때까지 기다려주세요.</div>;
               }
        if (current.status === 'ACTIVE') {
            return (
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={complete}>거래완료</button>
                </div>
            );
        }
        return null; // COMPLETED/REJECTED 등
    };

    return (
        <div style={{ padding: '2rem', display: 'grid', gap: '1rem' }}>
            <h2>채팅방 ID: {roomId}</h2>
            {/* === DEBUG INFO === */}
            <div style={{ fontSize: '12px', color: '#888', background: '#eee', padding: '8px', borderRadius: '4px' }}>
                <div>myKakaoId: {String(myKakaoId)}</div>
                <div>roomMeta: {JSON.stringify(roomMeta)}</div>
                <div>current: {JSON.stringify(current)}</div>
            </div>

            {/* 메시지 영역 */}
            <div style={{ border: '1px solid gray', height: 360, overflowY: 'auto', padding: '1rem' }}>
                {messages.map((msg, idx) => {
                    if (msg.type === 'RENTAL_PROPOSAL' || msg.type === 'RENTAL_UPDATE' || msg.type === 'SYSTEM') {
                        return (
                            <div key={idx} style={{ marginBottom: '1rem' }}>
                                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                                    {msg.type === 'RENTAL_PROPOSAL' && '💬 대여 제안'}
                                    {msg.type === 'RENTAL_UPDATE' && '🔔 거래 업데이트'}
                                    {msg.type === 'SYSTEM' && '📢 시스템'}
                                </div>
                                {msg.productName && <div>상품: {msg.productName}</div>}
                                {msg.periodStart && msg.periodEnd && <div>기간: {msg.periodStart} ~ {msg.periodEnd}</div>}
                                {typeof msg.deposit === 'number' && <div>보증금: {msg.deposit.toLocaleString()}원</div>}
                                {msg.status && <div>상태: {msg.status}</div>}
                                {msg.text && <div>{msg.text}</div>}
                                {typeof msg.completeProgress === 'number' && <div>진행: {msg.completeProgress}/2</div>}
                            </div>
                        );
                    }

                    // 일반 채팅
                    const isMine = msg.senderKakaoId === myKakaoId;
                    const timeStr = msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '';
                    return (
                        <div key={idx} style={{ textAlign: isMine ? 'right' : 'left', marginBottom: '1rem' }}>
                            <div style={{
                                display: 'inline-block',
                                backgroundColor: isMine ? '#dcf8c6' : '#f1f0f0',
                                padding: '0.5rem 1rem',
                                borderRadius: 10,
                                maxWidth: '60%',
                                wordWrap: 'break-word'
                            }}>
                                {msg.content}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'gray', marginTop: 4 }}>
                                {timeStr}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 하단 액션바 */}
            <ActionBar />

            {/* 입력창 */}
            <div style={{ display: 'flex', gap: 8 }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="메시지를 입력하세요"
                    style={{ flex: 1 }}
                />
                <button onClick={sendMessage}>전송</button>
            </div>

            {/* 제안 모달 */}
            {proposeOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
                    display: 'grid', placeItems: 'center'
                }}>
                    <div style={{ background: '#fff', padding: '1rem', borderRadius: 8, minWidth: 320 }}>
                        <h3>대여 조건 설정</h3>
                        <div style={{ display: 'grid', gap: 8 }}>
                            <label>
                                시작일:
                                <input type="date"
                                       value={proposeForm.startDate}
                                       onChange={e => setProposeForm(f => ({ ...f, startDate: e.target.value }))}/>
                            </label>
                            <label>
                                종료일:
                                <input type="date"
                                       value={proposeForm.endDate}
                                       onChange={e => setProposeForm(f => ({ ...f, endDate: e.target.value }))}/>
                            </label>
                            <label>
                                보증금:
                                <input type="number" min="0" step="1000"
                                       placeholder="예: 50000"
                                       value={proposeForm.deposit}
                                       onChange={e => setProposeForm(f => ({ ...f, deposit: e.target.value }))}/>
                            </label>
                        </div>
                        <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button onClick={() => setProposeOpen(false)}>취소</button>
                            <button onClick={submitPropose}>확정하기</button>
                        </div>

                    </div>
                </div>
            )}
        </div>

    );
};

export default ChatRoomPage;
