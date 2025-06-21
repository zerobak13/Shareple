// MainPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';

const MainPage = () => {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/products/all') // 전체 물품 조회 API
            .then(res => setProducts(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h2>등록된 물품들</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {products.map(product => (
                    <div
                        key={product.id}
                        onClick={() => navigate(`/products/${product.id}`)}
                        style={{
                            border: '1px solid #ccc',
                            padding: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        <img
                            src={`http://localhost:8080${product.imageUrl}`}
                            alt={product.name}
                            style={{ width: '100px', height: '100px' }}
                        />
                        <h4>{product.name}</h4>
                        <p>{product.price}원</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MainPage;
