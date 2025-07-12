import React, { useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = e => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(form).forEach(([key, value]) => data.append(key, value));
        if (image) data.append('image', image);

        try {
            await axios.post('/api/products', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('등록 성공!');
            navigate('/main');
        } catch (err) {
            alert('등록 실패');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white shadow-md rounded-xl mt-8">
            <h2 className="text-2xl font-bold mb-6 text-[#00C7BE]">📋 물품 등록</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    name="name"
                    placeholder="물품 이름"
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00C7BE]"
                />
                <div className="flex gap-4">
                    <input
                        name="price"
                        placeholder="가격(1일 기준)"
                        onChange={handleChange}
                        className="w-full border rounded-lg p-3 focus:ring-[#00C7BE]"
                    />
                    <input
                        name="deposit"
                        placeholder="보증금"
                        onChange={handleChange}
                        className="w-full border rounded-lg p-3 focus:ring-[#00C7BE]"
                    />
                </div>
                <textarea
                    name="description"
                    placeholder="상세 설명"
                    onChange={handleChange}
                    rows={4}
                    className="w-full border rounded-lg p-3 resize-none focus:ring-[#00C7BE]"
                />
                <select
                    name="category"
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3 text-gray-700 focus:ring-[#00C7BE]"
                >
                    <option value="">카테고리 선택</option>
                    <option value="전자제품">전자제품</option>
                    <option value="생활용품">생활용품</option>
                    <option value="공구">공구</option>
                    <option value="게임기기">게임기기</option>
                    <option value="캠핑도구">캠핑도구</option>
                    <option value="기타">기타</option>
                </select>
                <input
                    type="date"
                    name="deadline"
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3 text-gray-700 focus:ring-[#00C7BE]"
                />
                <select
                    name="method"
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3 text-gray-700 focus:ring-[#00C7BE]"
                >
                    <option value="">대여 방식 선택</option>
                    <option value="직거래">직거래</option>
                    <option value="택배">택배</option>
                </select>
                <input
                    name="location"
                    placeholder="직거래 장소 (예: 마포구 OO동)"
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3 focus:ring-[#00C7BE]"
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border rounded-lg p-3 bg-gray-50"
                />
                <button
                    type="submit"
                    className="w-full bg-[#AF52DE] text-white py-3 rounded-lg font-semibold hover:bg-[#9a42c9] transition"
                >
                    물품 등록
                </button>
            </form>
        </div>
    );
};

export default ProductForm;
