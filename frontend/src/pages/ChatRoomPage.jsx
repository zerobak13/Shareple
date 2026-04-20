// src/pages/ChatRoomPage.jsx
// 명세서 기준 채팅방 화면 정비 버전:
//  - 카카오톡 스타일 말풍선 (내/상대 구분, 같은 사람 연속 메시지 꼬리 생략, 타임스탬프)
//  - 날짜 구분선
//  - 자동 스크롤 (신규 메시지 시 하단 고정)
//  - Enter로 전송 / Shift+Enter 줄바꿈 / IME 조합 중에는 전송 방지
//  - 사진 전송 (MVP1 필수): /api/upload → imageUrl 포함 STOMP publish
//  - 헤더에 상품 썸네일/상대 닉네임 표시
//  - 거래 카드(RENTAL) 정돈 + 액션 버튼
//  - 하단 액션바: 거래확정/수락·거절/거래완료 (상태에 따라)
import React, { useEffect, useMemo, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axiosInstance';

// ---------------- 유틸 ----------------
const resolveImage = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return url;
    return `/uploads/${url.replace(/^\/+/, '')}`;
};

const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};

const formatDateDivider = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const w = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
    return `${y}년 ${m}월 ${day}일 ${w}요일`;
};

const sameDay = (a, b) => {
    if (!a || !b) return false;
    const d1 = new Date(a);
    const d2 = new Date(b);
    return d1.toDateString() === d2.toDateString();
};

const statusLabel = (status) => {
    switch (status) {
        case 'PENDING':
            return '수락 대기 중';
        case 'ACTIVE':
            return '대여 진행 중';
        case 'COMPLETED':
            return '거래 완료';
        case 'REJECTED':
            return '거절됨';
        default:
            return status || '';
    }
};

// ---------------- 메시지 정규화 ----------------
const toRenderable = (msg) => {
    // DB 저장형: SYSTEM + msgType=RENTAL + payloadJson
    if (msg?.type === 'SYSTEM' && msg?.msgType === 'RENTAL' && msg?.payloadJson) {
        try {
            const payload = JSON.parse(msg.payloadJson);
            return { kind: 'rental', rental: payload, timestamp: msg.timestamp };
        } catch {
            return { kind: 'system', text: msg.content || '시스템', timestamp: msg.timestamp };
        }
    }
    // 실시간형: RENTAL_PROPOSAL / RENTAL_UPDATE
    if (msg?.type === 'RENTAL_PROPOSAL' || msg?.type === 'RENTAL_UPDATE') {
        return { kind: 'rental', rental: msg, timestamp: msg.timestamp };
    }
    // 시스템 텍스트
    if (msg?.type === 'SYSTEM') {
        return { kind: 'system', text: msg.content || '', timestamp: msg.timestamp };
    }
    // 일반 채팅
    return { kind: 'chat', msg };
};

