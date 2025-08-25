import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import EditProductPage from './EditProductPage';

const HomePage = () => {
  const [tab, setTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [rentalHistory, setRentalHistory] = useState([]);
  const [productList, setProductList] = useState([]);
  const [rentalFilter, setRentalFilter] = useState('전체');
  const [productFilter, setProductFilter] = useState('전체');
  const [editingProductId, setEditingProductId] = useState(null);

  const navigate = useNavigate();
  

  useEffect(() => {
  const fetchUserData = async () => {
    try {
      const userRes = await axios.get('/api/auth/me');
      setUser(userRes.data);

      const productRes = await axios.get('/api/products/my');
      console.log('✅ 내 상품:', productRes.data); // 여기 추가
      setProductList(productRes.data);
    } catch (err) {
      console.error('❌ 내 상품 조회 실패:', err);  
    }
  };

  fetchUserData();
}, []);


  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setTab(id)}
      className={`pb-2 border-b-2 font-medium text-sm md:text-base transition-colors duration-200 ${
        tab === id
          ? 'border-[#00C7BE] text-[#00C7BE]'
          : 'border-transparent text-gray-500 hover:text-[#00C7BE]'
      }`}
    >
      {label}
    </button>
  );

  const FilterButton = ({ label, value, current, setFilter }) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-3 py-1 rounded-full border text-sm font-medium ${
        current === value ? 'bg-[#00C7BE] text-white' : 'border-gray-300 text-gray-600'
      }`}
    >
      {label}
    </button>
  );

  const RentalCard = ({ item }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
      <div className="font-semibold text-base mb-1">{item.title}</div>
      <div className="text-sm text-gray-500">대여자: {item.ownerName}</div>
      <div className="text-sm text-gray-500 mb-2">대여기간: {item.startDate} ~ {item.endDate}</div>
      <div className="flex justify-between items-center">
        <span className={`text-sm font-semibold ${item.status === '대여중' ? 'text-blue-500' : 'text-green-500'}`}>{item.status}</span>
        <span className="text-base font-bold">{item.price.toLocaleString()}원</span>
      </div>
    </div>
  );

  const ProductCard = ({ product }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
    <div className="font-semibold text-base mb-1">{product.name}</div>
    <div className="text-sm text-gray-500">카테고리: {product.category}</div>
    <div className="text-sm text-gray-500">{product.description}</div>
    <div className="flex justify-between items-center mt-2">
      <span className={`text-sm font-semibold ${product.status === '대여중' ? 'text-blue-500' : 'text-green-500'}`}>{product.status}</span>
      <span className="text-base font-bold">{product.price.toLocaleString()}원/일</span>
    </div>
    <div className="mt-3 flex gap-2">
      <button
        className={`px-3 py-1 text-sm rounded-md ${product.status === '대여 가능' ? 'bg-[#00C7BE] text-white' : 'bg-gray-300 text-white cursor-not-allowed'}`}
        disabled={product.status !== '대여 가능'}
        onClick={() => setEditingProductId(product.id)}
      >
        정보 수정
      </button>
      <button className="px-3 py-1 border border-red-500 text-red-500 text-sm rounded-md">삭제</button>
    </div>
  </div>
);


  if (!user) return <div className="text-center mt-10">로딩 중...</div>;

  const filteredRental = rentalFilter === '전체' ? rentalHistory : rentalHistory.filter(item => item.status === rentalFilter);
  const filteredProducts = productFilter === '전체' ? productList : productList.filter(item => item.status === productFilter);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-300" />
        <div>
          <div className="text-xl font-bold">{user.nickname}님</div>
          <div className="text-gray-500 text-sm">안녕하세요!</div>
        </div>
      </div>

      <div className="flex gap-6 border-b mb-6">
        <TabButton id="profile" label="👤 내 정보" />
        <TabButton id="rental" label="📦 대여 내역" />
        <TabButton id="products" label="📦 물품 조회 및 수정" />
      </div>

       {tab === 'profile' && (
        <>
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <div className="text-lg font-bold mb-4">개인정보</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">이름</label>
                <input
                  type="text"
                  value={user.name || ''}
                  disabled
                  className="w-full p-2 mt-1 rounded-md bg-gray-100 border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">이메일</label>
                <input
                  type="text"
                  value={user.email || ''}
                  disabled
                  className="w-full p-2 mt-1 rounded-md bg-gray-100 border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">휴대폰 번호</label>
                <input
                  type="text"
                  value={user.phone || ''}
                  disabled
                  className="w-full p-2 mt-1 rounded-md bg-gray-100 border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">주소</label>
                <input
                  type="text"
                  value={user.address || ''}
                  disabled
                  className="w-full p-2 mt-1 rounded-md bg-gray-100 border border-gray-200"
                />
              </div>
            </div>
            <div className="text-right mt-4">
              <button className="bg-[#00C7BE] text-white px-4 py-2 rounded-md">수정하기</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-lg font-bold mb-4">회원 정보</div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">비밀번호 변경</div>
                  <div className="text-sm text-gray-500">보안을 위해 정기적으로 변경해주세요</div>
                </div>
                <button className="border border-[#00C7BE] text-[#00C7BE] px-4 py-1 rounded-md">변경하기</button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">회원 탈퇴</div>
                  <div className="text-sm text-gray-500">탈퇴 시 모든 데이터가 삭제됩니다</div>
                </div>
                <button className="border border-red-500 text-red-500 px-4 py-1 rounded-md">탈퇴하기</button>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'rental' && (
        <div>
          <div className="text-lg font-bold mb-4">대여 내역</div>
          <div className="flex gap-2 mb-4">
            <FilterButton label="전체" value="전체" current={rentalFilter} setFilter={setRentalFilter} />
            <FilterButton label="대여중" value="대여중" current={rentalFilter} setFilter={setRentalFilter} />
            <FilterButton label="반납완료" value="반납완료" current={rentalFilter} setFilter={setRentalFilter} />
          </div>
          {filteredRental.map((item) => (
            <RentalCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {tab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-bold">물품 조회 및 수정</div>
            <button className="bg-[#00C7BE] text-white px-4 py-2 rounded-md">새 상품 등록</button>
          </div>
          <div className="flex gap-2 mb-4">
            <FilterButton label="전체" value="전체" current={productFilter} setFilter={setProductFilter} />
            <FilterButton label="대여 가능" value="대여 가능" current={productFilter} setFilter={setProductFilter} />
            <FilterButton label="대여중" value="대여중" current={productFilter} setFilter={setProductFilter} />
          </div>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {editingProductId && (
        <EditProductPage
          productId={editingProductId}
          onClose={() => setEditingProductId(null)}
        />
      )}

      
    </div>
    
  );
};

export default HomePage;
