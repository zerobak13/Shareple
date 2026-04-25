// src/pages/mypage/AccountEditPage.jsx
// 회원 정보 수정 — 전화/주소.
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { LoadingBlock } from '../../components/Spinner';

const AccountEditPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ phone: '', address: '' });
    const [saving, setSaving] = useState(false);

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
                '전화번호가 변경되었습니다.\n(명세상 휴대폰 인증이 필요하지만 현재는 미구현입니다.)\n진행할까요?'
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
            alert('회원 정보가 저장되었어요.');
            navigate('/mypage');
        } catch (err) {
            console.error(err);
            alert('저장 실패: ' + (err?.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    if (!user) return <LoadingBlock />;

    return (
        <div className="max-w-md">
            <h3 className="text-xl font-extrabold mb-1">회원 정보 수정</h3>
            <p className="text-xs text-gray-500 mb-5">거래에 사용되는 연락 정보예요.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">이름 (수정 불가)</label>
                    <input className="input-base bg-gray-100 text-gray-500" value={user.name || ''} disabled />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">생년월일 (수정 불가)</label>
                    <input className="input-base bg-gray-100 text-gray-500" value="-" disabled />
                    <p className="text-[11px] text-gray-400 mt-1">
                        * 현재 DB 에 저장되지 않아 표시용으로만 노출돼요.
                    </p>
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">전화번호</label>
                    <input
                        className="input-base"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="010-0000-0000"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">주소</label>
                    <input
                        className="input-base"
                        value={form.address}
                        onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                        placeholder="예) 서울 강남구 역삼동"
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
                    <button type="submit" disabled={saving} className="btn-primary flex-1">
                        {saving ? '저장 중...' : '저장하기'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AccountEditPage;
