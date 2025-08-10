import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Keep the existing CSS import

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState('profile'); // State to manage active section

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('/api/auth/me');
                setProfile(response.data);
            } catch (err) {
                console.error(err);
                setError('프로필 정보를 가져오는 데 실패했습니다. 로그인 상태인지 확인하세요.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return <div className="center-message">로딩 중...</div>;
    }

    if (error) {
        return <div className="center-message error-message">{error}</div>;
    }

    if (!profile) {
        return <div className="center-message">로그인되지 않았습니다.</div>;
    }

    const renderSection = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="profile-details-card">
                        <h3>내 프로필 정보</h3>
                        <img
                            src={profile.profileImageUrl ? `http://localhost:8080${profile.profileImageUrl}` : '/default-profile.png'}
                            onError={(e) => e.target.src = '/default-profile.png'}
                            alt="프로필"
                            className="profile-image-display"
                        />
                        <p><strong>ID:</strong> {profile.id}</p>
                        <p><strong>카카오ID:</strong> {profile.kakaoId}</p>
                        <p><strong>별명:</strong> {profile.nickname}</p>
                        <p><strong>이메일:</strong> {profile.email || '없음'}</p>
                        <p><strong>이름:</strong> {profile.name || '없음'}</p>
                        <p><strong>전화번호:</strong> {profile.phone || '없음'}</p>
                        <p><strong>주소:</strong> {profile.address || '없음'}</p>
                        <button onClick={() => setActiveSection('edit-profile')} className="action-button primary">
                            개인정보 수정
                        </button>
                    </div>
                );
            case 'edit-profile':
                // This would be a separate component (e.g., <EditProfile />)
                // For demonstration, a placeholder:
                return (
                    <div className="section-content">
                        <h3>개인정보 수정 ⚙️</h3>
                        <p>여기에 개인정보 수정 폼이 들어갑니다.</p>
                        {/* Input fields for ID, Password, Profile Picture, Nickname, Email, Name, Phone, Address, Alias */}
                        <button className="action-button primary">수정 완료</button>
                        <button onClick={() => setActiveSection('profile')} className="action-button secondary">
                            취소
                        </button>
                    </div>
                );
            case 'transactions':
                // This would be a separate component (e.g., <TransactionHistory />)
                return (
                    <div className="section-content">
                        <h3>거래 내역 📝</h3>
                        <p>대여 내역과 반납 내역이 여기에 표시됩니다.</p>
                        <h4>대여 내역</h4>
                        <ul>
                            <li>
                                <strong>품목:</strong> 자전거, <strong>상태:</strong> 대여 중
                                <button className="action-button small">💬 채팅으로 이동</button>
                                <button className="action-button small warning">🚨 분실 신고</button>
                                <button className="action-button small danger">❌ 취소</button>
                            </li>
                            {/* More rental items */}
                        </ul>
                        <h4>반납 내역</h4>
                        <ul>
                            <li>
                                <strong>품목:</strong> 노트북, <strong>상태:</strong> 반납 완료
                                <button className="action-button small">💬 채팅으로 이동</button>
                                <button className="action-button small success">⭐ 리뷰 작성</button>
                            </li>
                            {/* More return items */}
                        </ul>
                    </div>
                );
            case 'manage-products':
                // This would be a separate component (e.g., <ProductManagement />)
                return (
                    <div className="section-content">
                        <h3>물품 조회 및 수정 🧺</h3>
                        <p>등록한 물품 목록과 수정/삭제 기능이 여기에 표시됩니다.</p>
                        <button className="action-button primary" onClick={() => navigate('/mypage/products')}>
                            물품 관리하기
                        </button>
                        {/* Example product item */}
                        <div className="product-item-card">
                            <h4>내 물품 1</h4>
                            <p>간단한 설명...</p>
                            <button className="action-button small">✏️ 수정</button>
                            <button className="action-button small danger">🗑️ 삭제</button>
                        </div>
                    </div>
                );
            case 'reviews':
                // This would be a separate component (e.g., <ReviewHistory />)
                return (
                    <div className="section-content">
                        <h3>리뷰 내역 확인 ⭐</h3>
                        <h4>대여 물품 리뷰 내역</h4>
                        <p>내가 빌린 물품에 대한 리뷰가 여기에 표시됩니다.</p>
                        <h4>내 물품 리뷰 내역</h4>
                        <p>내 물품에 대한 리뷰가 여기에 표시됩니다.</p>
                    </div>
                );
            case 'customer-support':
                // This would be a separate component (e.g., <CustomerSupport />)
                return (
                    <div className="section-content">
                        <h3>고객 지원 헬프 🤝</h3>
                        <p>궁금한 점이 있으시면 언제든지 문의해주세요!</p>
                        <button className="action-button primary">고객센터</button>
                        <button className="action-button secondary">문의하기</button>
                    </div>
                );
            case 'settings':
                // This would be a separate component (e.g., <Settings />)
                return (
                    <div className="section-content">
                        <h3>설정 ⚙️</h3>
                        <ul className="settings-list">
                            <li><button className="setting-item-button">알림 설정</button></li>
                            <li><button className="setting-item-button">사용자 설정</button></li>
                            <li><button className="setting-item-button">언어 설정</button></li>
                            <li><button className="setting-item-button">이용약관 및 정책</button></li>
                            <li><button className="action-button danger" onClick={() => { if (window.confirm('로그아웃 하시겠습니까?')) navigate('/logout'); }}>로그아웃</button></li>
                            <li><button className="action-button danger" onClick={() => { if (window.confirm('정말로 회원 탈퇴를 하시겠습니까? 모든 정보가 삭제됩니다.')) console.log('회원 탈퇴 처리'); }}>회원 탈퇴</button></li>
                        </ul>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="mypage-container">
            <h1 className="mypage-title">마이페이지</h1>
            <div className="mypage-layout">
                <nav className="mypage-sidebar">
                    <ul>
                        <li>
                            <button className={activeSection === 'profile' ? 'active' : ''} onClick={() => setActiveSection('profile')}>
                                👤 개인정보
                            </button>
                        </li>
                        <li>
                            <button className={activeSection === 'transactions' ? 'active' : ''} onClick={() => setActiveSection('transactions')}>
                                📜 거래 내역
                            </button>
                        </li>
                        <li>
                            <button className={activeSection === 'manage-products' ? 'active' : ''} onClick={() => setActiveSection('manage-products')}>
                                🧺 물품 관리
                            </button>
                        </li>
                        <li>
                            <button className={activeSection === 'reviews' ? 'active' : ''} onClick={() => setActiveSection('reviews')}>
                                ⭐ 리뷰 내역
                            </button>
                        </li>
                        <li>
                            <button className={activeSection === 'customer-support' ? 'active' : ''} onClick={() => setActiveSection('customer-support')}>
                                🤝 고객 지원
                            </button>
                        </li>
                        <li>
                            <button className={activeSection === 'settings' ? 'active' : ''} onClick={() => setActiveSection('settings')}>
                                ⚙️ 설정
                            </button>
                        </li>
                    </ul>
                </nav>
                <main className="mypage-content">
                    {renderSection()}
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;