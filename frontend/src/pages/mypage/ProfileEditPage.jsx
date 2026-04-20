// src/pages/mypage/ProfileEditPage.jsx
// 명세서: 마이페이지 탭 > 개인정보 수정 > 프로필 수정 (프로필 사진, 닉네임, 이메일)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';

const ProfileEditPage = () => {
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({
        nickname: '',
        email: '',
        profileImageUrl: '',
    });
    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        try {
            let imageUrl = form.profileImageUrl;

            if (file) {
                const fd = new FormData();
                fd.append('image', file);
                const upRes = await axios.post('/api/upload', fd);
                imageUrl = upRes.data; // 서버가 "/uploads/xxxx" 반환
            }

            await axios.put(`/api/users/${user.id}`, {
                nickname: form.nickname,
                email: form.email,
                name: user.name, // 이름은 가입 시 카카오에서 받아온 값 유지 (수정 불가)
                phone: user.phone,
                address: user.address,
                profileImageUrl: imageUrl,
            });

            alert('프로필이 수정되었습니다.');
            navigate('/mypage');
        } catch (err) {
            console.error(err);
            alert('저장 실패');
        } finally {
            setSaving(false);
        }
    };

    if (!user) return <div>로딩 중...</div>;

    const previewUrl = file
        ? URL.createObjectURL(file)
        : form.profileImageUrl
        ? `http://localhost:8080${form.profileImageUrl}`
        : '/default-profile.png';

    return (
        <form onSubmit={handleSubmit} className="max-w-md">
            <h3 className="text-xl font-bold mb-4">프로필 수정</h3>

            <div className="mb-4 flex items-center gap-4">
                <img
                    src={previewUrl}
                    onError={(e) => (e.target.src = '/default-profile.png')}
                    alt="프로필"
                    className="w-20 h-20 rounded-full object-cover border"
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0])}
                />
            </div>

            <label className="block mb-3">
                <span className="text-sm text-gray-600">닉네임</span>
                <input
                    className="mt-1 block w-full border rounded-lg px-3 py-2"
                    value={form.nickname}
                    onChange={(e) =>
                        setForm({ ...form, nickname: e.target.value })
                    }
                    required
                />
            </label>

            <label className="block mb-4">
                <span className="text-sm text-gray-600">이메일</span>
                <input
                    type="email"
                    className="mt-1 block w-full border rounded-lg px-3 py-2"
                    value={form.email}
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                    required
                />
            </label>

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                >
                    {saving ? '저장 중...' : '프로필 수정 완료'}
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/mypage')}
                    className="px-4 py-2 rounded-lg border"
                >
                    취소
                </button>
            </div>
        </form>
    );
};

export default ProfileEditPage;
