// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        return <div style={{ textAlign: 'center', marginTop: '2rem' }}>로딩 중...</div>;
    }

    if (error) {
        return <div style={{ textAlign: 'center', marginTop: '2rem', color: 'red' }}>{error}</div>;
    }

    if (!profile) {
        return <div style={{ textAlign: 'center', marginTop: '2rem' }}>로그인되지 않았습니다.</div>;
    }

    return (
        <div style={{
            maxWidth: '400px',
            margin: '2rem auto',
            padding: '1rem',
            border: '1px solid #ddd',
            borderRadius: '4px'
        }}>
            <h2>내 프로필</h2>
            <img
                src={profile.profileImageUrl ? `http://localhost:8080${profile.profileImageUrl}` : '/default-profile.png'}
                onError={(e) => e.target.src = '/default-profile.png'}
                alt="프로필"
                style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginBottom: '1rem'
                }}
            />
            <p><strong>ID:</strong> {profile.id}</p>
            <p><strong>카카오ID:</strong> {profile.kakaoId}</p>
            <p><strong>별명:</strong> {profile.nickname}</p>
            <p><strong>이메일:</strong> {profile.email || '없음'}</p>
            <p><strong>이름:</strong> {profile.name || '없음'}</p>
            <p><strong>전화번호:</strong> {profile.phone || '없음'}</p>
            <p><strong>주소:</strong> {profile.address || '없음'}</p>

            {/* ✅ 물품 관리 버튼 */}
            <button
                onClick={() => navigate('/mypage/products')}
                style={{
                    marginTop: '1.5rem',
                    padding: '0.6rem 1rem',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: '100%',
                    fontSize: '16px',
                    fontWeight: 'bold'
                }}
            >
                🧺 물품 관리하기
            </button>
        </div>
    );
};

export default ProfilePage;
