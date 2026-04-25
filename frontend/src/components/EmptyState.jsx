// src/components/EmptyState.jsx
// 어떤 목록이 비었을 때 렌더링하는 공용 빈 상태 컴포넌트.
import React from 'react';

const EmptyState = ({
    icon = '📭',
    title = '항목이 없습니다',
    description,
    action,
    className = '',
}) => {
    return (
        <div
            className={`border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center bg-white ${className}`}
        >
            <div className="text-4xl mb-3">{icon}</div>
            <div className="text-base font-semibold text-gray-700 mb-1">{title}</div>
            {description && (
                <div className="text-sm text-gray-500 whitespace-pre-line">{description}</div>
            )}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
};

export default EmptyState;
