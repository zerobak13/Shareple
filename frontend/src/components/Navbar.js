import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        setUser(response.data);
      } catch (err) {
        setUser(null);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      navigate('/login');
    }
  };

  const navItems = [
    { name: '홈', path: '/' },
    { name: '검색', path: '/search' },
    { name: '물품 등록하기', path: '/product/register' },
    { name: '채팅', path: '/chat-rooms' },
    { name: '마이페이지', path: '/profile' },
  ];

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* 왼쪽: 로고 + 네비게이션 링크 */}
        <div className="flex items-center">
          <div className="text-xl font-bold text-primary tracking-wide">
            <Link to="/">Shareple</Link>
          </div>

          <div className="ml-24">
            {/* 탭 사이 간격 */}
                <div className="flex gap-x-20">
                {navItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`font-medium transition ${
                    location.pathname === item.path
                        ? 'text-primary'
                        : 'text-gray-700 hover:text-accent'
                    }`}
                >
                    {item.name}
                </Link>
                ))}
                </div>
            </div>
        </div>

        {/* 오른쪽: 로그인 or 로그아웃 버튼 */}
        <div>
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition"
            >
              로그아웃
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
