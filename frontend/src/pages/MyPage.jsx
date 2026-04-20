// src/pages/MyPage.jsx
// 마이페이지 컨테이너: 좌측 메뉴 + 우측 서브 라우트 렌더링
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const menu = [
    { to: '/mypage', label: '마이페이지 홈', end: true, icon: '🏠' },
    { to: '/mypage/profile', label: '프로필 수정', icon: '👤' },
    { to: '/mypage/account', label: '회원 정보 수정', icon: '📝' },
    { to: '/mypage/rentals', label: '대여 내역', icon: '📥' },
    { to: '/mypage/returns', label: '반납 내역', icon: '📤' },
    { to: '/mypage/products', label: '내 물품 관리', icon: '📦' },
    { to: '/mypage/reviews', label: '리뷰 내역', icon: '⭐' },
    { to: '/mypage/support', label: '고객지원', icon: '💬' },
    { to: '/mypage/settings', label: '설정', icon: '⚙️' },
];

const MyPage = () => {
    return (
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
            <aside className="bg-white border rounded-2xl p-3 h-fit md:sticky md:top-6">
                <h2 className="text-lg font-bold px-3 py-2 mb-2">마이페이지</h2>
                <nav className="flex flex-col gap-1">
                    {menu.map((m) => (
                        <NavLink
                            key={m.to}
                            to={m.to}
                            end={m.end}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 font-semibold'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`
                            }
                        >
                            <span>{m.icon}</span>
                            <span>{m.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <section className="bg-white border rounded-2xl p-6 min-h-[400px]">
                <Outlet />
            </section>
        </div>
    );
};

export default MyPage;
