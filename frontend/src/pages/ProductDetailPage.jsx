import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import StarRating from '../components/StarRating';

const resolveImg = (url) => {
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

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [summary, setSummary] = useState(null);
    const [reviews, setReviews] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`/api/products/${id}`)
            .then(res => setProduct(res.data))
            .catch(err => console.error(err));
    }, [id]);

    useEffect(() => {
        axios.get('/api/auth/me')
            .then(res => setCurrentUser(res.data))
            .catch(err => console.error('유저 정보 불러오기 실패', err));
    }, []);

    useEffect(() => {
        if (!id) return;
        axios.get(`/api/reviews/product/${id}/summary`)
            .then(res => setSummary(res.data))
            .catch(() => setSummary(null));
        axios.get(`/api/reviews/product/${id}`)
            .then(res => setReviews(Array.isArray(res.data) ? res.data : []))
            .catch(() => setReviews([]));
    }, [id]);

    if (!product || !currentUser) return <div className="p-8">불러오는 중...</div>;

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white shadow-md rounded-xl mt-8">
            <div className="grid md:grid-cols-2 gap-8">
                {/* 상품 이미지 */}
                <img
                    src={`http://localhost:8080${product.imageUrl}`}
                    alt={product.name}
                    className="w-full h-80 object-cover rounded-xl"
                />

                {/* 상품 정보 */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-primary">{product.name}</h2>
                    <p className="text-lg font-semibold text-gray-700">💰 {product.price.toLocaleString()}원 / 1일</p>
                    <p className="text-gray-600">🔒 보증금: {product.deposit.toLocaleString()}원</p>
                    <p className="text-gray-600">📂 카테고리: {product.category}</p>
                    <p className="text-gray-600">📅 대여 마감일: {product.deadline}</p>
                    <p className="text-gray-600">🚚 대여 방식: {product.method}</p>
                    <p className="text-gray-600">📍 거래 위치: {product.location}</p>
                    <p className="text-gray-700 whitespace-pre-line mt-2 bg-gray-100 rounded-lg p-4">{product.description}</p>
                    <hr />
                    <div className="text-sm text-gray-500">
                        <p><strong>판매자:</strong> {product.sellerNickname}</p>
                        <p><strong>이메일:</strong> {product.sellerEmail}</p>
                        {summary && summary.count > 0 && (
                            <div className="mt-1 flex items-center gap-2">
                                <strong>평점:</strong>
                                <StarRating
                                    value={summary.average}
                                    readOnly
                                    showNumber
                                    count={summary.count}
                                    size="sm"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 버튼 */}
            <div className="mt-8 text-right">
                {product.sellerKakaoId !== currentUser.kakaoId ? (
                    <button
                        onClick={() => {
                            axios.post('/api/chat/create', {
                                receiverKakaoId: product.sellerKakaoId,
                                productId: product.id
                            })
                                .then(res => {
                                    const roomId = res.data.id;
                                    navigate(`/chat/${roomId}`);
                                })
                                .catch(err => {
                                    console.error(err);
                                    alert("채팅방 생성에 실패했습니다.");
                                });
                        }}
                        className="bg-accent hover:bg-purple-600 text-white font-semibold px-6 py-2 rounded-lg transition"
                    >
                        💬 채팅하기
                    </button>
                ) : (
                    <button
                        onClick={() => navigate('/chat-rooms')}
                        className="bg-primary hover:bg-teal-500 text-white font-semibold px-6 py-2 rounded-lg transition"
                    >
                        📋 채팅 목록 보기
                    </button>
                )}
            </div>

            {/* 리뷰 섹션 */}
            <section className="mt-10 pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">후기</h3>
                    {summary && (
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
                    <div className="text-center text-gray-400 py-10 border-2 border-dashed rounded-xl">
                        아직 이 상품에 대한 후기가 없습니다.
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {reviews.map((r) => {
                            const profileImg = resolveImg(r.reviewerProfileImageUrl);
                            return (
                                <li key={r.id} className="p-4 border rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                                            {profileImg ? (
                                                <img src={profileImg} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm">
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
