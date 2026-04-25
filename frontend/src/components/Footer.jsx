// src/components/Footer.jsx
// 전역 푸터. 브랜드·저작권·약관 링크.
import React from 'react';

const Footer = () => {
    const year = new Date().getFullYear();
    return (
        <footer className="mt-16 border-t bg-white">
            <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-gray-500">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-primary font-extrabold text-lg">Shareple</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            beta
                        </span>
                    </div>
                    <div className="text-xs text-gray-400">
                        이웃과 함께 빌리고 공유하는 P2P 대여 플랫폼
                    </div>
                </div>
                <div className="flex flex-col sm:items-end gap-1">
                    <div className="flex gap-4 text-xs">
                        <a href="#" className="hover:text-primary">이용약관</a>
                        <a href="#" className="hover:text-primary">개인정보처리방침</a>
                        <a href="mailto:support@shareple.example" className="hover:text-primary">
                            고객지원
                        </a>
                    </div>
                    <div className="text-xs text-gray-400">© {year} Shareple. All rights reserved.</div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
