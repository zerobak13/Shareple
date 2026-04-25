// src/pages/mypage/SupportPage.jsx
// 명세서: 마이페이지 > 고객지원 (고객센터 / 문의하기)
//  - POST /api/inquiries  (문의 접수)
//  - GET  /api/inquiries/my (내 문의 내역 + 답변 확인)
import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosInstance';
import EmptyState from '../../components/EmptyState';
import { LoadingBlock } from '../../components/Spinner';

const formatDate = (iso) => {
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
                    : 'bg-gray-200 text-gray-600'
            }`}
        >
            {isAnswered ? '답변 완료' : '접수됨'}
        </span>
    );
};

const SupportPage = () => {
    const [form, setForm] = useState({ title: '', content: '' });
    const [submitting, setSubmitting] = useState(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    const loadList = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/inquiries/my');
            setItems(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error('문의 목록 로드 실패', e);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadList();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }
        try {
            setSubmitting(true);
            await axios.post('/api/inquiries', {
                title: form.title.trim(),
                content: form.content.trim(),
            });
            alert('문의가 접수되었습니다. 답변이 등록되면 아래 목록에서 확인하실 수 있습니다.');
            setForm({ title: '', content: '' });
            await loadList();
        } catch (err) {
            const msg = err?.response?.data?.error || err.message;
            alert('문의 접수 실패: ' + msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <h3 className="text-xl font-extrabold mb-1">고객지원</h3>
            <p className="text-xs text-gray-500 mb-5">
                이용 중 문제가 생기면 언제든 문의해 주세요. 답변이 오면 이 페이지에서 확인할 수 있어요.
            </p>

            <section className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <h4 className="font-semibold mb-1">📞 고객센터 안내</h4>
                <p className="text-sm text-gray-600">
                    평균 답변 시간은 영업일 기준 1~2일이에요.
                </p>
                <p className="text-sm text-gray-600">
                    이메일: <span className="text-primary">support@shareple.example</span>
                </p>
            </section>

            <form onSubmit={handleSubmit} className="mb-8 space-y-4">
                <h4 className="font-semibold">문의하기</h4>

                <div>
                    <label className="block text-xs text-gray-500 mb-1">제목</label>
                    <input
                        className="input-base"
                        maxLength={200}
                        placeholder="어떤 점이 불편하셨나요?"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">문의 내용</label>
                    <textarea
                        rows={6}
                        className="input-base resize-none !h-auto py-3"
                        placeholder="상황을 자세히 적어주시면 더 빠르게 도와드릴 수 있어요."
                        value={form.content}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                        required
                    />
                </div>

                <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? '접수 중...' : '문의 접수'}
                </button>
            </form>

            <section className="pt-6 border-t">
                <h4 className="font-semibold mb-3">내 문의 내역</h4>

                {loading ? (
                    <LoadingBlock />
                ) : items.length === 0 ? (
                    <EmptyState
                        icon="💬"
                        title="아직 접수한 문의가 없어요"
                        description={'궁금한 점이 있다면 언제든 문의를 남겨주세요.'}
                    />
                ) : (
                    <ul className="space-y-3">
                        {items.map((it) => {
                            const open = expandedId === it.id;
                            return (
                                <li key={it.id} className="p-4 border rounded-xl bg-white">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setExpandedId(open ? null : it.id)
                                        }
                                        className="w-full text-left"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-semibold truncate">
                                                {it.title}
                                            </span>
                                            <StatusBadge status={it.status} />
                                        </div>
                                        <div className="mt-1 text-xs text-gray-400">
                                            {formatDate(it.createdAt)}
                                        </div>
                                    </button>

                                    {open && (
                                        <div className="mt-3 pt-3 border-t space-y-3">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">
                                                    문의 내용
                                                </div>
                                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                    {it.content}
                                                </p>
                                            </div>

                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">
                                                    답변
                                                </div>
                                                {it.status === 'ANSWERED' && it.answer ? (
                                                    <>
                                                        <p className="text-sm text-gray-800 whitespace-pre-wrap bg-primary/5 rounded-lg p-3">
                                                            {it.answer}
                                                        </p>
                                                        {it.answeredAt && (
                                                            <div className="mt-1 text-xs text-gray-400">
                                                                답변일: {formatDate(it.answeredAt)}
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-gray-400">
                                                        아직 답변이 등록되지 않았습니다.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default SupportPage;
