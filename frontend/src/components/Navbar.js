// src/components/Navbar.js
// Shareple 글로벌 헤더: 로고, 검색, 주요 메뉴, 프로필/관리자, 로그아웃.
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [q, setQ] = useState('');
    const [openCount, setOpenCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get('/api/auth/me')
            .then((res) => setUser(res.data))
            .catch(() => setUser(null));
    }, []);

    useEffect(() => {
        if (user?.role !== 'ADMIN') return;
        axios
            .get('/api/admin/inquiries/open-count')
            .then((res) => setOpenCount(res.data?.count ?? 0))
            .catch(() => setOpenCount(0));
    }, [user?.role]);

    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout');
        } catch (err) {
            console.error(err);
        } finally {
            setUser(null);
            window.location.href = '/login';
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const keyword = q.trim();
        navigate(keyword ? `/search?q=${encodeURIComponent(keyword)}` : '/search');
    };

    const linkClass = ({ isActive }) =>
        `text-sm ${isActive ? 'text-primary font-semibold' : 'text-gray-600 hover:text-gray-900'}`;

    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
                {/* 로고 */}
                <Link
                    to="/"
                    className="flex items-center gap-2 select-none shrink-0"
                    aria-label="Shareple 홈"
                >
                    <span className="w-8 h-8 rounded-lg bg-primary text-white grid place-items-center text-sm font-black">
                        S
                    </span>
                    <span className="text-lg font-extrabold tracking-tight">Shareple</span>
                </Link>

                {/* 검색 */}
                <form
                    onSubmit={handleSearch}
                    className="hidden md:flex flex-1 max-w-xl items-center bg-gray-100 rounded-full px-4 h-10 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/30 transition"
                >
                    <span className="text-gray-400 mr-2">🔎</span>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="무엇을 빌려볼까요?"
                        className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
                    />
                    {q && (
                        <button
                            type="button"
                            onClick={() => setQ('')}
                            className="text-gray-400 text-xs px-2"
                            aria-label="검색어 지우기"
                        >
                            ✕
                        </button>
                    )}
                </form>

                {/* 우측 메뉴 */}
                <div className="flex items-center gap-4 ml-auto">
                    <NavLink to="/" end className={linkClass}>
                        홈
                    </NavLink>
                    <NavLink to="/search" className={linkClass}>
                        검색
                    </NavLink>

                    {!user && (
                        <Link
                            to="/login"
                            className="btn-primary !px-4 !py-1.5 !text-sm"
                        >
                            로그인
                        </Link>
                    )}

                    {user && (
                        <>
                            <NavLink to="/chat-rooms" className={linkClass} title="채팅">
                                💬
                            </NavLink>
                            <NavLink to="/product/register" className={linkClass}>
                                물품 등록
                            </NavLink>

                            {user.role === 'ADMIN' && (
                                <Link
                                    to="/admin/inquiries"
                                    className="relative text-sm font-semibold text-primary"
                                >
                                    🛠️ 관리자
                                    {openCount > 0 && (
                                        <span className="absolute -top-1.5 -right-3 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] text-center font-bold">
                                            {openCount > 99 ? '99+' : openCount}
                                        </span>
                                    )}
                                </Link>
                            )}

                            <Link
                                to="/mypage"
                                className="flex items-center gap-2 pl-2 border-l border-gray-200"
                            >
                                {user.profileImageUrl ? (
                                    <img
                                        src={
                                            user.profileImageUrl.startsWith('http')
                                                ? user.profileImageUrl
                                                : `http://localhost:8080${user.profileImageUrl}`
                                        }
                                        alt=""
                                        className="w-8 h-8 rounded-full object-cover border"
                                    />
                                ) : (
                                    <span className="w-8 h-8 rounded-full bg-gray-200 grid place-items-center text-sm">
                                        {(user.nickname || user.name || '?')[0]}
                                    </span>
                                )}
                                <span className="hidden sm:block text-sm text-gray-700 max-w-[100px] truncate">
                                    {user.nickname || user.name || user.email}
                                </span>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="text-xs text-gray-500 hover:text-gray-900"
                            >
                                로그아웃
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
