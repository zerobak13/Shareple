import React from 'react';

const LoginPage = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <h2>Shareple 로그인</h2>
            <p>카카오 계정으로 로그인하세요</p>

            {/* 카카오 로그인 버튼 */}
            <button
                onClick={() => {
                    // 프록시 설정 덕분에 React 서버에서 호출하면 백엔드로 전달됨
                    window.location.href = '/oauth2/authorization/kakao';
                }}
                style={{
                    background: '#FEE500',
                    border: 'none',
                    padding: '0.75rem 2rem',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: 'pointer'
                }}
            >
                카카오 로그인
            </button>
        </div>
    );
};

export default LoginPage;
