// src/pages/admin/AdminInquiriesPage.jsx
// 관리자 전용: 전체 고객 문의 목록 + 답변 등록/수정
//  - GET  /api/admin/inquiries?status=OPEN|ANSWERED|ALL
//  - POST /api/admin/inquiries/{id}/answer  body: { answer }
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';

const formatDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const StatusBadge = ({ status }) => {
    const isAnswered = status === 'ANSWERED';
    return (
        <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                isAnswered
                    ? 'bg-primary/10 text-primary'
                    : 'bg-yellow-100 text-yellow-700'
            }`}
        >
            {isAnswered ? '답변 완료' : '미답변'}
        </span>
    );
};

const TABS = [
    { value: 'OPEN', label: '미답변' },
    { value: 'ANSWERED', label: '답변 완료' },
    { value: 'ALL', label: '전체' },
];

const InquiryRow = ({ item, onAnswered }) => {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(item.answer || '');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setDraft(item.answer || '');
    }, [item.answer]);

    const submit = async () => {
        const body = draft.trim();
        if (!body) {
            alert('답변 내용을 입력해주세요.');
            return;
        }
        try {
            setSubmitting(true);
            await axios.post(`/api/admin/inquiries/${item.id}/answer`, {
                answer: body,
            });
            alert('답변이 등록되었습니다.');
            onAnswered && onAnswered();
        } catch (e) {
            const msg = e?.response?.data?.error || e.message;
            alert('답변 등록 실패: ' + msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <li className="p-4 border rounded-xl bg-white">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full text-left"
            >
                <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold truncate">{item.title}</span>
                    <StatusBadge status={item.status} />
                </div>
                <div className="mt-1 text-xs text-gray-500 flex gap-3">
                    <span>작성자: {item.userNickname || '(닉네임 없음)'}</span>
                    <span>{formatDateTime(item.createdAt)}</span>
                </div>
            </button>

            {open && (
                <div className="mt-3 pt-3 border-t space-y-3">
                    <div>
                        <div className="text-xs text-gray-500 mb-1">문의 내용</div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
                            {item.content}
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">답변</span>
                            {item.answeredAt && (
                                <span className="text-xs text-gray-400">
                                    최종 답변: {formatDateTime(item.answeredAt)}
                                </span>
                            )}
                        </div>
                        <textarea
                            rows={5}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="답변 내용을 입력하세요."
                        />
                        <div className="mt-2 text-right">
                            <button
                                onClick={submit}
                                disabled={submitting}
                                className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90 disabled:opacity-50"
                            >
                                {submitting
                                    ? '등록 중...'
                                    : item.status === 'ANSWERED'
                                        ? '답변 수정'
                                        : '답변 등록'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </li>
    );
};

const AdminInquiriesPage = () => {
    const navigate = useNavigate();
    const [me, setMe] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [tab, setTab] = useState('OPEN');
    const [items, setItems] = useState([]);
    const [openCount, setOpenCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // 관리자 여부 확인 (클라이언트 가드). 진짜 권한 체크는 백엔드에서 함.
    useEffect(() => {
        axios
            .get('/api/auth/me')
            .then((res) => {
                setMe(res.data);
                setAuthChecked(true);
                if (res.data?.role !== 'ADMIN') {
                    alert('관리자만 접근할 수 있는 페이지입니다.');
                    navigate('/');
                }
            })
            .catch(() => {
                setAuthChecked(true);
                navigate('/login');
            });
    }, [navigate]);

    const loadList = async (targetTab = tab) => {
        try {
            setLoading(true);
            const res = await axios.get('/api/admin/inquiries', {
                params: { status: targetTab },
            });
            setItems(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error('관리자 문의 목록 로드 실패', e);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const loadOpenCount = async () => {
        try {
            const res = await axios.get('/api/admin/inquiries/open-count');
            setOpenCount(res.data?.count ?? 0);
        } catch {
            setOpenCount(0);
        }
    };

    useEffect(() => {
        if (!authChecked || me?.role !== 'ADMIN') return;
        loadList(tab);
        loadOpenCount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, authChecked, me?.role]);

    if (!authChecked) {
        return <div className="p-8 text-gray-400">권한 확인 중...</div>;
    }
    if (me?.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className="max-w-3xl mx-auto p-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">고객 문의 관리</h2>
                <div className="text-sm text-gray-500">
                    미답변 <span className="text-red-500 font-semibold">{openCount}</span>건
                </div>
            </div>

            <div className="flex gap-2 mb-4 border-b">
                {TABS.map((t) => (
                    <button
                        key={t.value}
                        onClick={() => setTab(t.value)}
                        className={`px-4 py-2 text-sm -mb-px border-b-2 ${
                            tab === t.value
                                ? 'border-primary text-primary font-semibold'
                                : 'border-transparent text-gray-500'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400">불러오는 중...</div>
            ) : items.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
                    해당 상태의 문의가 없습니다.
                </div>
            ) : (
                <ul className="space-y-3">
                    {items.map((it) => (
                        <InquiryRow
                            key={it.id}
                            item={it}
                            onAnswered={async () => {
                                await loadList(tab);
                                await loadOpenCount();
                            }}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AdminInquiriesPage;
