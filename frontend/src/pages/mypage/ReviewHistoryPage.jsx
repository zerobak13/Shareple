// src/pages/mypage/ReviewHistoryPage.jsx
// 명세서: 마이페이지 > 리뷰 내역
//  - 내가 작성한 리뷰
//  - 내가 받은 리뷰 (내 물품/내 닉네임에 달린 리뷰)
import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosInstance';
import StarRating from '../../components/StarRating';

const resolveImage = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return url;
    return `/uploads/${url.replace(/^\/+/, '')}`;
};

const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

const ReviewRow = ({ review, tab }) => {
    const img = resolveImage(review.productImageUrl);
    const opposite =
        tab === 'written'
            ? review.revieweeNickname || '상대'
            : review.reviewerNickname || '상대';

    return (
        <div className="flex gap-3 p-4 border rounded-xl bg-white">
            <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {img ? (
                    <img
                        src={img}
                        alt={review.productName || 'product'}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-xl">🛍️</span>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold truncate">
                        {review.productName || '상품'}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(review.createdAt)}
                    </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm">
                    <StarRating value={review.rating} readOnly size="sm" />
                    <span className="text-xs text-gray-500">
                        {tab === 'written' ? '대상: ' : '작성자: '}
                        {opposite}
                    </span>
                </div>
                {review.content && (
                    <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap break-words">
                        {review.content}
                    </p>
                )}
            </div>
        </div>
    );
};

const ReviewHistoryPage = () => {
    const [tab, setTab] = useState('written'); // 'written' | 'received'
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let ignore = false;
        (async () => {
            setLoading(true);
            try {
                const res = await axios.get('/api/reviews/my', { params: { type: tab } });
                if (!ignore) setItems(Array.isArray(res.data) ? res.data : []);
            } catch (e) {
                console.error('리뷰 목록 로드 실패', e);
                if (!ignore) setItems([]);
            } finally {
                if (!ignore) setLoading(false);
            }
        })();
        return () => {
            ignore = true;
        };
    }, [tab]);

    return (
        <div>
            <h3 className="text-xl font-bold mb-4">리뷰 내역</h3>

            <div className="flex gap-2 mb-4 border-b">
                <button
                    onClick={() => setTab('written')}
                    className={`px-4 py-2 text-sm -mb-px border-b-2 ${
                        tab === 'written'
                            ? 'border-primary text-primary font-semibold'
                            : 'border-transparent text-gray-500'
                    }`}
                >
                    내가 작성한 리뷰
                </button>
                <button
                    onClick={() => setTab('received')}
                    className={`px-4 py-2 text-sm -mb-px border-b-2 ${
                        tab === 'received'
                            ? 'border-primary text-primary font-semibold'
                            : 'border-transparent text-gray-500'
                    }`}
                >
                    내가 받은 리뷰
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400">불러오는 중...</div>
            ) : items.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
                    {tab === 'written'
                        ? '아직 작성한 리뷰가 없습니다. 반납이 완료된 거래에서 리뷰를 남길 수 있어요.'
                        : '아직 받은 리뷰가 없습니다.'}
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((r) => (
                        <ReviewRow key={r.id} review={r} tab={tab} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewHistoryPage;
