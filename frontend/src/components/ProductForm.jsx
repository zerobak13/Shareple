// src/components/ProductForm.jsx
// 물품 등록 폼. Tailwind 공용 클래스(.input-base / .btn-primary) 사용.
import React, { useEffect, useMemo, useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['전자기기', '생활용품', '여행용품', '게임', '서적', '의류', '악세서리'];
const METHODS = ['직거래', '택배'];
const DISTRICTS = [
    '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
    '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구',
    '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구',
    '종로구', '중구', '중랑구',
];

const MAX_AMOUNT = 3_000_000;

const formatCurrency = (value) => {
    const num = String(value).replace(/[^0-9]/g, '');
    const limited = Math.min(Number(num || 0), MAX_AMOUNT);
    return limited ? limited.toLocaleString() : '';
};
const parseCurrency = (value) => String(value).replaceAll(',', '');

const numberToKorean = (num) => {
    if (!num || Number.isNaN(num)) return '';
    const units = ['', '만', '억', '조'];
    const split = 10000;
    const parts = [];
    let i = 0;
    let n = num;
    while (n > 0) {
        const chunk = n % split;
        if (chunk) parts.unshift(chunk.toLocaleString() + units[i]);
        n = Math.floor(n / split);
        i++;
    }
    return parts.length ? parts.join(' ') + ' 원' : '';
};

const ProductForm = () => {
    const navigate = useNavigate();
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
    const [formattedPrice, setFormattedPrice] = useState('');
    const [formattedDeposit, setFormattedDeposit] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!image) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(image);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [image]);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handlePriceChange = (e) => {
        const f = formatCurrency(e.target.value);
        setFormattedPrice(f);
        setForm((prev) => ({ ...prev, price: parseCurrency(f) }));
    };
    const handleDepositChange = (e) => {
        const f = formatCurrency(e.target.value);
        setFormattedDeposit(f);
        setForm((prev) => ({ ...prev, deposit: parseCurrency(f) }));
    };

    const canSubmit = useMemo(() => {
        return (
            form.name.trim().length > 0 &&
            form.price &&
            form.category &&
            form.method &&
            form.location &&
            !submitting
        );
    }, [form, submitting]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setSubmitting(true);
        try {
            const data = new FormData();
            Object.entries(form).forEach(([k, v]) => data.append(k, v));
            if (image) data.append('image', image);
            await axios.post('/api/products', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('물품이 등록되었어요!');
            navigate('/mypage/products');
        } catch (err) {
            console.error(err);
            alert('등록 실패: ' + (err?.response?.data?.error || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
            {/* 이미지 */}
            <div>
                <label className="block text-xs text-gray-500 mb-1">대표 이미지</label>
                <div className="flex items-start gap-4">
                    <div className="w-28 h-28 rounded-xl bg-gray-100 overflow-hidden grid place-items-center shrink-0">
                        {preview ? (
                            <img src={preview} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl text-gray-300">🖼️</span>
                        )}
                    </div>
                    <div>
                        <label className="btn-secondary cursor-pointer !h-9 !text-xs">
                            이미지 선택
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setImage(e.target.files?.[0] || null)}
                            />
                        </label>
                        <div className="text-xs text-gray-400 mt-2">
                            JPG · PNG · 최대 5MB 권장
                        </div>
                    </div>
                </div>
            </div>

            {/* 이름 */}
            <div>
                <label className="block text-xs text-gray-500 mb-1">
                    물품명 <span className="text-red-500">*</span>
                </label>
                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="예) 캠핑용 4인 텐트"
                    className="input-base"
                />
            </div>

            {/* 가격/보증금 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">
                        1일 대여 가격 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            name="price"
                            value={formattedPrice}
                            onChange={handlePriceChange}
                            placeholder="0"
                            className="input-base pr-28"
                            inputMode="numeric"
                        />
                        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-gray-400">
                            {formattedPrice ? numberToKorean(Number(form.price)) : '원'}
                        </span>
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">보증금</label>
                    <div className="relative">
                        <input
                            name="deposit"
                            value={formattedDeposit}
                            onChange={handleDepositChange}
                            placeholder="0"
                            className="input-base pr-28"
                            inputMode="numeric"
                        />
                        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-gray-400">
                            {formattedDeposit ? numberToKorean(Number(form.deposit)) : '원'}
                        </span>
                    </div>
                </div>
            </div>

            {/* 카테고리/대여 방식 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">
                        카테고리 <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="input-base"
                    >
                        <option value="">선택해 주세요</option>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">
                        대여 방식 <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="method"
                        value={form.method}
                        onChange={handleChange}
                        className="input-base"
                    >
                        <option value="">선택해 주세요</option>
                        {METHODS.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 마감일/지역 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">대여 가능 마감일</label>
                    <input
                        type="date"
                        name="deadline"
                        value={form.deadline}
                        onChange={handleChange}
                        className="input-base"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">
                        거래 지역 <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        className="input-base"
                    >
                        <option value="">선택해 주세요</option>
                        {DISTRICTS.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 설명 */}
            <div>
                <label className="block text-xs text-gray-500 mb-1">상세 설명</label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="물품의 상태, 구성품, 사용 방법 등을 자세히 적어주세요."
                    className="input-base resize-none !h-auto py-3"
                />
            </div>

            <button
                type="submit"
                disabled={!canSubmit}
                className="btn-primary w-full !py-3"
            >
                {submitting ? '등록 중...' : '물품 등록하기'}
            </button>
        </form>
    );
};

export default ProductForm;
