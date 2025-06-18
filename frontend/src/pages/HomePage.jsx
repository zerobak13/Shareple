// src/pages/HomePage.jsx
import React from 'react';
import axios from 'axios';

const HomePage = ({ user }) => {
    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout', null, {
                withCredentials: true
            });

            // 세션이 사라졌으니 새로고침하면 App.js에서 user=null 판단됨
            window.location.href = '/';
        } catch (error) {
            console.error('로그아웃 중 에러:', error);
            alert('로그아웃 실패');
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



            {user.profileImageUrl && (
                <div style={{ marginTop: '1rem' }}>
                    <img
                        src={user.profileImageUrl}
                        alt="프로필 이미지"
                        style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #ccc'
                        }}
                    />
                </div>
            )}


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
