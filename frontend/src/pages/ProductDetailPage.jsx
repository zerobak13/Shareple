// src/pages/ProductDetailPage.jsx
// 상품 상세 — 이미지/정보/판매자/리뷰.
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import StarRating from '../components/StarRating';
import EmptyState from '../components/EmptyState';
import { LoadingBlock } from '../components/Spinner';

const resolveImg = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8080${url}`;
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

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [summary, setSummary] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);

    useEffect(() => {
        axios.get(`/api/products/${id}`)
            .then((res) => setProduct(res.data))
            .catch((err) => console.error(err));
    }, [id]);

    useEffect(() => {
        axios.get('/api/auth/me')
            .then((res) => setCurrentUser(res.data))
            .catch((err) => console.error('유저 정보 불러오기 실패', err));
    }, []);

    useEffect(() => {
        if (!id) return;
        axios.get(`/api/reviews/product/${id}/summary`)
            .then((res) => setSummary(res.data))
            .catch(() => setSummary(null));
        axios.get(`/api/reviews/product/${id}`)
            .then((res) => setReviews(Array.isArray(res.data) ? res.data : []))
            .catch(() => setReviews([]));
    }, [id]);

    const startChat = async () => {
        if (chatLoading) return;
        setChatLoading(true);
        try {
            const res = await axios.post('/api/chat/create', {
                receiverKakaoId: product.sellerKakaoId,
                productId: product.id,
            });
            navigate(`/chat/${res.data.id}`);
        } catch (err) {
            console.error(err);
            alert('채팅방 생성에 실패했어요.');
        } finally {
            setChatLoading(false);
        }
    };

    if (!product || !currentUser) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <LoadingBlock />
            </div>
        );
    }

    const img = resolveImg(product.imageUrl);
    const isOwner = product.sellerKakaoId === currentUser.kakaoId;
    const isRented = String(product.status || '').toUpperCase() === 'RENTED';

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            {/* 상단 */}
            <div className="card overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                    {/* 이미지 */}
                    <div className="relative aspect-square bg-gray-100">
                        {img ? (
                            <img
                                src={img}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full grid place-items-center text-5xl text-gray-300">
                                🛍️
                            </div>
                        )}
                        {isRented && (
                            <span className="absolute left-3 top-3 bg-black/70 text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                                대여중
                            </span>
                        )}
                        {product.category && (
                            <span className="absolute right-3 top-3 bg-white/90 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                                {product.category}
                            </span>
                        )}
                    </div>

                    {/* 정보 */}
                    <div className="p-6 md:p-8 flex flex-col">
                        <h1 className="text-2xl font-extrabold text-gray-900">{product.name}</h1>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-primary">
                                {Number(product.price || 0).toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500">원 / 1일</span>
                        </div>
                        {summary && summary.count > 0 && (
                            <div className="mt-2">
                                <StarRating
                                    value={summary.average}
                                    readOnly
                                    showNumber
                                    count={summary.count}
                                    size="sm"
                                />
                            </div>
                        )}

                        <dl className="mt-5 grid grid-cols-2 gap-y-2 text-sm">
                            <dt className="text-gray-500">보증금</dt>
                            <dd className="text-gray-800 font-medium">
                                {Number(product.deposit || 0).toLocaleString()}원
                            </dd>
                            <dt className="text-gray-500">대여 마감일</dt>
                            <dd className="text-gray-800 font-medium">{product.deadline || '-'}</dd>
                            <dt className="text-gray-500">대여 방식</dt>
                            <dd className="text-gray-800 font-medium">{product.method || '-'}</dd>
                            <dt className="text-gray-500">거래 지역</dt>
                            <dd className="text-gray-800 font-medium">📍 {product.location || '-'}</dd>
                        </dl>

                        {product.description && (
                            <div className="mt-5 text-sm text-gray-700 whitespace-pre-line bg-gray-50 rounded-xl p-4">
                                {product.description}
                            </div>
                        )}

                        {/* 판매자 */}
                        <div className="mt-5 pt-5 border-t text-sm">
                            <div className="text-xs text-gray-500 mb-1">판매자</div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-semibold">{product.sellerNickname || '알 수 없음'}</div>
                                    <div className="text-xs text-gray-500">{product.sellerEmail}</div>
                                </div>
                            </div>
                        </div>

                        {/* 액션 */}
                        <div className="mt-6">
                            {isOwner ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/edit/${product.id}`)}
                                        className="btn-secondary flex-1"
                                    >
                                        물품 수정
                                    </button>
                                    <button
                                        onClick={() => navigate('/chat-rooms')}
                                        className="btn-primary flex-1"
                                    >
                                        💬 채팅 목록
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={startChat}
                                    disabled={chatLoading || isRented}
                                    className="btn-primary w-full !py-3"
                                >
                                    {isRented
                                        ? '현재 대여중인 상품이에요'
                                        : chatLoading
                                            ? '채팅방 여는 중...'
                                            : '💬 판매자와 채팅하기'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 리뷰 */}
            <section className="mt-8">
                <div className="flex items-end justify-between mb-3">
                    <h2 className="text-lg font-bold">후기</h2>
                    {summary && summary.count > 0 && (
                        <StarRating
                            value={summary.average}
                            readOnly
                            showNumber
                            count={summary.count}
                            size="sm"
                        />
                    )}
                </div>
                {reviews.length === 0 ? (
                    <EmptyState
                        icon="⭐"
                        title="아직 후기가 없어요"
                        description={'첫 리뷰가 거래에 큰 도움이 돼요.'}
                    />
                ) : (
                    <ul className="space-y-3">
                        {reviews.map((r) => {
                            const profileImg = resolveImg(r.reviewerProfileImageUrl);
                            return (
                                <li key={r.id} className="card p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 grid place-items-center flex-shrink-0">
                                            {profileImg ? (
                                                <img src={profileImg} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-bold text-gray-500">
                                                    {(r.reviewerNickname || '?')[0]}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-semibold text-sm">
                                                    {r.reviewerNickname || '익명'}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {formatDate(r.createdAt)}
                                                </span>
                                            </div>
                                            <StarRating value={r.rating} readOnly size="sm" />
                                            {r.content && (
                                                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                                                    {r.content}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default ProductDetailPage;
