// src/pages/mypage/AccountEditPage.jsx
// 명세서: 마이페이지 탭 > 개인정보 수정 > 회원 정보 수정
//  - 이름(본명) : 변경 불가
//  - 생년월일    : 변경 불가 (※ 현재 User 엔티티에 birthDate 필드가 없어 표시만 '-' 처리)
//  - 전화번호    : 변경 가능 (※ 명세: 변경 시 휴대폰 인증 필요 — 본 단계에서는 미구현)
//  - 주소        : 변경 가능
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';

const AccountEditPage = () => {
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ phone: '', address: '' });
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get('/api/auth/me')
            .then((res) => {
                setUser(res.data);
                setForm({
                    phone: res.data.phone || '',
                    address: res.data.address || '',
                });
            })
            .catch((err) => console.error(err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        const phoneChanged = (user.phone || '') !== form.phone;
        if (phoneChanged) {
            const ok = window.confirm(
                '전화번호가 변경되었습니다.\n' +
                    '(명세상 휴대폰 인증이 필요하지만, 현재는 미구현 상태로 저장만 진행합니다.)\n' +
                    '진행할까요?'
            );
            if (!ok) return;
        }

        setSaving(true);
        try {
            await axios.put(`/api/users/${user.id}`, {
                nickname: user.nickname,
                email: user.email,
                name: user.name,
                phone: form.phone,
                address: form.address,
                profileImageUrl: user.profileImageUrl,
            });
            alert('회원 정보가 저장되었습니다.');
            navigate('/mypage');
        } catch (err) {
            console.error(err);
            alert('저장 실패');
        } finally {
            setSaving(false);
        }
    };

    if (!user) return <div>로딩 중...</div>;

    return (
        <form onSubmit={handleSubmit} className="max-w-md">
            <h3 className="text-xl font-bold mb-4">회원 정보 수정</h3>

            <label className="block mb-3">
                <span className="text-sm text-gray-600">이름 (본명, 수정 불가)</span>
                <input
                    className="mt-1 block w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-500"
                    value={user.name || ''}
                    disabled
                />
            </label>

            <label className="block mb-3">
                <span className="text-sm text-gray-600">
                    생년월일 (수정 불가)
                </span>
                <input
                    className="mt-1 block w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-500"
                    value="-"
                    disabled
                    title="현재 스키마에 저장되지 않는 필드입니다."
                />
                <span className="text-xs text-gray-400">
                    * 현재 DB에 저장되지 않아 표시용 '-'로 노출됩니다. 스키마 확장 후 연결 예정.
                </span>
            </label>

            <label className="block mb-3">
                <span className="text-sm text-gray-600">전화번호</span>
                <input
                    className="mt-1 block w-full border rounded-lg px-3 py-2"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="010-0000-0000"
                />
            </label>

            <label className="block mb-4">
                <span className="text-sm text-gray-600">주소</span>
                <input
                    className="mt-1 block w-full border rounded-lg px-3 py-2"
                    value={form.address}
                    onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                    }
                />
            </label>

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                >
                    {saving ? '저장 중...' : '회원 정보 수정 완료'}
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

export default AccountEditPage;
