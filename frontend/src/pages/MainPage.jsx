import React from 'react';

const MainPage = ({ user }) => {
    return (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <h2>📌 Shareple 메인 페이지</h2>
            <p>안녕하세요, <strong>{user.name || user.nickname}</strong>님! 🎉</p>
            <p>이곳은 로그인한 사용자만 볼 수 있는 메인 페이지입니다.</p>
        </div>
    );
};

export default MainPage;
