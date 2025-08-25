import React, { useEffect, useState } from 'react';

const EditProductPage = ({ productId, onClose }) => {
  const [product, setProduct] = useState(null);
  const [image, setImage] = useState(null);

  
  useEffect(() => {
  document.body.style.overflow = 'hidden';
  return () => {
    document.body.style.overflow = 'auto';
  };
}, []);


  useEffect(() => {
    fetch(`/api/products/my`)
      .then(res => res.json())
      .then(data => {
        const found = data.find(item => item.id === parseInt(productId));
        if (!found) {
          alert("물품을 찾을 수 없습니다.");
          onClose();
        } else {
          setProduct(found);
        }
      });
      
  }, [productId, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(product).forEach(([key, value]) => {
      if (key !== 'id') formData.append(key, value);
    });
    if (image) formData.append("image", image);

    const response = await fetch(`/api/products/${productId}`, {
      method: "PUT",
      body: formData
    });

    if (response.ok) {
      alert("수정 완료!");
      onClose(); // 모달 닫기
    } else {
      alert("수정 실패");
    }
  };

  if (!product) return null;

  return (
    
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-4 text-xl text-gray-400 hover:text-black">×</button>
        <h2 className="text-2xl font-bold text-[#00C7BE] mb-4">물품 정보 수정</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={product.name} onChange={handleChange} placeholder="물품명" className="w-full p-3 border rounded-md" />
          <input name="price" value={product.price} onChange={handleChange} type="number" placeholder="대여료(원/일)" className="w-full p-3 border rounded-md" />
          <input name="deposit" value={product.deposit} onChange={handleChange} type="number" placeholder="보증금" className="w-full p-3 border rounded-md" />
          <textarea name="description" value={product.description} onChange={handleChange} placeholder="상품 설명" className="w-full p-3 border rounded-md" />
          <input name="category" value={product.category} onChange={handleChange} placeholder="카테고리" className="w-full p-3 border rounded-md" />
          <input name="deadline" value={product.deadline} onChange={handleChange} type="date" className="w-full p-3 border rounded-md" />
          <input name="method" value={product.method} onChange={handleChange} placeholder="거래 방식 (직거래/택배)" className="w-full p-3 border rounded-md" />
          <input name="location" value={product.location} onChange={handleChange} placeholder="거래 장소" className="w-full p-3 border rounded-md" />
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} className="w-full" />
          <button type="submit" className="bg-[#00C7BE] text-white px-6 py-2 rounded-md font-semibold w-full">수정 완료</button>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;
