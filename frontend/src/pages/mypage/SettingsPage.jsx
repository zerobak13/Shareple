// src/pages/mypage/SettingsPage.jsx
// 설정 — 알림/언어/약관(준비 중) + 로그아웃/회원 탈퇴.
import React from 'react';
import axios from '../../api/axiosInstance';

const Row = ({ title, desc, right }) => (
    <div className="flex items-center justify-between py-4 border-b last:border-b-0">
        <div>
            <div className="text-sm font-semibold text-gray-800">{title}</div>
            {desc && <div className="text-xs text-gray-500 mt-0.5">{desc}</div>}
        </div>
        {right}
    </div>
);

const SettingsPage = () => {
    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout');
        } catch (err) {
            console.error(err);
        } finally {
            window.location.href = '/login';
        }
    };

    const handleWithdrawal = async () => {
        const ok = window.confirm(
            '정말로 회원 탈퇴 하시겠어요?\n탈퇴 시 모든 내역이 삭제되며 복구되지 않습니다.'
        );
        if (!ok) return;

        try {
            const me = await axios.get('/api/auth/me');
            await axios.delete(`/api/users/${me.data.id}`);
            alert('회원 탈퇴가 완료되었습니다.');
            try {
                await axios.post('/api/auth/logout');
            } catch (_) {}
            window.location.href = '/login';
        } catch (err) {
            console.error(err);
            alert('탈퇴 실패: ' + (err?.response?.data?.error || err.message));
        }
    };

    return (
        <div className="max-w-lg">
            <h3 className="text-xl font-extrabold mb-1">설정</h3>
            <p className="text-xs text-gray-500 mb-5">알림과 계정 관련 설정이에요.</p>

            <div className="card p-1 mb-6">
                <Row
                    title="알림 설정"
                    desc="대여·채팅 알림을 받아볼 수 있어요."
                    right={<span className="text-xs text-gray-400">준비 중</span>}
                />
                <Row
                    title="언어"
                    desc="서비스 표시 언어를 바꿀 수 있어요."
                    right={<span className="text-xs text-gray-400">한국어</span>}
                />
                <Row
                    title="이용약관 및 정책"
                    desc="서비스 이용과 관련된 정책을 확인할 수 있어요."
                    right={<span className="text-xs text-gray-400">준비 중</span>}
                />
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t">
                <button onClick={handleLogout} className="btn-secondary w-full">
                    로그아웃
                </button>
                <button onClick={handleWithdrawal} className="btn-danger w-full">
                    회원 탈퇴
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
