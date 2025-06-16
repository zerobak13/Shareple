// src/components/Navbar.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axiosInstance';

const Navbar = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // 현재 로그인된 사용자를 가져오는 API 호출
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
            // 로그아웃 엔드포인트 호출 (AuthController에서 구현한 대로 /api/auth/logout)
            await axios.post('/api/auth/logout');
        } catch (err) {
            console.error(err);
        } finally {
            setUser(null);
            // 로그아웃 후 로그인 페이지로 이동
            window.location.href = '/login';
        }
    };

    return (
        <nav style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
            <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
            {!user && (
                <Link to="/login">Login</Link>
            )}
            {user && (
                <>
                    <Link to="/profile" style={{ marginRight: '1rem' }}>
                        {user.nickname || user.email}
                    </Link>
                    <button onClick={handleLogout}>Logout</button>
                </>
            )}
        </nav>
    );
};

export default Navbar;
