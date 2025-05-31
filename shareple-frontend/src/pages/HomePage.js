// src/pages/HomePage.js
import React from 'react';
import axios from 'axios';

const HomePage = ({ user }) => {
    // user: App.js에서 받아온 UserResponseDto 객체
    const handleLogout = async () => {
        try {
            // 로그아웃 요청 → 백엔드 세션(쿠키)을 무효화
            await axios.post('/api/auth/logout');
            // 로그아웃 후에는 / 로 강제 이동 → App.js에서 user=null 처리 → /login으로 리다이렉트됨
            window.location.href = '/';
        } catch (error) {
            console.error('로그아웃 중 에러:', error);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <h2>Shareple Home</h2>
            <p>
                환영합니다, <strong>{user.nickname || user.name || '사용자'}</strong>님!
            </p>

            <div style={{ marginTop: '2rem' }}>
                <p><strong>유저 정보</strong></p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li><strong>아이디 (PK):</strong> {user.id}</li>
                    <li><strong>카카오 ID:</strong> {user.kakaoId}</li>
                    <li><strong>닉네임:</strong> {user.nickname || '-'}</li>
                    <li><strong>이메일:</strong> {user.email || '-'}</li>
                    <li><strong>프로필 이미지 URL:</strong> {user.profileImageUrl || '-'}</li>
                    <li><strong>이름:</strong> {user.name || '-'}</li>
                    <li><strong>전화번호:</strong> {user.phone || '-'}</li>
                    <li><strong>주소:</strong> {user.address || '-'}</li>
                </ul>
            </div>

            <button
                onClick={handleLogout}
                style={{
                    marginTop: '2rem',
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.5rem 1.5rem',
                    fontSize: '1rem',
                    cursor: 'pointer',
                }}
            >
                로그아웃
            </button>
        </div>
    );
};

export default HomePage;
