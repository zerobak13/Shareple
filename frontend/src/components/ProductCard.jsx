// src/components/ProductCard.jsx
// 메인/검색/내 상품에서 공용으로 쓰는 상품 카드.
import React from 'react';
import { useNavigate } from 'react-router-dom';

const resolveImage = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8080${url}`;
};

const ProductCard = ({ product, actions, onClick }) => {
    const navigate = useNavigate();
    const isRented = String(product.status || '').toUpperCase() === 'RENTED';
    const img = resolveImage(product.imageUrl);

    const handleClick = () => {
        if (onClick) onClick(product);
        else navigate(`/products/${product.id}`);
    };

    return (
        <div className="group card overflow-hidden transition hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
            <div
                onClick={handleClick}
                className="relative w-full aspect-square bg-gray-100"
            >
                {img ? (
                    <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                    />
                ) : (
                    <div className="w-full h-full grid place-items-center text-3xl text-gray-300">
                        🛍️
                    </div>
                )}
                {isRented && (
                    <span className="absolute left-2 top-2 bg-black/60 text-white text-[11px] font-semibold px-2 py-1 rounded-md">
                        대여중
                    </span>
                )}
                {product.category && (
                    <span className="absolute right-2 top-2 bg-white/90 text-gray-700 text-[11px] font-medium px-2 py-0.5 rounded-full">
                        {product.category}
                    </span>
                )}
            </div>
            <div onClick={handleClick} className="p-3">
                <div className="text-sm font-semibold text-gray-900 truncate">
                    {product.name}
                </div>
                <div className="mt-1 text-[15px] font-bold text-gray-900">
                    {Number(product.price || 0).toLocaleString()}원
                    <span className="text-xs font-normal text-gray-400"> / 1일</span>
                </div>
                {product.location && (
                    <div className="mt-1 text-xs text-gray-500 truncate">
                        📍 {product.location}
                    </div>
                )}
            </div>
            {actions && (
                <div className="px-3 pb-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {actions}
                </div>
            )}
        </div>
    );
};

export default ProductCard;
