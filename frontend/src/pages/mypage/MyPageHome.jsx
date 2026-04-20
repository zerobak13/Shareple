// src/pages/mypage/MyPageHome.jsx
// 마이페이지 진입 시 기본 화면: 내 정보 요약 + 주요 액션 링크 + 평점
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import StarRating from '../../components/StarRating';

const MyPageHome = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(null); // {count, average}

    useEffect(() => {
        axios
            .get('/api/auth/me')
            .then((res) => setProfile(res.data))
            .catch((err) => {
                console.error(err);
                setError('프로필 정보를 불러오지 못했습니다.');
            });
    }, []);

    useEffect(() => {
        if (!profile?.id) return;
        axios
            .get(`/api/reviews/user/${profile.id}/summary`)
            .then((res) => setSummary(res.data))
            .catch(() => setSummary(null));
    }, [profile?.id]);

    if (error) return <div className="text-red-600">{error}</div>;
    if (!profile) return <div>로딩 중...</div>;

    return (
        <div>
            <h3 className="text-xl font-bold mb-4">내 프로필</h3>

            <div className="flex items-center gap-4 mb-6">
                <img
                    src={
                        profile.profileImageUrl
                            ? `http://localhost:8080${profile.profileImageUrl}`
                            : '/default-profile.png'
                    }
                    onError={(e) => (e.target.src = '/default-profile.png')}
                    alt="프로필"
                    className="w-20 h-20 rounded-full object-cover border"
                />
                <div>
                    <div className="text-lg font-semibold">
                        {profile.nickname || '(닉네임 없음)'}
                    </div>
                    <div className="text-sm text-gray-500">
                        {profile.email || '(이메일 없음)'}
                    </div>
                    {summary && (
                        <div className="mt-1">
                            {summary.count > 0 ? (
                                <StarRating
                                    value={summary.average}
                                    readOnly
                                    showNumber
                                    count={summary.count}
                                    size="sm"
                                />
                            ) : (
                                <span className="text-xs text-gray-400">
                                    아직 받은 리뷰가 없습니다
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <dl className="grid grid-cols-[100px_1fr] gap-y-2 text-sm mb-6">
                <dt className="text-gray-500">이름</dt>
                <dd>{profile.name || '-'}</dd>
                <dt className="text-gray-500">전화번호</dt>
                <dd>{profile.phone || '-'}</dd>
                <dt className="text-gray-500">주소</dt>
                <dd>{profile.address || '-'}</dd>
            </dl>

            <div className="flex gap-2 flex-wrap">
                <Link
                    to="/mypage/profile"
                    className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm"
                >
                    프로필 수정
                </Link>
                <Link
                    to="/mypage/account"
                    className="px-3 py-2 rounded-lg border text-sm"
                >
                    회원 정보 수정
                </Link>
                <Link
                    to="/mypage/products"
                    className="px-3 py-2 rounded-lg border text-sm"
                >
                    내 물품 관리
                </Link>
            </div>
        </div>
    );
};

export default MyPageHome;