// ---------------- 본체 ----------------
const ChatRoomPage = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [myKakaoId, setMyKakaoId] = useState(null);
    const [connected, setConnected] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [roomMeta, setRoomMeta] = useState(null);
    const [productMeta, setProductMeta] = useState(null); // name, imageUrl
    const [otherUserMeta, setOtherUserMeta] = useState(null); // nickname
    const [current, setCurrent] = useState({
        status: 'NONE', rentalId: null, productId: null, ownerId: null, borrowerId: null,
    });

    const [proposeOpen, setProposeOpen] = useState(false);
    const [proposeForm, setProposeForm] = useState({ startDate: '', endDate: '', deposit: '' });

    const clientRef = useRef(null);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const composingRef = useRef(false); // IME 조합 중 여부

    // 스크롤을 하단으로
    const scrollToBottom = (behavior = 'auto') => {
        requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
        });
    };

    // 현재 거래 상태 새로고침
    const refreshCurrent = async () => {
        try {
            const res = await axios.get(`/api/rentals/room/${roomId}/current`);
            setCurrent(res.data || { status: 'NONE' });
        } catch (e) {
            // 404/에러여도 치명적이지 않음
        }
    };

    // 초기 로드
    useEffect(() => {
        let ignore = false;

        (async () => {
            try {
                const me = await axios.get('/api/auth/me');
                if (!ignore) setMyKakaoId(me.data.kakaoId);
            } catch (e) {
                console.error('me 실패', e);
            }

            try {
                const meta = await axios.get(`/api/chat/rooms/${roomId}`);
                if (!ignore) setRoomMeta(meta.data);

                // 상품 정보
                if (meta.data?.productId) {
                    try {
                        const p = await axios.get(`/api/products/${meta.data.productId}`);
                        if (!ignore) setProductMeta(p.data);
                    } catch (_) {}
                }
                // 상대 닉네임 (UserController 의 /api/users/{id} 사용 — otherUserId 는 DB PK)
                if (meta.data?.otherUserId) {
                    try {
                        const u = await axios.get(
                            `/api/users/${meta.data.otherUserId}`
                        );
                        if (!ignore) setOtherUserMeta(u.data);
                    } catch (_) {}
                }
            } catch (e) {
                console.error('room meta 실패', e);
            }

            try {
                const his = await axios.get(`/api/chat/messages/${roomId}`);
                if (!ignore) {
                    setMessages(Array.isArray(his.data) ? his.data : []);
                    scrollToBottom('auto');
                }
            } catch (e) {
                console.error('히스토리 실패', e);
            }

            refreshCurrent();
        })();

        // 실시간
        const socket = new SockJS('/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 3000,
            onConnect: () => {
                setConnected(true);
                client.subscribe(`/topic/chat/${roomId}`, (frame) => {
                    try {
                        const msg = JSON.parse(frame.body);
                        setMessages((prev) => [...prev, msg]);
                        scrollToBottom('smooth');
                        if (
                            msg.type === 'RENTAL_PROPOSAL' ||
                            msg.type === 'RENTAL_UPDATE' ||
                            (msg.type === 'SYSTEM' && msg.msgType === 'RENTAL')
                        ) {
                            refreshCurrent();
                        }
                    } catch (e) {
                        console.error('ws parse 실패', e);
                    }
                });
            },
            onStompError: (f) => console.error('STOMP error', f),
            onWebSocketClose: () => setConnected(false),
        });
        client.activate();
        clientRef.current = client;

        return () => {
            ignore = true;
            client.deactivate();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId]);

    // 메시지 추가 시 자동 스크롤 (초기 로드 포함)
    useEffect(() => {
        scrollToBottom('smooth');
    }, [messages.length]);

    // 텍스트 전송
    const sendText = () => {
        if (!clientRef.current || !myKakaoId) return;
        const text = input.trim();
        if (!text) return;
        clientRef.current.publish({
            destination: `/app/chat/${roomId}`,
            body: JSON.stringify({ content: text, senderKakaoId: myKakaoId }),
        });
        setInput('');
    };

    // 이미지 전송
    const sendImage = async (file) => {
        if (!clientRef.current || !myKakaoId) return;
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드할 수 있습니다.');
            return;
        }
        const MAX = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX) {
            alert('10MB 이하의 이미지만 업로드할 수 있습니다.');
            return;
        }

        try {
            setUploading(true);
            const fd = new FormData();
            fd.append('image', file);
            const res = await axios.post('/api/upload', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const imageUrl = typeof res.data === 'string' ? res.data : res.data?.url;
            if (!imageUrl) throw new Error('업로드 응답이 비어있습니다.');

            clientRef.current.publish({
                destination: `/app/chat/${roomId}`,
                body: JSON.stringify({
                    content: '',
                    imageUrl,
                    senderKakaoId: myKakaoId,
                }),
            });
        } catch (e) {
            console.error(e);
            alert('이미지 전송 실패');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleKeyDown = (e) => {
        if (e.key !== 'Enter') return;
        if (e.shiftKey) return; // 줄바꿈
        if (composingRef.current || e.nativeEvent?.isComposing) return; // 한글 조합
        e.preventDefault();
        sendText();
    };

    // 거래 액션
    const postRental = async (url) => {
        await axios.post(url);
        await refreshCurrent();
    };
    const accept = (rentalId = current.rentalId) =>
        postRental(`/api/rentals/${rentalId}/accept`).catch((e) =>
            alert('수락 실패: ' + (e?.response?.data || e.message))
        );
    const reject = (rentalId = current.rentalId) =>
        postRental(`/api/rentals/${rentalId}/reject`).catch((e) =>
            alert('거절 실패: ' + (e?.response?.data || e.message))
        );
    const complete = (rentalId = current.rentalId) =>
        postRental(`/api/rentals/${rentalId}/complete`).catch((e) =>
            alert('거래완료 실패: ' + (e?.response?.data || e.message))
        );

    // 거래 제안
    const openPropose = () => {
        setProposeForm({ startDate: '', endDate: '', deposit: '' });
        setProposeOpen(true);
    };
    const submitPropose = async () => {
        if (!roomMeta) return alert('방 정보가 준비되지 않았습니다.');
        const { startDate, endDate, deposit } = proposeForm;
        if (!startDate || !endDate || !deposit) return alert('모든 값을 입력해주세요.');
        if (new Date(startDate) > new Date(endDate))
            return alert('종료일은 시작일 이후여야 합니다.');

        const params = new URLSearchParams({
            roomId,
            productId: String(roomMeta.productId),
            borrowerId: String(roomMeta.otherUserId),
            startDate,
            endDate,
            deposit: String(deposit),
        });
        try {
            await axios.post(`/api/rentals/propose?${params.toString()}`);
            setProposeOpen(false);
            await refreshCurrent();
        } catch (e) {
            alert('제안 실패: ' + (e?.response?.data || e.message));
        }
    };

    const amOwner = useMemo(
        () => !!(roomMeta && myKakaoId && String(roomMeta.ownerKakaoId) === String(myKakaoId)),
        [roomMeta, myKakaoId]
    );

    // ------------- 렌더 -------------
    const opponentNickname =
        otherUserMeta?.nickname || otherUserMeta?.name || '상대방';
    const productName = productMeta?.name || '상품';
    const productThumb = resolveImage(productMeta?.imageUrl);

    return (
        <div className="max-w-3xl mx-auto h-[calc(100vh-6rem)] flex flex-col border rounded-xl bg-white overflow-hidden">
            {/* 헤더 */}
            <header className="flex items-center gap-3 px-4 py-3 border-b bg-white">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-500 hover:text-gray-800 px-2"
                    aria-label="뒤로가기"
                >
                    ←
                </button>
                {productThumb ? (
                    <img
                        src={productThumb}
                        alt={productName}
                        className="w-9 h-9 rounded-lg object-cover bg-gray-100"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                        🛍️
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{opponentNickname}</div>
                    <div className="text-xs text-gray-500 truncate">{productName}</div>
                </div>
                <span
                    className={`text-xs px-2 py-1 rounded-full ${
                        connected
                            ? 'bg-green-50 text-green-600'
                            : 'bg-gray-100 text-gray-500'
                    }`}
                >
                    {connected ? '연결됨' : '재연결 중'}
                </span>
            </header>

            {/* 거래 상태 배너 */}
            {current.status && current.status !== 'NONE' && (
                <div className="px-4 py-2 bg-primary/10 text-primary text-sm border-b">
                    거래 상태: <b>{statusLabel(current.status)}</b>
                </div>
            )}

            {/* 메시지 영역 */}
            <div
                className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-50"
                id="chat-scroll"
            >
                {messages.map((raw, idx) => {
                    const normalized = toRenderable(raw);
                    const prev = idx > 0 ? messages[idx - 1] : null;
                    const showDateDivider =
                        !prev || !sameDay(prev?.timestamp, raw?.timestamp);

                    // 거래 카드
                    if (normalized.kind === 'rental' && normalized.rental) {
                        const r = normalized.rental;
                        return (
                            <React.Fragment key={idx}>
                                {showDateDivider && raw?.timestamp && (
                                    <DateDivider label={formatDateDivider(raw.timestamp)} />
                                )}
                                <div className="w-full flex justify-center">
                                    <div className="max-w-sm w-full bg-white border border-primary/30 rounded-xl p-3 shadow-sm">
                                        <div className="font-semibold mb-1">
                                            {r.type === 'RENTAL_PROPOSAL'
                                                ? '💬 대여 제안'
                                                : '🔔 거래 업데이트'}
                                        </div>
                                        <div className="text-sm text-gray-700 space-y-0.5">
                                            {r.productName && (
                                                <div>
                                                    <span className="text-gray-500">상품 · </span>
                                                    {r.productName}
                                                </div>
                                            )}
                                            {r.periodStart && r.periodEnd && (
                                                <div>
                                                    <span className="text-gray-500">기간 · </span>
                                                    {r.periodStart} ~ {r.periodEnd}
                                                </div>
                                            )}
                                            {typeof r.deposit === 'number' && (
                                                <div>
                                                    <span className="text-gray-500">보증금 · </span>
                                                    {r.deposit.toLocaleString()}원
                                                </div>
                                            )}
                                            {r.status && (
                                                <div>
                                                    <span className="text-gray-500">상태 · </span>
                                                    {statusLabel(r.status)}
                                                </div>
                                            )}
                                            {typeof r.completeProgress === 'number' && (
                                                <div>
                                                    <span className="text-gray-500">완료 확인 · </span>
                                                    {r.completeProgress}/2
                                                </div>
                                            )}
                                            {r.text && <div>{r.text}</div>}
                                        </div>
                                        {Array.isArray(r.actions) && r.actions.length > 0 && (
                                            <div className="mt-3 flex gap-2 justify-end">
                                                {r.actions.includes('REJECT') && (
                                                    <button
                                                        onClick={() => reject(r.rentalId)}
                                                        className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-50"
                                                    >
                                                        거절
                                                    </button>
                                                )}
                                                {r.actions.includes('ACCEPT') && (
                                                    <button
                                                        onClick={() => accept(r.rentalId)}
                                                        className="px-3 py-1 rounded-lg bg-primary text-white text-sm hover:opacity-90"
                                                    >
                                                        수락
                                                    </button>
                                                )}
                                                {r.actions.includes('COMPLETE') && (
                                                    <button
                                                        onClick={() => complete(r.rentalId)}
                                                        className="px-3 py-1 rounded-lg bg-primary text-white text-sm hover:opacity-90"
                                                    >
                                                        거래완료
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    }

                    // 시스템 텍스트
                    if (normalized.kind === 'system') {
                        return (
                            <React.Fragment key={idx}>
                                {showDateDivider && raw?.timestamp && (
                                    <DateDivider label={formatDateDivider(raw.timestamp)} />
                                )}
                                <div className="w-full flex justify-center">
                                    <span className="text-xs text-gray-500 bg-white border rounded-full px-3 py-1">
                                        {normalized.text || '시스템 메시지'}
                                    </span>
                                </div>
                            </React.Fragment>
                        );
                    }

                    // 일반 채팅
                    const msg = normalized.msg || raw;
                    const isMine = msg.senderKakaoId === myKakaoId;

                    // 같은 사람이 연속으로 보낸 경우 시간/닉네임 생략
                    const prevMsg = prev ? toRenderable(prev) : null;
                    const prevIsSame =
                        prevMsg?.kind === 'chat' &&
                        prevMsg.msg?.senderKakaoId === msg.senderKakaoId &&
                        sameDay(prev?.timestamp, msg?.timestamp);

                    const next = idx < messages.length - 1 ? messages[idx + 1] : null;
                    const nextMsg = next ? toRenderable(next) : null;
                    const nextIsSame =
                        nextMsg?.kind === 'chat' &&
                        nextMsg.msg?.senderKakaoId === msg.senderKakaoId &&
                        sameDay(next?.timestamp, msg?.timestamp);

                    return (
                        <React.Fragment key={idx}>
                            {showDateDivider && raw?.timestamp && (
                                <DateDivider label={formatDateDivider(raw.timestamp)} />
                            )}
                            <div
                                className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end gap-2`}
                            >
                                {/* 상대방 아바타 영역 (연속 메시지일 때는 빈 공간) */}
                                {!isMine && (
                                    <div className="w-8 flex-shrink-0">
                                        {!prevIsSame && (
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                                {opponentNickname?.[0] || '?'}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                    {!prevIsSame && !isMine && (
                                        <span className="text-xs text-gray-500 mb-0.5">
                                            {opponentNickname}
                                        </span>
                                    )}
                                    <div className="flex items-end gap-1">
                                        {isMine && !nextIsSame && (
                                            <span className="text-[11px] text-gray-400 whitespace-nowrap">
                                                {formatTime(msg.timestamp)}
                                            </span>
                                        )}
                                        {/* 이미지 메시지 */}
                                        {msg.imageUrl ? (
                                            <a
                                                href={resolveImage(msg.imageUrl)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={`block rounded-2xl overflow-hidden border ${
                                                    isMine ? 'border-primary/40' : 'border-gray-200'
                                                }`}
                                            >
                                                <img
                                                    src={resolveImage(msg.imageUrl)}
                                                    alt="사진"
                                                    className="max-w-[240px] max-h-[320px] object-cover"
                                                />
                                            </a>
                                        ) : (
                                            <div
                                                className={`px-3 py-2 rounded-2xl whitespace-pre-wrap break-words text-sm ${
                                                    isMine
                                                        ? 'bg-primary text-white rounded-br-md'
                                                        : 'bg-white border rounded-bl-md'
                                                }`}
                                            >
                                                {msg.content}
                                            </div>
                                        )}
                                        {!isMine && !nextIsSame && (
                                            <span className="text-[11px] text-gray-400 whitespace-nowrap">
                                                {formatTime(msg.timestamp)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* 하단 액션바 (거래 흐름) */}
            {amOwner && current.status === 'NONE' && (
                <div className="px-4 py-2 bg-white border-t">
                    <button
                        onClick={openPropose}
                        className="w-full px-3 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90"
                    >
                        거래 조건 확정하기
                    </button>
                </div>
            )}
            {current.status === 'PENDING' && !amOwner && (
                <div className="px-4 py-2 bg-white border-t flex gap-2">
                    <button
                        onClick={() => reject()}
                        className="flex-1 px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
                    >
                        거절
                    </button>
                    <button
                        onClick={() => accept()}
                        className="flex-1 px-3 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90"
                    >
                        수락
                    </button>
                </div>
            )}
            {current.status === 'PENDING' && amOwner && (
                <div className="px-4 py-2 bg-white border-t text-xs text-gray-500 text-center">
                    대여자가 수락/거절을 선택할 때까지 기다려주세요.
                </div>
            )}
            {current.status === 'ACTIVE' && (
                <div className="px-4 py-2 bg-white border-t">
                    <button
                        onClick={() => complete()}
                        className="w-full px-3 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90"
                    >
                        거래완료
                    </button>
                </div>
            )}

            {/* 입력창 */}
            <div className="flex items-end gap-2 p-3 border-t bg-white">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => sendImage(e.target.files?.[0])}
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || !connected}
                    className="w-10 h-10 flex items-center justify-center rounded-full border hover:bg-gray-50 disabled:opacity-40"
                    title="사진 전송"
                    aria-label="사진 전송"
                >
                    📷
                </button>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onCompositionStart={() => (composingRef.current = true)}
                    onCompositionEnd={() => (composingRef.current = false)}
                    placeholder="메시지를 입력하세요 (Shift+Enter 줄바꿈)"
                    rows={1}
                    className="flex-1 resize-none border rounded-2xl px-3 py-2 text-sm max-h-32 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                    type="button"
                    onClick={sendText}
                    disabled={!input.trim() || !connected}
                    className="px-4 h-10 rounded-full bg-primary text-white text-sm disabled:opacity-40"
                >
                    전송
                </button>
            </div>

            {/* 제안 모달 */}
            {proposeOpen && (
                <div className="fixed inset-0 bg-black/40 z-40 grid place-items-center">
                    <div className="bg-white rounded-xl p-5 w-full max-w-sm shadow-lg">
                        <h3 className="text-lg font-bold mb-3">대여 조건 설정</h3>
                        <div className="space-y-3">
                            <label className="block text-sm">
                                <span className="block text-gray-600 mb-1">시작일</span>
                                <input
                                    type="date"
                                    value={proposeForm.startDate}
                                    onChange={(e) =>
                                        setProposeForm((f) => ({ ...f, startDate: e.target.value }))
                                    }
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </label>
                            <label className="block text-sm">
                                <span className="block text-gray-600 mb-1">종료일</span>
                                <input
                                    type="date"
                                    value={proposeForm.endDate}
                                    onChange={(e) =>
                                        setProposeForm((f) => ({ ...f, endDate: e.target.value }))
                                    }
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </label>
                            <label className="block text-sm">
                                <span className="block text-gray-600 mb-1">보증금(원)</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    placeholder="예: 50000"
                                    value={proposeForm.deposit}
                                    onChange={(e) =>
                                        setProposeForm((f) => ({ ...f, deposit: e.target.value }))
                                    }
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </label>
                        </div>
                        <div className="mt-5 flex gap-2 justify-end">
                            <button
                                onClick={() => setProposeOpen(false)}
                                className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                            >
                                취소
                            </button>
                            <button
                                onClick={submitPropose}
                                className="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90"
                            >
                                확정하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 날짜 구분선
const DateDivider = ({ label }) => (
    <div className="flex items-center justify-center my-2">
        <span className="text-xs text-gray-500 bg-white border rounded-full px-3 py-1">
            {label}
        </span>
    </div>
);

export default ChatRoomPage;
