import React, { useState } from 'react';
import axios from '../api/axiosInstance';

const ProductForm = () => {
    const [form, setForm] = useState({
        name: '',
        price: '',
        deposit: '',
        description: '',
        category: '',
        deadline: '',
        method: '',
        location: '',
    });
    const [image, setImage] = useState(null);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = e => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            data.append(key, value);
        });
        if (image) data.append('image', image);

        try {
            await axios.post('/api/products', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('등록 성공!');
        } catch (err) {
            alert('등록 실패');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" placeholder="물품 이름" onChange={handleChange} />
            <input name="price" placeholder="가격" onChange={handleChange} />
            <input name="deposit" placeholder="보증금" onChange={handleChange} />
            <textarea name="description" placeholder="상세 설명" onChange={handleChange} />
            <select name="category" onChange={handleChange}>
                <option value="">카테고리 선택</option>
                <option value="전자제품">전자제품</option>
                <option value="생활용품">생활용품</option>
            </select>
            <input type="date" name="deadline" onChange={handleChange} />
            <select name="method" onChange={handleChange}>
                <option value="">대여 방식</option>
                <option value="직거래">직거래</option>
                <option value="택배">택배</option>
            </select>
            <input name="location" placeholder="직거래 장소" onChange={handleChange} />
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button type="submit">물품 등록</button>
        </form>
    );
};

export default ProductForm;
