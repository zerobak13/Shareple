// src/pages/EditProductPage.jsx
// 내 물품 수정 — 모든 필드 수정 가능, 이미지 미리보기.
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { LoadingBlock } from '../components/Spinner';

const CATEGORIES = ['전자기기', '생활용품', '여행용품', '게임', '서적', '의류', '악세서리'];
const METHODS = ['직거래', '택배'];
const DISTRICTS = [
    '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
    '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구',
    '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구',
    '종로구', '중구', '중랑구',
];

const resolveImg = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8080${url}`;
};

const toNumberString = (v) => String(v ?? '').replace(/[^0-9]/g, '');
const toComma = (v) => {
    const n = Number(toNumberString(v));
    return n ? n.toLocaleString() : '';
};

const EditProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [form, setForm] = useState(null);

    useEffect(() => {
        let ignore = false;
        (async () => {
            try {
                const res = await axios.get('/api/products/my');
                if (ignore) return;
                const list = Array.isArray(res.data) ? res.data : [];
                const found = list.find((p) => String(p.id) === String(id));
                if (!found) {
                    alert('물품을 찾을 수 없어요.');
                    navigate('/mypage/products', { replace: true });
                    return;
                }
                setForm({
                    name: found.name || '',
                    price: String(found.price ?? ''),
                    deposit: String(found.deposit ?? ''),
                    description: found.description || '',
                    category: found.category || '',
                    deadline: found.deadline || '',
                    method: found.method || '',
                    location: found.location || '',
                    imageUrl: found.imageUrl || '',
                });
            } catch (e) {
                console.error(e);
                alert('상품 불러오기 실패');
                navigate('/mypage/products', { replace: true });
            } finally {
                if (!ignore) setLoading(false);
            }
        })();
        return () => {
            ignore = true;
        };
    }, [id, navigate]);

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

    const handleAmount = (e) => {
        const raw = toNumberString(e.target.value);
        setForm((prev) => ({ ...prev, [e.target.name]: raw }));
    };

    const canSubmit = useMemo(() => {
        if (!form) return false;
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
            const fd = new FormData();
            fd.append('name', form.name);
            fd.append('price', form.price);
            fd.append('deposit', form.deposit || '0');
            fd.append('description', form.description || '');
            fd.append('category', form.category);
            fd.append('deadline', form.deadline || '');
            fd.append('method', form.method);
            fd.append('location', form.location);
            if (image) fd.append('image', image);

            await axios.put(`/api/products/${id}`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('수정되었어요!');
            navigate('/mypage/products');
        } catch (err) {
            console.error(err);
            alert('수정 실패: ' + (err?.response?.data?.error || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !form) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-10">
                <LoadingBlock />
            </div>
        );
    }

    const displayImg = preview || resolveImg(form.imageUrl);

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold">물품 수정</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        정보를 변경하면 바로 검색·리스트에 반영돼요.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/mypage/products')}
                    className="btn-secondary !h-9 !text-xs"
                >
                    돌아가기
                </button>
            </div>

            <form onSubmit={handleSubmit} className="card p-6 space-y-5">
                {/* 이미지 */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">대표 이미지</label>
                    <div className="flex items-start gap-4">
                        <div className="w-28 h-28 rounded-xl bg-gray-100 overflow-hidden grid place-items-center shrink-0">
                            {displayImg ? (
                                <img src={displayImg} alt="preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl text-gray-300">🖼️</span>
                            )}
                        </div>
                        <div>
                            <label className="btn-secondary cursor-pointer !h-9 !text-xs">
                                이미지 변경
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                                />
                            </label>
                            <div className="text-xs text-gray-400 mt-2">
                                변경하지 않으면 기존 이미지가 유지돼요.
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
                                value={toComma(form.price)}
                                onChange={handleAmount}
                                inputMode="numeric"
                                className="input-base pr-12"
                            />
                            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-gray-400">원</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">보증금</label>
                        <div className="relative">
                            <input
                                name="deposit"
                                value={toComma(form.deposit)}
                                onChange={handleAmount}
                                inputMode="numeric"
                                className="input-base pr-12"
                            />
                            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-gray-400">원</span>
                        </div>
                    </div>
                </div>

                {/* 카테고리/방식 */}
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
                                <option key={c} value={c}>{c}</option>
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
                                <option key={m} value={m}>{m}</option>
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
                            value={form.deadline || ''}
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
                                <option key={d} value={d}>{d}</option>
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
                        className="input-base resize-none !h-auto py-3"
                    />
                </div>

                <button
                    type="submit"
                    disabled={!canSubmit}
                    className="btn-primary w-full !py-3"
                >
                    {submitting ? '저장 중...' : '수정 완료'}
                </button>
            </form>
        </div>
    );
};

export default EditProductPage;
