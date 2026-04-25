// src/pages/MainPage.jsx
// Shareple 메인: 히어로 + 카테고리 칩 필터 + 상품 그리드.
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axiosInstance';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import { LoadingBlock } from '../components/Spinner';

const CATEGORIES = [
    { value: '', label: '전체', emoji: '🧺' },
    { value: '전자기기', label: '전자기기', emoji: '🎧' },
    { value: '생활용품', label: '생활용품', emoji: '🏠' },
    { value: '여행용품', label: '여행용품', emoji: '🧳' },
    { value: '게임', label: '게임', emoji: '🎮' },
    { value: '서적', label: '서적', emoji: '📚' },
    { value: '의류', label: '의류', emoji: '👕' },
    { value: '악세서리', label: '악세서리', emoji: '💍' },
];

const MainPage = ({ user }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('');

    useEffect(() => {
        let ignore = false;
        (async () => {
            setLoading(true);
            try {
                const res = await axios.get('/api/products/all');
                if (!ignore) setProducts(Array.isArray(res.data) ? res.data : []);
            } catch (e) {
                console.error(e);
                if (!ignore) setProducts([]);
            } finally {
                if (!ignore) setLoading(false);
            }
        })();
        return () => {
            ignore = true;
        };
    }, []);

    const filtered = useMemo(() => {
        if (!category) return products;
        return products.filter((p) => (p.category || '') === category);
    }, [products, category]);

    const recent = useMemo(() => filtered.slice(0, 8), [filtered]);

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-10">
            {/* 히어로 */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 via-primary to-teal-600 text-white p-8 md:p-10">
                <div className="relative z-10 max-w-xl">
                    <div className="text-xs font-semibold opacity-90 mb-2">SHAREPLE</div>
                    <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
                        {user?.nickname ? `${user.nickname}님, ` : ''}필요한 건 빌리고,
                        <br />
                        안 쓰는 건 나눠봐요
                    </h1>
                    <p className="text-sm opacity-90 mt-3">
                        이웃과 함께하는 P2P 대여 플랫폼, 오늘 필요한 물건을 지금 찾아보세요.
                    </p>
                    <div className="mt-5 flex gap-2">
                        <Link
                            to="/search"
                            className="bg-white text-primary font-semibold px-4 py-2 rounded-xl text-sm hover:bg-gray-50"
                        >
                            지금 검색하기
                        </Link>
                        <Link
                            to="/product/register"
                            className="border border-white/70 text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-white/10"
                        >
                            물품 등록
                        </Link>
                    </div>
                </div>
                <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute right-10 top-6 w-32 h-32 rounded-full bg-white/10 blur-xl" />
                <div className="absolute right-10 bottom-6 text-7xl opacity-20 select-none">
                    🤝
                </div>
            </section>

            {/* 카테고리 칩 */}
            <section>
                <h2 className="text-lg font-bold mb-3">카테고리</h2>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {CATEGORIES.map((c) => {
                        const active = category === c.value;
                        return (
                            <button
                                key={c.value || 'all'}
                                onClick={() => setCategory(c.value)}
                                className={`shrink-0 inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm border transition ${
                                    active
                                        ? 'bg-primary border-primary text-white font-semibold'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-primary/60 hover:text-primary'
                                }`}
                            >
                                <span>{c.emoji}</span>
                                <span>{c.label}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* 상품 */}
            <section>
                <div className="flex items-end justify-between mb-3">
                    <h2 className="text-lg font-bold">
                        {category ? `${category} ` : '등록된 '}물품
                    </h2>
                    <span className="text-xs text-gray-400">총 {filtered.length}건</span>
                </div>

                {loading ? (
                    <LoadingBlock />
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon="🛍️"
                        title="등록된 물품이 없어요"
                        description={
                            category
                                ? `${category} 카테고리에는 아직 등록된 상품이 없어요.`
                                : '가장 먼저 물품을 등록해 보세요!'
                        }
                        action={
                            <Link to="/product/register" className="btn-primary">
                                물품 등록하기
                            </Link>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {filtered.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                )}
            </section>

            {/* 최근 등록 강조 (카테고리 없을 때) */}
            {!category && recent.length > 0 && !loading && (
                <section className="card p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-primary font-semibold mb-1">
                                NEW ARRIVALS
                            </div>
                            <h3 className="text-base font-bold">최근 등록된 상품</h3>
                        </div>
                        <Link to="/search" className="text-sm text-gray-500 hover:text-primary">
                            전체 보기 →
                        </Link>
                    </div>
                </section>
            )}
        </div>
    );
};

export default MainPage;
