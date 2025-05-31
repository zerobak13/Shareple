// src/pages/LoginPage.js
import React from 'react';

const LoginPage = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <h2>Shareple Login</h2>
            <p>아래 버튼을 눌러 카카오로 로그인하세요.</p>

            {/* ▶ 반드시 window.location.href 방식으로 전체 페이지 새로고침 형태로 보냅니다. */}
            <button
                onClick={() => {
                    // CRA 개발 서버의 proxy 설정이 있으므로,
                    // 이 경로를 호출하면 → 3000(proxy) → 8080 (/oauth2/authorization/kakao) 로 전달됩니다.
                    window.location.href = '/oauth2/authorization/kakao';
                }}
                style={{
                    background: '#FFEB00',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.5rem 1.5rem',
                    fontSize: '1rem',
                    cursor: 'pointer',
                }}
            >
                카카오 로그인
            </button>
        </div>
    );
};

export default LoginPage;
