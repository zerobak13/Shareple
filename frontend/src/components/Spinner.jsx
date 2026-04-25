// src/components/Spinner.jsx
// 공용 로딩 스피너. fullBlock 으로 전체 섹션 로딩, inline 은 버튼 안 등에 사용.
import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-2',
        lg: 'w-8 h-8 border-[3px]',
    };
    return (
        <span
            className={`inline-block rounded-full animate-spin border-primary border-t-transparent ${sizes[size] || sizes.md} ${className}`}
            aria-label="loading"
        />
    );
};

export const LoadingBlock = ({ label = '불러오는 중...', className = '' }) => (
    <div className={`py-16 flex flex-col items-center justify-center gap-3 text-gray-400 ${className}`}>
        <Spinner size="lg" />
        <span className="text-sm">{label}</span>
    </div>
);

export default Spinner;
