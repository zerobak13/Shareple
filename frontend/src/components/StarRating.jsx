// src/components/StarRating.jsx
// 별점 표시 / 입력 공용 컴포넌트.
//  - readOnly=true : 별만 표시 (반개 지원, average 사용)
//  - readOnly=false: 클릭 입력 (value, onChange)
import React, { useState } from 'react';

const Star = ({ fill }) => (
    // fill: 0 ~ 1 (0=빈별, 0.5=반별, 1=꽉찬별). 현재는 0 / 0.5 / 1 만 사용
    <span className="relative inline-block w-4 h-4 leading-none">
        <span className="absolute inset-0 text-gray-300">★</span>
        <span
            className="absolute inset-0 overflow-hidden text-yellow-400"
            style={{ width: `${Math.max(0, Math.min(1, fill)) * 100}%` }}
        >
            ★
        </span>
    </span>
);

const StarRating = ({
    value = 0,
    readOnly = false,
    onChange,
    size = 'md',
    showNumber = false,
    count = 0,
}) => {
    const [hover, setHover] = useState(0);

    const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-base';

    if (readOnly) {
        const v = Math.max(0, Math.min(5, Number(value) || 0));
        return (
            <span className={`inline-flex items-center gap-0.5 ${textSize}`}>
                {[0, 1, 2, 3, 4].map((i) => {
                    const diff = v - i;
                    const fill = diff >= 1 ? 1 : diff >= 0.5 ? 0.5 : 0;
                    return <Star key={i} fill={fill} />;
                })}
                {showNumber && (
                    <span className="ml-1 text-xs text-gray-600">
                        {v.toFixed(1)}
                        {count > 0 ? ` (${count})` : ''}
                    </span>
                )}
            </span>
        );
    }

    const active = hover || value;
    return (
        <span className={`inline-flex items-center gap-1 ${textSize}`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => onChange && onChange(i)}
                    className={`${
                        i <= active ? 'text-yellow-400' : 'text-gray-300'
                    } text-2xl leading-none`}
                    aria-label={`${i}점`}
                >
                    ★
                </button>
            ))}
        </span>
    );
};

export default StarRating;
