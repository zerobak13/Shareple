// src/components/ReviewWriteModal.jsx
// 반납된 거래에서 리뷰를 작성하는 모달.
// rental 객체 (RentalListItemDto) 를 받아 상품/상대 정보를 보여주고
// 별점 + 본문을 받아 POST /api/reviews 로 제출한다.
import React, { useState } from 'react';
import axios from '../api/axiosInstance';
import StarRating from './StarRating';

const resolveImage = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return url;
    return `/uploads/${url.replace(/^\/+/, '')}`;
};

const ReviewWriteModal = ({ rental, onClose, onSubmitted }) => {
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!rental) return null;

    const opponent =
        rental.myRole === 'OWNER'
            ? rental.borrowerNickname || '대여자'
            : rental.ownerNickname || '물품 주인';
    const img = resolveImage(rental.productImageUrl);

    const submit = async () => {
        if (!rating || rating < 1 || rating > 5) {
            alert('별점을 선택해주세요.');
            return;
        }
        try {
            setSubmitting(true);
            await axios.post('/api/reviews', {
                rentalId: rental.rentalId,
                rating,
                content: content.trim(),
            });
            alert('리뷰가 등록되었습니다.');
            onSubmitted && onSubmitted();
        } catch (e) {
            const msg = e?.response?.data?.error || e.message;
            alert('리뷰 등록 실패: ' + msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-lg">
                <div className="p-5 border-b">
                    <h3 className="text-lg font-bold">거래 후기 작성</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        이번 거래에 대해 솔직한 후기를 남겨주세요.
                    </p>
                </div>

                {/* 상품/상대 요약 */}
                <div className="flex items-center gap-3 px-5 py-4 border-b bg-gray-50">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                        {img ? (
                            <img
                                src={img}
                                alt={rental.productName || 'product'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xl">🛍️</span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="font-semibold truncate">
                            {rental.productName || '상품'}
                        </div>
                        <div className="text-xs text-gray-500">
                            상대: {opponent}
                        </div>
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            별점
                        </label>
                        <StarRating value={rating} onChange={setRating} size="lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            후기 내용
                        </label>
                        <textarea
                            rows={5}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="거래 상대와 물품 상태에 대한 후기를 적어주세요."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 px-5 py-4 border-t">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                        취소
                    </button>
                    <button
                        onClick={submit}
                        disabled={submitting}
                        className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90 disabled:opacity-50"
                    >
                        {submitting ? '등록 중...' : '등록'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewWriteModal;
