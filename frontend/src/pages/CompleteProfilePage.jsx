// src/pages/CompleteProfilePage.jsx
// 최초 로그인 시 추가 정보 입력 페이지 (닉네임/이메일/전화/주소/프로필 이미지).
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';

const CompleteProfilePage = () => {
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({
        nickname: '',
        phone: '',
        address: '',
        profileImageUrl: '',
        email: '',
    });
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get('/api/auth/me')
            .then((res) => {
                setUser(res.data);
                setForm({
                    nickname: res.data.nickname || '',
                    phone: res.data.phone || '',
                    address: res.data.address || '',
                    profileImageUrl: res.data.profileImageUrl || '',
                    email: res.data.email || '',
                });
            })
            .catch(() => navigate('/login'));
    }, [navigate]);

    useEffect(() => {
        if (!file) {
            setFilePreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setFilePreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const canSubmit = useMemo(() => {
        return (
            form.nickname.trim().length >= 2 &&
            form.email.trim().length > 0 &&
            form.phone.trim().length > 0 &&
            form.address.trim().length > 0
        );
    }, [form]);

    const resolveImg = (url) =>
        !url
            ? null
            : url.startsWith('http')
                ? url
                : `http://localhost:8080${url}`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit || submitting) return;
        try {
            setSubmitting(true);
            let imageUrl = form.profileImageUrl;

            if (file) {
                const fd = new FormData();
                fd.append('image', file);
                const res = await axios.post('/api/upload', fd);
                imageUrl = typeof res.data === 'string' ? res.data : res.data?.url || imageUrl;
            }

            await axios.put(`/api/users/${user.id}`, {
                nickname: form.nickname.trim(),
                email: form.email.trim(),
                name: user.name,
                phone: form.phone.trim(),
                address: form.address.trim(),
                profileImageUrl: imageUrl,
            });

            alert('프로필이 저장되었습니다!');
            navigate('/');
        } catch (err) {
            console.error('정보 저장 중 오류:', err);
            alert('저장 실패: ' + (err?.response?.data?.error || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) return <div className="p-8 text-gray-400">로딩 중...</div>;

    const displayImg =
        filePreview || resolveImg(form.profileImageUrl) || '/default-profile.png';

    return (
        <div className="max-w-lg mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold">프로필을 완성해 주세요</h1>
                <p className="text-sm text-gray-500 mt-1">
                    대여·거래에 필요한 기본 정보를 입력해 주세요. 언제든지 수정할 수 있어요.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="card p-6 space-y-5">
                {/* 프로필 이미지 */}
                <div className="flex items-center gap-4">
                    <img
                        src={displayImg}
                        onError={(e) => (e.target.src = '/default-profile.png')}
                        alt="프로필"
                        className="w-20 h-20 rounded-full object-cover border"
                    />
                    <div>
                        <label className="btn-secondary cursor-pointer">
                            이미지 선택
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                        </label>
                        <div className="text-xs text-gray-400 mt-2">
                            JPG · PNG · 최대 5MB 권장
                        </div>
                    </div>
                </div>

                {/* 카카오 이름 (읽기 전용) */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">카카오 이름</label>
                    <input className="input-base" value={user.name || ''} disabled />
                </div>

                {/* 닉네임 */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">
                        닉네임 <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="nickname"
                        className="input-base"
                        placeholder="다른 사용자에게 표시될 별명 (2자 이상)"
                        value={form.nickname}
                        onChange={handleChange}
                    />
                </div>

                {/* 이메일 */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">
                        이메일 <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="email"
                        type="email"
                        className="input-base"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                    />
                </div>

                {/* 전화 */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">
                        전화번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="phone"
                        className="input-base"
                        placeholder="010-0000-0000"
                        value={form.phone}
                        onChange={handleChange}
                    />
                </div>

                {/* 주소 */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">
                        주소 <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="address"
                        className="input-base"
                        placeholder="거래를 주로 할 지역을 입력해 주세요"
                        value={form.address}
                        onChange={handleChange}
                    />
                </div>

                <button
                    type="submit"
                    disabled={!canSubmit || submitting}
                    className="btn-primary w-full !py-3"
                >
                    {submitting ? '저장 중...' : '저장하고 시작하기'}
                </button>
            </form>
        </div>
    );
};

export default CompleteProfilePage;
