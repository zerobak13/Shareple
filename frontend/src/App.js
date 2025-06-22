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
import MainPage from './pages/MainPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import ProductRegisterPage from './pages/RegisterProductPage';
import MyProductManagePage from './pages/MyProductManagePage';
import EditProductPage from './pages/EditProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ChatRoomPage from './pages/ChatRoomPage';

import Navbar from './components/Navbar';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get('/api/auth/me')
            .then((res) => setUser(res.data))
            .catch((err) => {
                console.log('로그인되지 않음:', err.response?.status);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '3rem' }}>로딩 중...</div>;
    }

    return (
        <BrowserRouter>
            <Navbar /> {/* ✅ 상단 바 */}
            <Routes>
                {/* 메인 경로 */}
                <Route
                    path="/"
                    element={
                        user ? (
                            !user.email || !user.name || !user.phone || !user.address ? (
                                <Navigate to="/complete-profile" replace />
                            ) : (
                                <MainPage user={user} />
                            )
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* 로그인 페이지 */}
                <Route
                    path="/login"
                    element={
                        user ? <Navigate to="/" replace /> : <LoginPage />
                    }
                />

                {/* 추가 정보 입력 페이지 */}
                <Route
                    path="/complete-profile"
                    element={
                        user ? <CompleteProfilePage user={user} /> : <Navigate to="/login" replace />
                    }
                />

                {/* 마이페이지(프로필) */}
                <Route
                    path="/profile"
                    element={
                        user ? <HomePage user={user} /> : <Navigate to="/login" replace />
                    }
                />

                {/* 메인페이지 직접 접근 */}
                <Route
                    path="/main"
                    element={
                        user ? <MainPage user={user} /> : <Navigate to="/login" replace />
                    }
                />

                {/* 물품 등록 페이지 */}
                <Route
                    path="/product/register"
                    element={
                        user ? <ProductRegisterPage user={user} /> : <Navigate to="/login" replace />
                    }
                />

                <Route path="/mypage/products" element={<MyProductManagePage />} /> {/* ✅ 필수 */}

                <Route path="/edit/:id" element={<EditProductPage />} />

                <Route path="/" element={<MainPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/chat/:roomId" element={<ChatRoomPage />} />

                {/* 404 처리 */}
                <Route
                    path="*"
                    element={
                        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                            404 Not Found<br />
                            요청하신 페이지를 찾을 수 없습니다.
                        </div>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
