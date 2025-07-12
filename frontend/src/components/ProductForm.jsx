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

    const [formattedPrice, setFormattedPrice] = useState('');
    const [formattedDeposit, setFormattedDeposit] = useState('');


    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = e => {
        setImage(e.target.files[0]);
    };


    const formatCurrency = (value) => {
    const num = value.replace(/[^0-9]/g, ''); // 숫자만 허용
    const limited = Math.min(Number(num), 3000000); // 300만 원 제한
    return limited.toLocaleString(); // 쉼표 자동 추가  
    };

    const parseCurrency = (value) => {
        return value.replaceAll(',', ''); // 백엔드에 보낼 때 ',' 제거
    };

    const handlePriceChange = (e) => {
        const formatted = formatCurrency(e.target.value);
        setForm({ ...form, price: parseCurrency(formatted) }); // form에는 숫자만 저장
        setFormattedPrice(formatted); // 화면에는 쉼표 있는 값 보여줌
    };

    const handleDepositChange = (e) => {
        const formatted = formatCurrency(e.target.value);
        setForm({ ...form, deposit: parseCurrency(formatted) });
        setFormattedDeposit(formatted);
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


    const numberToKorean = (num) => {
        if (!num || isNaN(num)) return '';
        const units = ['', '만', '억', '조'];
        const splitUnit = 10000;
        const resultArray = [];

        let result = '';
        let i = 0;
        while (num > 0) {
            const chunk = num % splitUnit;
            if (chunk) {
            resultArray.unshift(chunk.toLocaleString() + units[i]);
            }
            num = Math.floor(num / splitUnit);
            i++;
        }

        result = resultArray.join(' ') + ' 원';
        return result;
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
                    <div className="w-full relative">
                        <input
                        name="price"
                        placeholder="가격(1일 기준)"
                        value={formattedPrice}
                        onChange={handlePriceChange}
                        className="w-full border rounded-lg p-3 pr-24 focus:ring-[#00C7BE]"
                        />
                        {formattedPrice && (
                        <span className="absolute top-1/2 right-3 transform -translate-y-1/2 text-sm text-gray-500">
                            {numberToKorean(Number(form.price))}
                        </span>
                        )}
                    </div>

                    <div className="w-full relative">
                        <input
                        name="deposit"
                        placeholder="보증금"
                        value={formattedDeposit}
                        onChange={handleDepositChange}
                        className="w-full border rounded-lg p-3 pr-24 focus:ring-[#00C7BE]"
                        />
                        {formattedDeposit && (
                        <span className="absolute top-1/2 right-3 transform -translate-y-1/2 text-sm text-gray-500">
                            {numberToKorean(Number(form.deposit))}
                        </span>
                        )}
                    </div>
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
                    <option value="게임">게임</option>
                    <option value="서적">서적</option>
                    <option value="의류">의류</option>
                    <option value="악세서리">악세서리</option>
                    <option value="전자기기">전자기기</option>
                    <option value="여행용품">여행용품</option>
                    <option value="생활용품">생활용품</option>
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
