// src/pages/mypage/ProfileEditPage.jsx
// 프로필 수정 — 사진/닉네임/이메일.
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { LoadingBlock } from '../../components/Spinner';

const resolveImg = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8080${url}`;
};

const ProfileEditPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ nickname: '', email: '', profileImageUrl: '' });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        axios
            .get('/api/auth/me')
            .then((res) => {
                setUser(res.data);
                setForm({
                    nickname: res.data.nickname || '',
                    email: res.data.email || '',
                    profileImageUrl: res.data.profileImageUrl || '',
                });
            })
            .catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const u = URL.createObjectURL(file);
        setPreview(u);
        return () => URL.revokeObjectURL(u);
    }, [file]);

    const canSubmit = useMemo(
        () => form.nickname.trim().length >= 2 && form.email.trim().length > 0 && !saving,
        [form, saving]
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || !canSubmit) return;
        setSaving(true);
        try {
            let imageUrl = form.profileImageUrl;
            if (file) {
                const fd = new FormData();
                fd.append('image', file);
                const upRes = await axios.post('/api/upload', fd);
                imageUrl = typeof upRes.data === 'string' ? upRes.data : upRes.data?.url || imageUrl;
            }
            await axios.put(`/api/users/${user.id}`, {
                nickname: form.nickname.trim(),
                email: form.email.trim(),
                name: user.name,
                phone: user.phone,
                address: user.address,
                profileImageUrl: imageUrl,
            });
            alert('프로필이 저장되었어요.');
            navigate('/mypage');
        } catch (err) {
            console.error(err);
            alert('저장 실패: ' + (err?.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    if (!user) return <LoadingBlock />;

    const displayImg = preview || resolveImg(form.profileImageUrl) || '/default-profile.png';

    return (
        <div className="max-w-md">
            <h3 className="text-xl font-extrabold mb-1">프로필 수정</h3>
            <p className="text-xs text-gray-500 mb-5">다른 사용자에게 보여지는 정보예요.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center gap-4">
                    <img
                        src={displayImg}
                        onError={(e) => (e.target.src = '/default-profile.png')}
                        alt="프로필"
                        className="w-20 h-20 rounded-full object-cover border"
                    />
                    <label className="btn-secondary cursor-pointer !h-9 !text-xs">
                        이미지 선택
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </label>
                </div>

                <div>
                    <label className="block text-xs text-gray-500 mb-1">닉네임</label>
                    <input
                        className="input-base"
                        value={form.nickname}
                        onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
                        placeholder="2자 이상"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">이메일</label>
                    <input
                        type="email"
                        className="input-base"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/mypage')}
                        className="btn-secondary flex-1"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="btn-primary flex-1"
                    >
                        {saving ? '저장 중...' : '저장하기'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileEditPage;
