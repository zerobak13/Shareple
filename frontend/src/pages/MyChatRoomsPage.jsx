// src/pages/MyChatRoomsPage.jsx
// 명세서 기준 채팅 목록:
//  - 상품 썸네일 / 상품명 / 상대 닉네임 / 마지막 메시지 미리보기 / 마지막 시각
//  - 검색(상품명 · 상대 닉네임)
//  - 빈 상태 / 로딩 상태
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';

// 마지막 메시지 시각을 카카오톡 스타일로 포맷
const formatWhen = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';

    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();

    const yest = new Date(now);
    yest.setDate(now.getDate() - 1);
    const isYest = d.toDateString() === yest.toDateString();

    if (sameDay) {
        return d.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    }
    if (isYest) return '어제';
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    if (now - d < oneWeek) {
        return ['일', '월', '화', '수', '목', '금', '토'][d.getDay()] + '요일';
    }
    return d.toLocaleDateString('ko-KR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
    });
};

const resolveImage = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return url;
    return `/uploads/${url.replace(/^\/+/, '')}`;
};

const MyChatRoomsPage = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        let ignore = false;
        (async () => {
            setLoading(true);
            try {
                const res = await axios.get('/api/chat/my-chat-rooms');
                if (!ignore) setRooms(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('채팅방 불러오기 실패:', err);
                if (!ignore) setRooms([]);
            } finally {
                if (!ignore) setLoading(false);
            }
        })();
        return () => {
            ignore = true;
        };
    }, []);

    const filtered = useMemo(() => {
        const kw = q.trim().toLowerCase();
        if (!kw) return rooms;
        return rooms.filter((r) => {
            const a = (r.productName || '').toLowerCase();
            const b = (r.otherNickname || '').toLowerCase();
            return a.includes(kw) || b.includes(kw);
        });
    }, [q, rooms]);

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">💬 내 채팅</h2>
                <span className="text-sm text-gray-500">총 {rooms.length}개</span>
            </div>

            {/* 검색 */}
            <div className="mb-4">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="상품명 또는 상대 닉네임으로 검색"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {/* 상태별 뷰 */}
            {loading ? (
                <div className="py-20 text-center text-gray-400">불러오는 중...</div>
            ) : filtered.length === 0 ? (
                <div className="py-20 text-center text-gray-400">
                    {rooms.length === 0
                        ? '아직 진행 중인 채팅이 없습니다.'
                        : '검색 결과가 없습니다.'}
                </div>
            ) : (
                <ul className="divide-y border rounded-xl overflow-hidden bg-white">
                    {filtered.map((room) => {
                        const img = resolveImage(room.productImageUrl);
                        return (
                            <li
                                key={room.id}
                                onClick={() => navigate(`/chat/${room.id}`)}
                                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition"
                            >
                                {/* 썸네일 */}
                                <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {img ? (
                                        <img
                                            src={img}
                                            alt={room.productName || 'product'}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <span className="text-2xl">🛍️</span>
                                    )}
                                </div>

                                {/* 본문 */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="font-semibold truncate">
                                                {room.otherNickname || '알 수 없음'}
                                            </span>
                                            <span className="text-xs text-gray-500 truncate">
                                                · {room.productName || '상품'}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {formatWhen(room.lastMessageAt)}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600 truncate">
                                        {room.lastMessage || '대화를 시작해 보세요.'}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default MyChatRoomsPage;
