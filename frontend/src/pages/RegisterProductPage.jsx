// src/pages/RegisterProductPage.jsx
// 물품 등록 페이지 래퍼.
import React from 'react';
import ProductForm from '../components/ProductForm';

const RegisterProductPage = () => {
    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold">물품 등록</h1>
                <p className="text-sm text-gray-500 mt-1">
                    사진과 함께 정확한 정보를 입력할수록 더 빨리 거래가 이루어져요.
                </p>
            </div>
            <ProductForm />
        </div>
    );
};

export default RegisterProductPage;
