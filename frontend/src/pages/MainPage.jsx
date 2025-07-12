// MainPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';

const MainPage = () => {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/products/all')
            .then(res => setProducts(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="px-4 py-6">
            <h2 className="text-2xl font-bold mb-4">📦 등록된 물품들</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {products.map(product => (
                    <div
                        key={product.id}
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="border rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    >
                        <img
                            src={`http://localhost:8080${product.imageUrl}`}
                            alt={product.name}
                            className="w-full h-40 object-cover rounded-xl mb-2"
                        />
                        <h4 className="text-lg font-semibold truncate">{product.name}</h4>
                        <p className="text-sm text-gray-500">{product.price.toLocaleString()}원/1일</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MainPage;
