// src/pages/MyProductManagePage.jsx
// 내가 등록한 물품 관리 — 카드 그리드 + 수정/삭제.
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import { LoadingBlock } from '../components/Spinner';

const MyProductManagePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const navigate = useNavigate();

    const load = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/products/my');
            setProducts(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error('내 물품 조회 실패', e);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('정말 삭제하시겠습니까? 삭제된 물품은 복구할 수 없어요.')) return;
        try {
            setDeletingId(id);
            await axios.delete(`/api/products/${id}`);
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (e) {
            console.error('삭제 실패', e);
            alert('삭제 실패: ' + (e?.response?.data?.error || e.message));
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div>
            <div className="flex items-end justify-between mb-5">
                <div>
                    <h1 className="text-xl font-extrabold">내 등록 물품 관리</h1>
                    <p className="text-xs text-gray-500 mt-1">
                        등록한 물품의 정보를 수정하거나 삭제할 수 있어요.
                    </p>
                </div>
                <Link to="/product/register" className="btn-primary !h-9 !text-xs">
                    + 새 물품 등록
                </Link>
            </div>

            {loading ? (
                <LoadingBlock />
            ) : products.length === 0 ? (
                <EmptyState
                    icon="📦"
                    title="아직 등록한 물품이 없어요"
                    description={'첫 물품을 등록하고 이웃과 공유해 보세요.'}
                    action={
                        <Link to="/product/register" className="btn-primary">
                            물품 등록하기
                        </Link>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((p) => (
                        <ProductCard
                            key={p.id}
                            product={p}
                            actions={
                                <>
                                    <button
                                        onClick={() => navigate(`/edit/${p.id}`)}
                                        className="btn-secondary flex-1 !h-9 !text-xs"
                                    >
                                        수정
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        disabled={deletingId === p.id}
                                        className="btn-danger flex-1 !h-9 !text-xs"
                                    >
                                        {deletingId === p.id ? '삭제 중...' : '삭제'}
                                    </button>
                                </>
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyProductManagePage;
