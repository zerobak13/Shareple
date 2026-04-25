// src/pages/mypage/ReturnHistoryPage.jsx
// 명세서: 마이페이지 > 거래 내역 > 반납 내역
//  - 반납 완료(COMPLETED) 된 대여 건 리스트
//  - 항목별: 채팅으로 이동 / 상품 보기 / 리뷰 작성
import React, { useCallback, useEffect, useState } from 'react';
import axios from '../../api/axiosInstance';
import RentalItemCard from '../../components/RentalItemCard';
import ReviewWriteModal from '../../components/ReviewWriteModal';
import EmptyState from '../../components/EmptyState';
import { LoadingBlock } from '../../components/Spinner';

const ReturnHistoryPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    // rentalId -> 이미 리뷰 작성했는지
    const [writtenMap, setWrittenMap] = useState({});
    const [modalRental, setModalRental] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/rentals/my', {
                params: { role: 'BORROWER', status: 'COMPLETED' },
            });
            const list = Array.isArray(res.data) ? res.data : [];
            setItems(list);

            // 각 rental 에 대해 내가 이미 리뷰를 썼는지 조회
            const pairs = await Promise.all(
                list.map(async (it) => {
                    try {
                        const r = await axios.get(
                            `/api/reviews/exists/rental/${it.rentalId}`
                        );
                        return [it.rentalId, !!r.data?.exists];
                    } catch {
                        return [it.rentalId, false];
                    }
                })
            );
            setWrittenMap(Object.fromEntries(pairs));
        } catch (e) {
            console.error('반납 내역 불러오기 실패', e);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div>
            <h3 className="text-xl font-bold mb-2">반납 내역</h3>
            <p className="text-sm text-gray-500 mb-6">
                반납이 완료된 대여 건입니다. 거래 상대에게 리뷰를 남길 수 있어요.
            </p>

            {loading ? (
                <LoadingBlock />
            ) : items.length === 0 ? (
                <EmptyState
                    icon="📤"
                    title="반납 완료된 거래가 없어요"
                    description={'거래가 완료되면 이곳에서 리뷰를 남길 수 있어요.'}
                />
            ) : (
                <div className="space-y-3">
                    {items.map((it) => {
                        const alreadyWritten = !!writtenMap[it.rentalId];
                        return (
                            <RentalItemCard
                                key={it.rentalId}
                                item={it}
                                actions={
                                    alreadyWritten ? (
                                        <span className="px-3 py-1 text-xs rounded-lg bg-gray-100 text-gray-500">
                                            리뷰 작성 완료
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => setModalRental(it)}
                                            className="px-3 py-1 text-xs rounded-lg bg-primary text-white hover:opacity-90"
                                        >
                                            리뷰 작성
                                        </button>
                                    )
                                }
                            />
                        );
                    })}
                </div>
            )}

            {modalRental && (
                <ReviewWriteModal
                    rental={modalRental}
                    onClose={() => setModalRental(null)}
                    onSubmitted={() => {
                        setModalRental(null);
                        load();
                    }}
                />
            )}
        </div>
    );
};

export default ReturnHistoryPage;
