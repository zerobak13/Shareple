// src/components/RentalItemCard.jsx
// 대여/반납 내역 목록의 공용 카드 컴포넌트.
// RentalHistoryPage / ReturnHistoryPage 가 공유한다.
import React from 'react';
import { useNavigate } from 'react-router-dom';

const resolveImage = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return url;
    return `/uploads/${url.replace(/^\/+/, '')}`;
};

const STATUS_LABEL = {
    PENDING: { label: '수락 대기', className: 'bg-yellow-100 text-yellow-700' },
    ACTIVE: { label: '대여 진행 중', className: 'bg-blue-100 text-blue-700' },
    COMPLETED: { label: '반납 완료', className: 'bg-green-100 text-green-700' },
    REJECTED: { label: '거절됨', className: 'bg-gray-100 text-gray-500' },
};

const RentalItemCard = ({ item, actions = null }) => {
    const navigate = useNavigate();
    const img = resolveImage(item.productImageUrl);
    const statusInfo = STATUS_LABEL[item.status] || { label: item.status, className: 'bg-gray-100 text-gray-600' };

    const opponent =
        item.myRole === 'OWNER'
            ? item.borrowerNickname || '대여자'
            : item.ownerNickname || '물품 주인';

    return (
        <div className="flex gap-3 p-4 border rounded-xl bg-white">
            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {img ? (
                    <img
                        src={img}
                        alt={item.productName || 'product'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                ) : (
                    <span className="text-2xl">🛍️</span>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold truncate">
                        {item.productName || '상품'}
                    </h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${statusInfo.className}`}>
                        {statusInfo.label}
                    </span>
                </div>

                <p className="mt-1 text-sm text-gray-600 truncate">
                    {item.myRole === 'OWNER' ? '대여자: ' : '물품 주인: '}
                    <span className="font-medium">{opponent}</span>
                </p>

                <p className="mt-1 text-xs text-gray-500">
                    {item.startDate && item.endDate
                        ? `${item.startDate} ~ ${item.endDate}`
                        : '기간 미정'}
                    {' · '}
                    보증금 {Number(item.deposit || 0).toLocaleString()}원
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                    {item.chatRoomId && (
                        <button
                            onClick={() => navigate(`/chat/${item.chatRoomId}`)}
                            className="px-3 py-1 text-xs rounded-lg border hover:bg-gray-50"
                        >
                            채팅으로 이동
                        </button>
                    )}
                    {item.productId && (
                        <button
                            onClick={() => navigate(`/products/${item.productId}`)}
                            className="px-3 py-1 text-xs rounded-lg border hover:bg-gray-50"
                        >
                            상품 보기
                        </button>
                    )}
                    {actions}
                </div>
            </div>
        </div>
    );
};

export default RentalItemCard;
