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
        Object.entries(form).forEach(([key, value]) => {
            data.append(key, value);
        });
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
        <form onSubmit={handleSubmit}>
            <input name="name" placeholder="물품 이름" onChange={handleChange} />
            <input name="price" placeholder="가격" onChange={handleChange} />
            <input name="deposit" placeholder="보증금" onChange={handleChange} />
            <textarea name="description" placeholder="상세 설명" onChange={handleChange} />
            <select name="category" onChange={handleChange}>
                <option value="">카테고리 선택</option>
                <option value="게임">게임</option>
                <option value="서적">서적</option>
                <option value="의류">의류</option>
                <option value="악세서리">악세서리</option>
                <option value="전자기기">전자기기</option>
                <option value="여행용품">여행용품</option>
                <option value="생활용품">생활용품</option>
            </select>
            <input type="date" name="deadline" onChange={handleChange} />
            <select name="method" onChange={handleChange}>
                <option value="">대여 방식</option>
                <option value="직거래">직거래</option>
                <option value="택배">택배</option>
            </select>
            <select name="location" onChange={handleChange}>
                <option value="">직거래 장소</option>
                <option value="강남구">강남구</option>
                <option value="강동구">강동구</option>
                <option value="강북구">강북구</option>
                <option value="강서구">강서구</option>
                <option value="관악구">관악구</option>
                <option value="광진구">광진구</option>
                <option value="구로구">구로구</option>
                <option value="금천구">금천구</option>
                <option value="노원구">노원구</option>
                <option value="도봉구">도봉구</option>
                <option value="동대문구">동대문구</option>
                <option value="동작구">동작구</option>
                <option value="마포구">마포구</option>
                <option value="서대문구">서대문구</option>
                <option value="서초구">서초구</option>
                <option value="성동구">성동구</option>
                <option value="성북구">성북구</option>
                <option value="송파구">송파구</option>
                <option value="양천구">양천구</option>
                <option value="영등포구">영등포구</option>
                <option value="용산구">용산구</option>
                <option value="은평구">은평구</option>
                <option value="종로구">종로구</option>
                <option value="중구">중구</option>
                <option value="중랑구">중랑구</option>
            </select>

            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button type="submit">물품 등록</button>
        </form>
    );
};

export default ProductForm;
