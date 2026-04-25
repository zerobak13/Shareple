// src/pages/SearchPage.jsx
// 물품 검색 — 지역/카테고리/가격/마감일 필터 + URL ?q= 동기화.
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../api/axiosInstance';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import { LoadingBlock } from '../components/Spinner';

const DISTRICTS = [
    '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
    '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구',
    '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구',
    '종로구', '중구', '중랑구',
];
const CATEGORIES = ['전자기기', '생활용품', '여행용품', '게임', '서적', '의류', '악세서리'];

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const qParam = searchParams.get('q') || '';

    const [keyword, setKeyword] = useState(qParam);
    const [filters, setFilters] = useState({
        location: '',
        deadline: '',
        minPrice: '',
        maxPrice: '',
        category: '',
    });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setKeyword(qParam);
    }, [qParam]);

    const load = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.location) params.append('location', filters.location);
            if (filters.deadline) params.append('deadline', filters.deadline);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.category) params.append('category', filters.category);

            const hasFilter = Array.from(params.keys()).length > 0;
            const url = hasFilter
                ? `/api/products/filter?${params.toString()}`
                : '/api/products/all';
            const res = await axios.get(url);
            setProducts(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error('상품 불러오기 실패', e);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredByKeyword = useMemo(() => {
        const q = keyword.trim().toLowerCase();
        if (!q) return products;
        return products.filter((p) => {
            const name = String(p.name || '').toLowerCase();
            const desc = String(p.description || '').toLowerCase();
            const cat = String(p.category || '').toLowerCase();
            const loc = String(p.location || '').toLowerCase();
            return (
                name.includes(q) ||
                desc.includes(q) ||
                cat.includes(q) ||
                loc.includes(q)
            );
        });
    }, [products, keyword]);

    const handleChange = (e) =>
        setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const onSearchSubmit = (e) => {
        e.preventDefault();
        const k = keyword.trim();
        setSearchParams(k ? { q: k } : {});
    };

    const handleReset = () => {
        setFilters({
            location: '',
            deadline: '',
            minPrice: '',
            maxPrice: '',
            category: '',
        });
        setKeyword('');
        setSearchParams({});
        setTimeout(load, 0);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            {/* 타이틀 + 검색 입력 */}
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold mb-3">물품 검색</h1>
                <form
                    onSubmit={onSearchSubmit}
                    className="flex items-center bg-gray-100 rounded-full px-4 h-12 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/30 transition"
                >
                    <span className="text-gray-400 mr-2">🔎</span>
                    <input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="상품명 · 카테고리 · 지역으로 검색"
                        className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
                    />
                    {keyword && (
                        <button
                            type="button"
                            onClick={() => setKeyword('')}
                            className="text-gray-400 text-xs mr-2"
                        >
                            ✕
                        </button>
                    )}
                    <button type="submit" className="btn-primary !h-8 !px-4 !py-0 !text-xs">
                        검색
                    </button>
                </form>
            </div>

            {/* 필터 바 */}
            <div className="card p-4 mb-6 grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                    <label className="text-xs text-gray-500 block mb-1">지역</label>
                    <select
                        name="location"
                        value={filters.location}
                        onChange={handleChange}
                        className="input-base"
                    >
                        <option value="">전체</option>
                        {DISTRICTS.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">카테고리</label>
                    <select
                        name="category"
                        value={filters.category}
                        onChange={handleChange}
                        className="input-base"
                    >
                        <option value="">전체</option>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">대여 마감</label>
                    <input
                        type="date"
                        name="deadline"
                        value={filters.deadline}
                        onChange={handleChange}
                        className="input-base"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">최소가</label>
                    <input
                        type="number"
                        name="minPrice"
                        min="0"
                        placeholder="0"
                        value={filters.minPrice}
                        onChange={handleChange}
                        className="input-base"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">최대가</label>
                    <input
                        type="number"
                        name="maxPrice"
                        min="0"
                        placeholder="∞"
                        value={filters.maxPrice}
                        onChange={handleChange}
                        className="input-base"
                    />
                </div>
                <div className="col-span-2 md:col-span-5 flex gap-2 justify-end">
                    <button onClick={handleReset} className="btn-secondary">
                        초기화
                    </button>
                    <button onClick={load} className="btn-primary">
                        필터 적용
                    </button>
                </div>
            </div>

            {/* 결과 */}
            <div className="flex items-end justify-between mb-3">
                <h2 className="text-base font-bold text-gray-700">검색 결과</h2>
                <span className="text-xs text-gray-400">총 {filteredByKeyword.length}건</span>
            </div>

            {loading ? (
                <LoadingBlock />
            ) : filteredByKeyword.length === 0 ? (
                <EmptyState
                    icon="🔍"
                    title="조건에 맞는 상품이 없어요"
                    description={'검색어나 필터를 조정해 보세요.'}
                />
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredByKeyword.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchPage;
