// src/App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

function App() {
    const [user, setUser] = useState(null);       // 로그인된 사용자 정보
    const [loading, setLoading] = useState(true); // 인증 확인 중 로딩 상태

    useEffect(() => {
        // 앱이 처음 켜질 때 백엔드에 “로그인 상태인지” 확인
        axios
            .get('/api/auth/me')
            .then((res) => {
                setUser(res.data); // 로그인되어 있으면 유저 정보가 넘어온다.
            })
            .catch((err) => {
                // 401 Unauthorized가 떨어지면 아직 로그인이 안 된 상태
                console.log('아직 로그인되지 않음 (401):', err.response?.status);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '3rem' }}>로딩 중...</div>;
    }

    return (
        <BrowserRouter>
            {/* 간단한 네비게이션 바 */}
            <nav style={{ padding: '1rem', background: '#f0f0f0' }}>
                <a href="/" style={{ marginRight: '1rem' }}>Home</a>
                <a href="/login">Login</a>
            </nav>

            <Routes>
                {/* 루트("/") 경로 */}
                <Route
                    path="/"
                    element={
                        user ? (
                            <HomePage user={user} />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* /login 경로 */}
                <Route
                    path="/login"
                    element={
                        user ? (
                            <Navigate to="/" replace />
                        ) : (
                            <LoginPage />
                        )
                    }
                />

                {/* 그 외 모든 라우트는 404 처리 */}
                <Route
                    path="*"
                    element={
                        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                            404 Not Found<br/>
                            요청하신 페이지를 찾을 수 없습니다.
                        </div>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
