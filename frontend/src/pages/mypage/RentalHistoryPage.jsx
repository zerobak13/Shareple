// src/pages/mypage/RentalHistoryPage.jsx
// 명세서: 마이페이지 > 거래 내역 > 대여 내역
//  - 내가 빌린(= BORROWER) 거래 전체 조회
//  - 탭: 전체 / 진행중 / 대기 / 완료 / 거절
//  - 카드: 상품 썸네일·상품명·상대·기간·보증금, 채팅/상품보기 버튼
import React, { useEffect, useMemo, useState } from 'react';
import axios from '../../api/axiosInstance';
import RentalItemCard from '../../components/RentalItemCard';

const TABS = [
    { key: 'ALL', label: '전체', statuses: null },
    { key: 'ACTIVE', label: '진행중', statuses: ['ACTIVE'] },
    { key: 'PENDING', label: '대기', statuses: ['PENDING'] },
    { key: 'COMPLETED', label: '완료', statuses: ['COMPLETED'] },
    { key: 'REJECTED', label: '거절', statuses: ['REJECTED'] },
];

const RentalHistoryPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('ALL');

    useEffect(() => {
        let ignore = false;
        (async () => {
            setLoading(true);
            try {
                const res = await axios.get('/api/rentals/my', {
                    params: { role: 'BORROWER' },
                });
                if (!ignore) setItems(Array.isArray(res.data) ? res.data : []);
            } catch (e) {
                console.error('대여 내역 불러오기 실패', e);
                if (!ignore) setItems([]);
            } finally {
                if (!ignore) setLoading(false);
            }
        })();
        return () => {
            ignore = true;
        };
    }, []);

    const filtered = useMemo(() => {
        const cfg = TABS.find((t) => t.key === tab);
        if (!cfg || !cfg.statuses) return items;
        return items.filter((it) => cfg.statuses.includes(it.status));
    }, [items, tab]);

    return (
        <div>
            <h3 className="text-xl font-bold mb-2">대여 내역</h3>
            <p className="text-sm text-gray-500 mb-4">
                내가 빌린 물품들의 거래 내역입니다.
            </p>

            {/* 탭 */}
            <div className="flex gap-1 mb-4 border-b overflow-x-auto">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-3 py-2 text-sm -mb-px border-b-2 whitespace-nowrap ${
                            tab === t.key
                                ? 'border-primary text-primary font-semibold'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400">불러오는 중...</div>
            ) : filtered.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
                    {items.length === 0
                        ? '아직 대여한 물품이 없습니다.'
                        : '해당 상태의 거래가 없습니다.'}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((it) => (
                        <RentalItemCard key={it.rentalId} item={it} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default RentalHistoryPage;
