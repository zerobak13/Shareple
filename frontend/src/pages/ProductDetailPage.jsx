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
        </div>
    );
};

export default ProductDetailPage;
