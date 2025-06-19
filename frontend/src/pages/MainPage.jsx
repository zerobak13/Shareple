import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

const MainPage = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchMyProducts = async () => {
            try {
                const response = await axios.get('/api/products/my');
                setProducts(response.data);
            } catch (err) {
                console.error('상품 목록 불러오기 실패:', err);
            }
        };
        fetchMyProducts();
    }, []);

    return (
        <div>
            <h2>내가 등록한 물품</h2>
            {products.length === 0 ? (
                <p>등록된 물품이 없습니다.</p>
            ) : (
                <ul>
                    {products.map((product) => (
                        <li key={product.id}>
                            <img src={product.imageUrl} alt="제품" width="100" />
                            <p>{product.name}</p>
                            <p>{product.price}원 / 보증금 {product.deposit}원</p>
                            <p>{product.description}</p>
                            {/* 나중에 수정/삭제 버튼도 여기에 추가 */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MainPage;
