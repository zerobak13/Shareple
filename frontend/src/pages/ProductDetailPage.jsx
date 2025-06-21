import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axiosInstance';

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);

    useEffect(() => {
        axios.get(`/api/products/${id}`)
            .then(res => setProduct(res.data))
            .catch(err => console.error(err));
    }, [id]);

    if (!product) return <div>불러오는 중...</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <h2>{product.name}</h2>
            <img
                src={`http://localhost:8080${product.imageUrl}`}
                alt={product.name}
                style={{ width: '200px' }}
            />
            <p>가격: {product.price}원</p>
            <p>보증금: {product.deposit}원</p>
            <p>카테고리: {product.category}</p>
            <p>마감일: {product.deadline}</p>
            <p>대여방식: {product.method}</p>
            <p>위치: {product.location}</p>
            <p>설명: {product.description}</p>
            <hr />
            <p><strong>판매자:</strong> {product.sellerNickname}</p>
            <p><strong>이메일:</strong> {product.sellerEmail}</p>

            <button
                onClick={() => {
                    // TODO: 채팅방 생성 및 이동 구현
                    alert(`"${product.sellerNickname}"님과 채팅방을 시작합니다.`);
                }}
                style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                채팅하기
            </button>
        </div>
    );

};

export default ProductDetailPage;
