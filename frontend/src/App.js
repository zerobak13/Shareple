import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';

// NOTE: 기존 /profile 라우트에서 사용하던 HomePage 는 /mypage 로 대체되어
//       더 이상 App 라우트에서 사용하지 않습니다. 파일은 참고용으로 보존됩니다.
// import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import ProductRegisterPage from './pages/RegisterProductPage';
import MyProductManagePage from './pages/MyProductManagePage';
import EditProductPage from './pages/EditProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ChatRoomPage from './pages/ChatRoomPage';
import MyChatRoomsPage from './pages/MyChatRoomsPage';
import SearchPage from './pages/SearchPage';

// 마이페이지 컨테이너 + 서브 페이지
import MyPage from './pages/MyPage';
import MyPageHome from './pages/mypage/MyPageHome';
import ProfileEditPage from './pages/mypage/ProfileEditPage';
import AccountEditPage from './pages/mypage/AccountEditPage';
import RentalHistoryPage from './pages/mypage/RentalHistoryPage';
import ReturnHistoryPage from './pages/mypage/ReturnHistoryPage';
import ReviewHistoryPage from './pages/mypage/ReviewHistoryPage';
import SupportPage from './pages/mypage/SupportPage';
import SettingsPage from './pages/mypage/SettingsPage';

// 관리자 페이지
import AdminInquiriesPage from './pages/admin/AdminInquiriesPage';

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

                {/* 레거시 /profile → /mypage 로 리다이렉트 */}
                <Route path="/profile" element={<Navigate to="/mypage" replace />} />

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

                {/* 마이페이지 (중첩 라우팅) */}
                <Route
                    path="/mypage"
                    element={user ? <MyPage /> : <Navigate to="/login" replace />}
                >
                    <Route index element={<MyPageHome />} />
                    <Route path="profile" element={<ProfileEditPage />} />
                    <Route path="account" element={<AccountEditPage />} />
                    <Route path="rentals" element={<RentalHistoryPage />} />
                    <Route path="returns" element={<ReturnHistoryPage />} />
                    <Route path="products" element={<MyProductManagePage />} />
                    <Route path="reviews" element={<ReviewHistoryPage />} />
                    <Route path="support" element={<SupportPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>

                <Route path="/edit/:id" element={<EditProductPage />} />

                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/chat/:roomId" element={<ChatRoomPage />} />
                <Route path="/chat-rooms" element={<MyChatRoomsPage />} />
                <Route path="/search" element={<SearchPage />} />

                {/* 관리자 전용 — 실제 권한 체크는 백엔드 + 페이지 내부에서 수행 */}
                <Route
                    path="/admin/inquiries"
                    element={user ? <AdminInquiriesPage /> : <Navigate to="/login" replace />}
                />

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
