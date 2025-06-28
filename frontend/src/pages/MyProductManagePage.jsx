import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyProductManagePage = () => {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/products/my')
            .then(res => res.json())
            .then(setProducts);
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        alert("삭제되었습니다");
        setProducts(products.filter(p => p.id !== id));
    };

    return (
        <div>
            <h2>📦 내 등록 물품 관리</h2>
            {products.map(product => (
                <div key={product.id} style={{ border: '1px solid #ddd', margin: '1rem 0', padding: '1rem' }}>
                    <img src={`http://localhost:8080${product.imageUrl}`} alt="물건" width="150" />
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <p>가격: {product.price}원, 보증금: {product.deposit}원</p>
                    <button onClick={() => navigate(`/edit/${product.id}`)}>수정</button>
                    <button onClick={() => handleDelete(product.id)}>삭제</button>
                    <button onClick={() => navigate("/chat-rooms")}>
                        채팅 목록 보기
                    </button>
                </div>
            ))}
        </div>
    );
};

export default MyProductManagePage;
