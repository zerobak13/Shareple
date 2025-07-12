import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
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
        </div>
    );
};

export default ProductDetailPage;
