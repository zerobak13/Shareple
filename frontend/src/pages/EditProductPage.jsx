import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [image, setImage] = useState(null);

    useEffect(() => {
        fetch(`/api/products/my`)
            .then(res => res.json())
            .then(data => {
                const found = data.find(item => item.id === parseInt(id));
                if (!found) {
                    alert("물품을 찾을 수 없습니다.");
                    navigate("/mypage/products");
                } else {
                    setProduct(found);
                }
            });
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", product.name);
        formData.append("price", product.price);
        formData.append("deposit", product.deposit);
        formData.append("description", product.description);
        formData.append("category", product.category);
        formData.append("deadline", product.deadline);
        formData.append("method", product.method);
        formData.append("location", product.location);
        if (image) formData.append("image", image);

        const response = await fetch(`/api/products/${id}`, {
            method: "PUT",
            body: formData
        });

        if (response.ok) {
            alert("수정 완료!");
            navigate("/mypage/products");
        } else {
            alert("수정 실패");
        }
    };

    if (!product) return <div>로딩 중...</div>;

    return (
        <form onSubmit={handleSubmit}>
            <h2>물품 수정</h2>
            <input type="text" value={product.name} onChange={e => setProduct({ ...product, name: e.target.value })} />
            <input type="number" value={product.price} onChange={e => setProduct({ ...product, price: e.target.value })} />
            <input type="file" onChange={e => setImage(e.target.files[0])} />
            <button type="submit">수정</button>
        </form>
    );
};

export default EditProductPage;
