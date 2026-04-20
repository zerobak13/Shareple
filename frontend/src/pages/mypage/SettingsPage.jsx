// src/pages/mypage/SettingsPage.jsx
// 명세서: 마이페이지 > 설정
//  - 알림 설정: 준비 중
//  - 언어 설정: 준비 중
//  - 이용약관 및 정책: 준비 중
//  - 로그아웃 (버튼): 구현
//  - 회원 탈퇴 (버튼): 구현 (※ 현재 백엔드 /api/users/{id} DELETE 사용.
//                                추후 '내 계정 탈퇴' 전용 엔드포인트 + 대여중 물품 존재 시 차단 로직 필요)
import React from 'react';
import axios from '../../api/axiosInstance';

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
            '정말로 회원 탈퇴 하시겠습니까?\n탈퇴 시 모든 내역이 삭제됩니다.'
        );
        if (!ok) return;

        try {
            const me = await axios.get('/api/auth/me');
            await axios.delete(`/api/users/${me.data.id}`);
            alert('회원 탈퇴가 완료되었습니다.');
            // 세션 정리 후 로그인으로
            try {
                await axios.post('/api/auth/logout');
            } catch (_) {}
            window.location.href = '/login';
        } catch (err) {
            console.error(err);
            alert('탈퇴 실패');
        }
    };

    return (
        <div className="max-w-lg">
            <h3 className="text-xl font-bold mb-4">설정</h3>

            <section className="mb-6">
                <h4 className="font-semibold mb-2">알림 설정</h4>
                <p className="text-sm text-gray-500">알림 허용 기능은 준비 중입니다.</p>
            </section>

            <section className="mb-6">
                <h4 className="font-semibold mb-2">언어 설정</h4>
                <p className="text-sm text-gray-500">한국어 (변경 기능 준비 중)</p>
            </section>

            <section className="mb-6">
                <h4 className="font-semibold mb-2">이용약관 및 정책</h4>
                <p className="text-sm text-gray-500">준비 중</p>
            </section>

            <div className="flex flex-col gap-2 pt-4 border-t">
                <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
                >
                    로그아웃
                </button>
                <button
                    onClick={handleWithdrawal}
                    className="w-full px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                    회원 탈퇴
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
