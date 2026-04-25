// src/pages/mypage/MyPageHome.jsx
// 마이페이지 홈 — 프로필 카드 + 빠른 이동 타일.
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import StarRating from '../../components/StarRating';
import { LoadingBlock } from '../../components/Spinner';

const TILES = [
    { to: '/mypage/rentals', label: '대여 내역', icon: '📥', desc: '빌린 물품 기록' },
    { to: '/mypage/returns', label: '반납 내역', icon: '📤', desc: '반납한 기록' },
    { to: '/mypage/products', label: '내 물품', icon: '📦', desc: '등록 관리' },
    { to: '/mypage/reviews', label: '리뷰', icon: '⭐', desc: '받은/쓴 후기' },
    { to: '/mypage/support', label: '고객지원', icon: '💬', desc: '문의 · 답변' },
    { to: '/mypage/settings', label: '설정', icon: '⚙️', desc: '알림/계정' },
];

const MyPageHome = () => {
    const [profile, setProfile] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get('/api/auth/me');
                setProfile(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!profile?.id) return;
        axios
            .get(`/api/reviews/user/${profile.id}/summary`)
            .then((res) => setSummary(res.data))
            .catch(() => setSummary(null));
    }, [profile?.id]);

    if (loading || !profile) return <LoadingBlock />;

    const avatar = profile.profileImageUrl
        ? profile.profileImageUrl.startsWith('http')
            ? profile.profileImageUrl
            : `http://localhost:8080${profile.profileImageUrl}`
        : '/default-profile.png';

    return (
        <div>
            {/* 프로필 카드 */}
            <div className="flex items-center gap-5 pb-6 border-b">
                <img
                    src={avatar}
                    onError={(e) => (e.target.src = '/default-profile.png')}
                    alt="프로필"
                    className="w-20 h-20 rounded-full object-cover border"
                />
                <div className="flex-1 min-w-0">
                    <div className="text-lg font-extrabold truncate">
                        {profile.nickname || '(닉네임 없음)'}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                        {profile.email || '(이메일 없음)'}
                    </div>
                    {summary && summary.count > 0 ? (
                        <div className="mt-1">
                            <StarRating
                                value={summary.average}
                                readOnly
                                showNumber
                                count={summary.count}
                                size="sm"
                            />
                        </div>
                    ) : (
                        <span className="text-xs text-gray-400 mt-1 inline-block">
                            아직 받은 리뷰가 없어요
                        </span>
                    )}
                </div>
                <Link to="/mypage/profile" className="btn-primary !h-9 !text-xs">
                    프로필 수정
                </Link>
            </div>

            {/* 기본 정보 */}
            <dl className="grid grid-cols-[100px_1fr] gap-y-2 text-sm mt-6 mb-8">
                <dt className="text-gray-500">이름</dt>
                <dd className="text-gray-800">{profile.name || '-'}</dd>
                <dt className="text-gray-500">전화번호</dt>
                <dd className="text-gray-800">{profile.phone || '-'}</dd>
                <dt className="text-gray-500">주소</dt>
                <dd className="text-gray-800">{profile.address || '-'}</dd>
            </dl>

            {/* 빠른 이동 타일 */}
            <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3">빠른 이동</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {TILES.map((t) => (
                        <Link
                            key={t.to}
                            to={t.to}
                            className="card p-4 hover:border-primary/50 hover:shadow-sm transition block"
                        >
                            <div className="text-2xl">{t.icon}</div>
                            <div className="mt-2 text-sm font-semibold text-gray-800">{t.label}</div>
                            <div className="text-xs text-gray-500">{t.desc}</div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyPageHome;
