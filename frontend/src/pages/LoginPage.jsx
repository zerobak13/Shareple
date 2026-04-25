// src/pages/LoginPage.jsx
// Shareple 로그인 — 카카오 OAuth2 로그인 전용. 중앙 히어로 카드 레이아웃.
import React from 'react';

const LoginPage = () => {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">
                {/* 히어로 */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-3">
                        <span className="w-10 h-10 rounded-xl bg-primary text-white grid place-items-center text-lg font-black">
                            S
                        </span>
                        <span className="text-2xl font-extrabold tracking-tight">Shareple</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-1">
                        이웃과 함께, 더 똑똑하게 빌려 쓰세요
                    </h1>
                    <p className="text-sm text-gray-500">
                        필요한 순간에만 빌리고, 쓰지 않는 물건은 함께 나눠요.
                    </p>
                </div>

                {/* 로그인 카드 */}
                <div className="card p-6">
                    <div className="text-center mb-5">
                        <h2 className="text-base font-bold text-gray-900">로그인</h2>
                        <p className="text-xs text-gray-500 mt-1">
                            카카오 계정으로 간편하게 시작해요
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            window.location.href = '/oauth2/authorization/kakao';
                        }}
                        className="w-full h-12 rounded-xl bg-[#FEE500] hover:brightness-95 active:brightness-90 transition flex items-center justify-center gap-2 text-[#191919] font-semibold"
                    >
                        <span className="text-xl">💬</span>
                        <span>카카오로 3초만에 시작하기</span>
                    </button>

                    <div className="mt-5 pt-4 border-t text-[11px] text-gray-400 leading-relaxed text-center">
                        로그인하면{' '}
                        <a href="#" className="underline hover:text-gray-600">이용약관</a>
                        {' '}및{' '}
                        <a href="#" className="underline hover:text-gray-600">개인정보처리방침</a>
                        에 동의하는 것으로 간주됩니다.
                    </div>
                </div>

                {/* 소셜 증거 */}
                <div className="mt-8 grid grid-cols-3 gap-3 text-center text-xs text-gray-500">
                    <div className="card p-3">
                        <div className="text-lg mb-1">🛒</div>
                        <div>필요한 기간만큼만</div>
                    </div>
                    <div className="card p-3">
                        <div className="text-lg mb-1">🛡️</div>
                        <div>보증금으로 안심</div>
                    </div>
                    <div className="card p-3">
                        <div className="text-lg mb-1">⭐</div>
                        <div>리뷰 기반 신뢰</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
