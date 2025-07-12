import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';

const MainPage = () => {
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({
        location: '',
        deadline: '',
        minPrice: '',
        maxPrice: '',
        category: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllProducts();
    }, []);

    const fetchAllProducts = async () => {
        try {
            const res = await axios.get('/api/products/all');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFilteredProducts = async () => {
        try {
            const params = new URLSearchParams();

            if (filters.location) params.append('location', filters.location);
            if (filters.deadline) params.append('deadline', filters.deadline);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.category) params.append('category', filters.category);

            const res = await axios.get(`/api/products/filter?${params.toString()}`);
            setProducts(res.data);
        } catch (err) {
            console.error('필터링 실패:', err);
        }
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleReset = () => {
        setFilters({
            location: '',
            deadline: '',
            minPrice: '',
            maxPrice: '',
            category: ''
        });
        fetchAllProducts();
    };

    return (
        <div>
            <h2>물품 검색</h2>
            <div style={{ marginBottom: '1rem' }}>
                <input
                    type="text"
                    name="location"
                    placeholder="지역"
                    value={filters.location}
                    onChange={handleChange}
                />
                <input
                    type="date"
                    name="deadline"
                    value={filters.deadline}
                    onChange={handleChange}
                />
                <input
                    type="number"
                    name="minPrice"
                    placeholder="최소 가격"
                    value={filters.minPrice}
                    onChange={handleChange}
                />
                <input
                    type="number"
                    name="maxPrice"
                    placeholder="최대 가격"
                    value={filters.maxPrice}
                    onChange={handleChange}
                />
                <select
                    name="category"
                    value={filters.category}
                    onChange={handleChange}
                >
                    <option value="">카테고리 선택</option>
                    <option value="게임">게임</option>
                    <option value="서적">서적</option>
                    <option value="의류">의류</option>
                    <option value="악세서리">악세서리</option>
                    <option value="전자기기">전자기기</option>
                    <option value="여행용품">여행용품</option>
                    <option value="생활용품">생활용품</option>

                </select>
                <button onClick={fetchFilteredProducts}>필터 적용</button>
                <button onClick={handleReset}>초기화</button>
            </div>

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
