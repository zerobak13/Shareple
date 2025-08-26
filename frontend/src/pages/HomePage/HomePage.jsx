import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

// --- Mock Data ---
// 실제 애플리케이션에서는 이 데이터들을 API를 통해 받아옵니다. (상세 정보 추가)
const mockTransactions = {
    rentals: [ // 내가 빌린 물품
        { id: 1, product: { name: '전동 드릴', imageUrl: 'https://via.placeholder.com/150.png/09f/fff?text=Drill' }, lender: '공구왕김씨', status: '대여 중', startDate: '2023-10-20', endDate: '2023-10-27' },
        { id: 2, product: { name: '캠핑용 텐트', imageUrl: 'https://via.placeholder.com/150.png/2a2/fff?text=Tent' }, lender: '캠핑고수', status: '반납 완료', startDate: '2023-09-15', endDate: '2023-09-18' },
    ],
    borrows: [ // 내가 빌려준 물품
        { id: 3, product: { name: '닌텐도 스위치', imageUrl: 'https://via.placeholder.com/150.png/f00/fff?text=Switch' }, borrower: '게임좋아', status: '대여 중', startDate: '2023-10-22', endDate: '2023-10-29' },
        { id: 4, product: { name: 'DSLR 카메라', imageUrl: 'https://via.placeholder.com/150.png/00f/fff?text=Camera' }, borrower: '사진작가', status: '반납 완료', startDate: '2023-08-20', endDate: '2023-08-27' },
    ]
};

const mockMyProducts = [
    { id: 1, name: '닌텐도 스위치', description: '동물의 숲 에디션입니다. 조이콘 쏠림 현상 없습니다.', price: 5000, deposit: 50000, imageUrl: 'https://via.placeholder.com/150.png/f00/fff?text=Switch', available: true },
    { id: 2, name: 'DSLR 카메라', description: 'Canon EOS 80D, 기본 렌즈 포함. 사진 입문자에게 좋습니다.', price: 15000, deposit: 100000, imageUrl: 'https://via.placeholder.com/150.png/00f/fff?text=Camera', available: false },
    { id: 3, name: '빔 프로젝터', description: '집에서 영화관 분위기를 느껴보세요. 120인치까지 지원합니다.', price: 8000, deposit: 70000, imageUrl: 'https://via.placeholder.com/150.png/555/fff?text=Projector', available: true },
];

const mockReviews = {
    written: [
        { id: 1, rating: 5, comment: '덕분에 즐거운 캠핑했습니다! 물건 상태가 정말 좋았어요.', product: { name: '캠핑용 텐트', imageUrl: 'https://via.placeholder.com/150.png/2a2/fff?text=Tent', description: '넓고 쾌적한 4인용 텐트입니다.' }, user: { name: '캠핑고수', profileImageUrl: 'https://via.placeholder.com/100.png/2a2/fff?text=User' }, date: '2023-09-20' }
    ],
    received: [
        { id: 2, rating: 4, comment: '친절하게 설명해주셔서 좋았습니다. 다만 반납시간을 조금 늦으셨어요.', product: { name: 'DSLR 카메라', imageUrl: 'https://via.placeholder.com/150.png/00f/fff?text=Camera', description: 'Canon EOS 80D, 기본 렌즈 포함.' }, user: { name: '사진작가', profileImageUrl: 'https://via.placeholder.com/100.png/00f/fff?text=User' }, date: '2023-08-28' }
    ]
};

const mockFaqs = [
    { id: 1, question: '대여는 어떻게 하나요?', answer: '원하는 물품 페이지에서 "대여 요청" 버튼을 누르고, 물품 소유자와 채팅을 통해 상세 일정을 조율하시면 됩니다.' },
    { id: 2, question: '보증금은 언제 돌려받나요?', answer: '물품을 정상적으로 반납하고, 물품 소유자가 반납 확인을 하면 즉시 환불 절차가 시작됩니다. 카드사 영업일 기준 3~5일 소요될 수 있습니다.' },
    { id: 3, question: '물품이 파손되면 어떻게 해야 하나요?', answer: '즉시 물품 소유자에게 채팅으로 알리고, 파손 경위에 대해 설명해야 합니다. 수리비는 보증금에서 차감되거나 추가 비용이 발생할 수 있습니다.' },
    { id: 4, question: '대여 기간을 연장하고 싶어요.', answer: '대여자와 채팅을 통해 연장 가능 여부와 추가 요금을 협의해주세요. 합의가 이루어지면 시스템에서 대여 기간을 수정할 수 있습니다.' },
    { id: 5, question: '리뷰는 어떻게 작성하나요?', answer: '거래가 "반납 완료" 상태로 변경된 후, [거래 내역] 페이지에서 해당 거래에 대한 "리뷰 작성" 버튼이 활성화됩니다.' }
];

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState('profile'); // profile, transactions, manage-products, ...
    const [activeSubSection, setActiveSubSection] = useState(''); // rentals, borrows, written, received, ...
    const [editableProfile, setEditableProfile] = useState(null);
    const [profileImageFile, setProfileImageFile] = useState(null);

    // 각 섹션별 데이터 상태
    const [transactions, setTransactions] = useState({ rentals: [], borrows: [] });
    const [myProducts, setMyProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [reviews, setReviews] = useState({ written: [], received: [] });
    const [openFaqId, setOpenFaqId] = useState(null);
    const [notificationSettings, setNotificationSettings] = useState({ chat: true, reviews: true, marketing: false });
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    const navigate = useNavigate();

    const fetchProfile = useCallback(async () => {
        // Don't show main loader on re-fetch
        if (!profile) {
            setLoading(true);
        }
        try {
            const response = await axios.get('/api/auth/me');
            setProfile(response.data);
            setEditableProfile(response.data); // Initialize editable profile
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setError('프로필 정보를 가져오는 데 실패했습니다. 로그인 상태인지 확인하세요.');
        } finally {
            setLoading(false);
        }
    }, [profile]);

    // --- Mock API Fetch Functions ---
    const fetchTransactions = useCallback(async () => new Promise(resolve => setTimeout(() => resolve(mockTransactions), 300)), []);
    const fetchMyProducts = useCallback(async () => new Promise(resolve => setTimeout(() => resolve(mockMyProducts), 300)), []);
    const fetchReviews = useCallback(async () => new Promise(resolve => setTimeout(() => resolve(mockReviews), 300)), []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // 활성 섹션이 변경될 때마다 해당 섹션의 데이터를 불러옵니다.
    useEffect(() => {
        const loadSectionData = async () => {
            setError(null);
            setLoading(true);
            try {
                if (activeSection === 'transactions') {
                    if (!activeSubSection) setActiveSubSection('rentals'); // 기본 서브섹션 설정
                    const data = await fetchTransactions();
                    setTransactions(data);
                } else if (activeSection === 'manage-products') {
                    const data = await fetchMyProducts();
                    setMyProducts(data);
                    setEditingProduct(null);
                } else if (activeSection === 'reviews') {
                    if (!activeSubSection) setActiveSubSection('received'); // 기본 서브섹션 설정
                    const data = await fetchReviews();
                    setReviews(data);
                } else if (activeSection === 'settings') {
                    if (!activeSubSection) setActiveSubSection('notifications'); // 기본 서브섹션 설정
                }
            } catch (e) {
                setError(`'${activeSection}' 데이터를 불러오는 데 실패했습니다.`);
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        // 'profile'과 'edit-profile'은 fetchProfile로 로딩되므로 제외
        if (!['profile', 'edit-profile'].includes(activeSection)) {
            loadSectionData();
        }
    }, [activeSection, activeSubSection, fetchMyProducts, fetchReviews, fetchTransactions]);

    const handleSectionChange = (section, subSection = '') => {
        setActiveSection(section);
        setActiveSubSection(subSection || (activeSection === section ? activeSubSection : '')); // 같은 섹션 클릭 시 서브섹션 유지
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImageFile(file);
            // Create a preview URL
            const previewUrl = URL.createObjectURL(file);
            setEditableProfile(prev => ({ ...prev, profileImageUrl: previewUrl }));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        if (!editableProfile.email?.trim() || !editableProfile.name?.trim()) {
            alert('이메일과 이름은 필수 항목입니다.');
            return;
        }

        let payload;
        const config = {};

        const profileData = {
            nickname: editableProfile.nickname || '',
            email: editableProfile.email,
            name: editableProfile.name,
            phone: editableProfile.phone || '',
            address: editableProfile.address || '',
        };

        if (profileImageFile) {
            const formData = new FormData();
            formData.append('image', profileImageFile);
            Object.keys(profileData).forEach(key => formData.append(key, profileData[key]));
            payload = formData;
        } else {
            payload = profileData;
            config.headers = { 'Content-Type': 'application/json' };
        }

        try {
            await axios.put('/api/auth/me', payload, config);

            if (editableProfile.profileImageUrl && editableProfile.profileImageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(editableProfile.profileImageUrl);
            }

            await fetchProfile();

            setActiveSection('profile');
            setProfileImageFile(null);
            alert('프로필이 성공적으로 업데이트되었습니다.');
        } catch (err) {
            console.error('Failed to update profile:', err);
            if (err.response) {
                console.error('Server Response:', err.response.data);
            }
            setError('프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
        }
    };

    // 물품 관리 핸들러
    const handleEditProduct = (product) => setEditingProduct(product);
    const handleAddNewProduct = () => setEditingProduct({ name: '', description: '', price: '', deposit: '', imageUrl: '', available: true });
    const handleCancelEdit = () => setEditingProduct(null);
    const handleDeleteProduct = (productId) => {
        if (window.confirm("정말로 이 물품을 삭제하시겠습니까?")) {
            setMyProducts(prev => prev.filter(p => p.id !== productId));
            alert("물품이 삭제되었습니다.");
        }
    };
    const handleSaveProduct = (e) => {
        e.preventDefault();
        const isNew = !editingProduct.id;
        if (isNew) {
            const newProduct = { ...editingProduct, id: Date.now(), imageUrl: 'https://via.placeholder.com/100.png/ccc/fff?text=New' };
            setMyProducts(prev => [newProduct, ...prev]);
            alert("새 물품이 등록되었습니다.");
        } else {
            setMyProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
            alert("물품 정보가 수정되었습니다.");
        }
        setEditingProduct(null);
    };
    const handleProductFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditingProduct(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // 리뷰 모달 핸들러
    const handleOpenReviewModal = (review) => {
        setSelectedReview(review);
        setReviewModalOpen(true);
    };
    const handleCloseReviewModal = () => {
        setReviewModalOpen(false);
    };

    // 설정 핸들러
    const handleNotificationChange = (e) => {
        const { name, checked } = e.target;
        setNotificationSettings(prev => ({ ...prev, [name]: checked }));
    };

    const isSectionLoading = loading && !profile; // 전체 로딩
    const isContentLoading = loading && profile; // 섹션 내용만 로딩

    if (isSectionLoading) {
        return <div className="center-message">로딩 중...</div>;
    }

    if (error) {
        return <div className="center-message error-message">{error}</div>;
    }

    if (!profile) {
        return <div className="center-message">로그인되지 않았습니다.</div>;
    }

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ color: i < rating ? '#FFD700' : '#ccc' }}>⭐</span>
        ));
    };

    const getStatusChip = (status) => {
        const style = status === '대여 중' ? { backgroundColor: '#4CAF50', color: 'white' } :
                      status === '반납 완료' ? { backgroundColor: '#007BFF', color: 'white' } : {};
        return <span className="status-chip" style={style}>{status}</span>;
    };

    const renderReviewDetailModal = () => {
        if (!isReviewModalOpen || !selectedReview) return null;

        return (
            <div className="modal-overlay" onClick={handleCloseReviewModal}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <button className="modal-close-button" onClick={handleCloseReviewModal}>&times;</button>
                    <h3>물품 및 대여자 정보</h3>
                    <div className="review-modal-body">
                        <div className="review-modal-product">
                            <h4>물품 정보</h4>
                            <img src={selectedReview.product.imageUrl} alt={selectedReview.product.name} />
                            <p><strong>{selectedReview.product.name}</strong></p>
                            <p>{selectedReview.product.description}</p>
                        </div>
                        <div className="review-modal-user">
                            <h4>{activeSubSection === 'written' ? '대여해준 분' : '빌려가신 분'}</h4>
                            <img src={selectedReview.user.profileImageUrl} alt={selectedReview.user.name} className="profile-image-small" />
                            <p><strong>{selectedReview.user.name}</strong></p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="profile-details-card">
                        <h3>내 프로필 정보</h3>
                        <img
                            src={profile.profileImageUrl ? `http://localhost:8080${profile.profileImageUrl}` : '/default-profile.png'}
                            onError={(e) => e.target.src = '/default-profile.png'}
                            alt="프로필"
                            className="profile-image-display"
                        />
                        <p><strong>ID:</strong> {profile.id}</p>
                        <p><strong>카카오ID:</strong> {profile.kakaoId}</p>
                        <p><strong>별명:</strong> {profile.nickname}</p>
                        <p><strong>이메일:</strong> {profile.email || '없음'}</p>
                        <p><strong>이름:</strong> {profile.name || '없음'}</p>
                        <p><strong>전화번호:</strong> {profile.phone || '없음'}</p>
                        <p><strong>주소:</strong> {profile.address || '없음'}</p>
                        <button onClick={() => {
                            setActiveSection('edit-profile');
                            setEditableProfile({ ...profile });
                        }} className="action-button primary">
                            개인정보 수정
                        </button>
                    </div>
                );
            case 'edit-profile':
                if (!editableProfile) {
                    return <div className="center-message">정보를 불러오는 중...</div>;
                }
                return ( // 개인정보 수정 폼
                    <div className="section-content">
                        <h3>개인정보 수정 ⚙️</h3>
                        <form onSubmit={handleUpdateProfile} className="profile-edit-form">
                            <div className="form-group profile-image-edit">
                                <label htmlFor="profile-image-upload">
                                    <img
                                        src={editableProfile.profileImageUrl ? (editableProfile.profileImageUrl.startsWith('blob:') ? editableProfile.profileImageUrl : `http://localhost:8080${editableProfile.profileImageUrl}`) : '/default-profile.png'}
                                        onError={(e) => e.target.src = '/default-profile.png'}
                                        alt="프로필"
                                        className="profile-image-display"
                                    />
                                    <div className="image-upload-overlay">
                                        <span>사진 변경</span>
                                    </div>
                                </label>
                                <input
                                    id="profile-image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                            <div className="form-group">
                                <label>ID:</label>
                                <p>{editableProfile.id}</p>
                            </div>
                            <div className="form-group">
                                <label>카카오ID:</label>
                                <p>{editableProfile.kakaoId}</p>
                            </div>
                            <div className="form-group">
                                <label htmlFor="nickname">별명:</label>
                                <input
                                    type="text"
                                    id="nickname"
                                    name="nickname"
                                    value={editableProfile.nickname}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">이메일:</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={editableProfile.email || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="name">이름:</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={editableProfile.name || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">전화번호:</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={editableProfile.phone || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="address">주소:</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={editableProfile.address || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="action-button primary">수정 완료</button>
                                <button type="button" onClick={() => {
                                    setActiveSection('profile');
                                    setProfileImageFile(null); // Reset file on cancel
                                    if (editableProfile.profileImageUrl && editableProfile.profileImageUrl.startsWith('blob:')) {
                                        URL.revokeObjectURL(editableProfile.profileImageUrl);
                                    }
                                }} className="action-button secondary">
                                    취소
                                </button>
                            </div>
                        </form>
                    </div>
                );
            case 'transactions':
                return ( // 거래 내역
                    <div className="section-content">
                        <h3>거래 내역 📝</h3>
                        {isContentLoading ? <div className="center-message">거래 내역 로딩 중...</div> : (
                            <>
                                {activeSubSection === 'rentals' && (
                                    <div className="transaction-section">
                                        <h4>내가 빌린 물품</h4>
                                        {transactions.rentals.length > 0 ? transactions.rentals.map(item => (
                                            <div key={item.id} className="list-item-card">
                                                <img src={item.product.imageUrl} alt={item.product.name} className="item-image" />
                                                <div className="item-details">
                                                    <p><strong>{item.product.name}</strong> (대여처: {item.lender})</p>
                                                    <p>대여 기간: {item.startDate} ~ {item.endDate}</p>
                                                    <p>상태: {getStatusChip(item.status)}</p>
                                                </div>
                                                <div className="item-actions">
                                                    {item.status === '대여 중' && <button className="action-button small">반납 요청</button>}
                                                    {item.status === '반납 완료' && <button className="action-button small success">리뷰 작성</button>}
                                                    <button className="action-button small secondary">채팅 확인</button>
                                                </div>
                                            </div>
                                        )) : <p>아직 빌린 물품이 없습니다.</p>}
                                    </div>
                                )}
                                {activeSubSection === 'borrows' && (
                                    <div className="transaction-section">
                                        <h4>내가 빌려준 물품</h4>
                                        {transactions.borrows.length > 0 ? transactions.borrows.map(item => (
                                            <div key={item.id} className="list-item-card">
                                                <img src={item.product.imageUrl} alt={item.product.name} className="item-image" />
                                                <div className="item-details">
                                                    <p><strong>{item.product.name}</strong> (대여자: {item.borrower})</p>
                                                    <p>대여 기간: {item.startDate} ~ {item.endDate}</p>
                                                    <p>상태: {getStatusChip(item.status)}</p>
                                                </div>
                                                <div className="item-actions">
                                                    {item.status === '대여 중' && <button className="action-button small">반납 확인</button>}
                                                    <button className="action-button small secondary">채팅 확인</button>
                                                </div>
                                            </div>
                                        )) : <p>아직 빌려준 물품이 없습니다.</p>}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );
            case 'manage-products':
                if (editingProduct) { // 물품 수정 또는 추가 폼
                    return (
                        <div className="section-content">
                            <h3>{editingProduct.id ? '물품 정보 수정' : '새 물품 등록'}</h3>
                            <form onSubmit={handleSaveProduct} className="profile-edit-form">
                                <div className="form-group">
                                    <label htmlFor="name">물품명:</label>
                                    <input type="text" id="name" name="name" value={editingProduct.name} onChange={handleProductFormChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description">상세 설명:</label>
                                    <textarea id="description" name="description" value={editingProduct.description} onChange={handleProductFormChange} rows="4" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="price">대여료 (원/일):</label>
                                    <input type="number" id="price" name="price" value={editingProduct.price} onChange={handleProductFormChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="deposit">보증금 (원):</label>
                                    <input type="number" id="deposit" name="deposit" value={editingProduct.deposit} onChange={handleProductFormChange} required />
                                </div>
                                <div className="form-group">
                                    <label>
                                        <input type="checkbox" name="available" checked={editingProduct.available} onChange={handleProductFormChange} />
                                        현재 대여 가능
                                    </label>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="action-button primary">저장</button>
                                    <button type="button" onClick={handleCancelEdit} className="action-button secondary">취소</button>
                                </div>
                            </form>
                        </div>
                    );
                }
                return ( // 물품 목록
                    <div className="section-content">
                        <h3>물품 조회 및 수정 🧺</h3>
                        <div className="section-header">
                            <p>내가 등록한 물품들을 관리할 수 있습니다.</p>
                            <button className="action-button primary" onClick={handleAddNewProduct}>+ 새 물품 등록</button>
                        </div>
                        {isContentLoading ? <div className="center-message">물품 목록 로딩 중...</div> : (
                            myProducts.length > 0 ? myProducts.map(product => (
                                <div key={product.id} className="list-item-card">
                                    <img src={product.imageUrl} alt={product.name} className="item-image" />
                                    <div className="item-details">
                                        <p><strong>{product.name}</strong></p>
                                        <p>{product.description}</p>
                                        <p>상태: {product.available ? <span className="status-chip" style={{backgroundColor: '#4CAF50', color: 'white'}}>대여 가능</span> : <span className="status-chip" style={{backgroundColor: '#f44336', color: 'white'}}>대여 중</span>}</p>
                                    </div>
                                    <div className="item-actions">
                                        <button className="action-button small" onClick={() => handleEditProduct(product)}>✏️ 수정</button>
                                        <button className="action-button small danger" onClick={() => handleDeleteProduct(product.id)}>🗑️ 삭제</button>
                                    </div>
                                </div>
                            )) : <p>아직 등록한 물품이 없습니다.</p>
                        )}
                    </div>
                );
            case 'reviews':
                return ( // 리뷰 내역
                    <div className="section-content">
                        <h3>리뷰 내역 확인 ⭐</h3>
                        {isContentLoading ? <div className="center-message">리뷰 내역 로딩 중...</div> : (
                            <>
                                {activeSubSection === 'received' && (
                                    <div className="review-section">
                                        <h4>내가 받은 리뷰</h4>
                                        {reviews.received.length > 0 ? reviews.received.map(review => (
                                            <div key={review.id} className="list-item-card review-card">
                                                <div className="review-header">
                                                    <button className="review-product-name" onClick={() => handleOpenReviewModal(review)}>
                                                        <strong>{review.product.name}</strong>
                                                    </button>
                                                    <span className="review-author">작성자: {review.user.name}</span>
                                                    <span className="review-date">{review.date}</span>
                                                </div>
                                                <div className="review-body">
                                                    <p className="review-rating">{renderStars(review.rating)}</p>
                                                    <p className="review-comment">"{review.comment}"</p>
                                                </div>
                                            </div>
                                        )) : <p className="empty-list-message">아직 받은 리뷰가 없습니다.</p>}
                                    </div>
                                )}
                                {activeSubSection === 'written' && (
                                    <div className="review-section">
                                        <h4>내가 작성한 리뷰</h4>
                                        {reviews.written.length > 0 ? reviews.written.map(review => (
                                            <div key={review.id} className="list-item-card review-card">
                                                <div className="review-header">
                                                    <button className="review-product-name" onClick={() => handleOpenReviewModal(review)}>
                                                        <strong>{review.product.name}</strong>
                                                    </button>
                                                    <span className="review-author">대여자: {review.user.name}</span>
                                                    <span className="review-date">{review.date}</span>
                                                </div>
                                                <div className="review-body">
                                                    <p className="review-rating">{renderStars(review.rating)}</p>
                                                    <p className="review-comment">"{review.comment}"</p>
                                                </div>
                                            </div>
                                        )) : <p className="empty-list-message">아직 작성한 리뷰가 없습니다.</p>}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );
            case 'customer-support':
                return ( // 고객 지원
                    <div className="section-content">
                        <h3>고객 지원 헬프 🤝</h3>
                        <div className="faq-section">
                            <h4>자주 묻는 질문 (FAQ)</h4>
                            {mockFaqs.map(faq => (
                                <div key={faq.id} className="faq-item">
                                    <button className="faq-question" onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}>
                                        <span>Q. {faq.question}</span>
                                        <span>{openFaqId === faq.id ? '▲' : '▼'}</span>
                                    </button>
                                    {openFaqId === faq.id && <div className="faq-answer"><p>A. {faq.answer}</p></div>}
                                </div>
                            ))}
                        </div>
                        <div className="support-actions">
                            <p>원하는 답변을 찾지 못하셨나요?</p>
                            <button className="action-button primary">1:1 문의하기</button>
                        </div>
                    </div>
                );
            case 'settings':
                return ( // 설정
                    <div className="section-content">
                        <h3>설정 ⚙️</h3>
                        <div className="settings-group">
                            <h4>알림 설정</h4>
                            <ul className="settings-list">
                                <li className="setting-item">
                                    <span>채팅 메시지 알림</span>
                                    <label className="switch"><input type="checkbox" name="chat" checked={notificationSettings.chat} onChange={handleNotificationChange} /><span className="slider round"></span></label>
                                </li>
                                <li className="setting-item">
                                    <span>리뷰 등록 알림</span>
                                    <label className="switch"><input type="checkbox" name="reviews" checked={notificationSettings.reviews} onChange={handleNotificationChange} /><span className="slider round"></span></label>
                                </li>
                                <li className="setting-item">
                                    <span>이벤트 및 마케팅 정보 수신 동의</span>
                                    <label className="switch"><input type="checkbox" name="marketing" checked={notificationSettings.marketing} onChange={handleNotificationChange} /><span className="slider round"></span></label>
                                </li>
                            </ul>
                        </div>
                        <div className="settings-group">
                            <h4>계정 관리</h4>
                            <ul className="settings-list">
                                <li><button className="action-button danger" onClick={() => { if (window.confirm('로그아웃 하시겠습니까?')) navigate('/logout'); }}>로그아웃</button></li>
                                <li><button className="action-button danger" onClick={() => { if (window.confirm('정말로 회원 탈퇴를 하시겠습니까? 모든 정보가 삭제됩니다.')) console.log('회원 탈퇴 처리'); }}>회원 탈퇴</button></li>
                            </ul>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <style>{`
                /* General UI Improvements */
                .mypage-sidebar button { transition: background-color 0.2s, color 0.2s; }
                .section-content h3 { margin-bottom: 24px; font-size: 1.75rem; border-bottom: 1px solid #eee; padding-bottom: 12px; }
                .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .empty-list-message { color: #888; text-align: center; padding: 40px 0; }

                /* Sidebar Sub-menu */
                .sidebar-submenu { list-style: none; padding-left: 25px; margin: 8px 0; }
                .sidebar-submenu button { font-size: 0.9rem; color: #555; background: none; border: none; padding: 8px 12px; width: 100%; text-align: left; border-radius: 4px; }
                .sidebar-submenu button.active { color: var(--primary-color); font-weight: bold; background-color: #eef4ff; }
                .sidebar-submenu button:hover { background-color: #f4f4f4; }

                /* Unified Form Styles */
                .form-card { background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
                .form-input { width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; box-sizing: border-box; transition: border-color 0.2s; }
                .form-input:focus { border-color: var(--primary-color); outline: none; }
                textarea.form-input { resize: vertical; min-height: 100px; }
                .checkbox-label { display: flex; align-items: center; gap: 8px; }

                /* List Item Card (Transactions, Products) */
                .list-item-card { display: flex; align-items: center; gap: 20px; background: #fff; padding: 16px; border-radius: 8px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
                .item-image { width: 100px; height: 100px; object-fit: cover; border-radius: 8px; }
                .item-details { flex-grow: 1; }
                .item-name { font-size: 1.1rem; margin-bottom: 8px; }
                .item-meta { font-size: 0.9rem; color: #666; margin: 4px 0; }
                .item-status-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; min-width: 120px; }
                .item-actions { display: flex; gap: 8px; margin-top: 8px; }

                /* Review Section */
                .review-card { flex-direction: column; align-items: stretch; }
                .review-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
                .review-product-name { background: none; border: none; padding: 0; font-size: 1.1rem; cursor: pointer; color: var(--primary-color); text-decoration: underline; }
                .review-author { color: #555; }
                .review-date { font-size: 0.85rem; color: #888; margin-left: auto; }
                .review-body { border-top: 1px solid #eee; padding-top: 12px; }
                .review-rating { margin-bottom: 8px; }
                .review-comment { font-style: italic; color: #333; }

                /* Review Modal */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
                .modal-content { background: #fff; padding: 24px; border-radius: 8px; width: 90%; max-width: 500px; position: relative; }
                .modal-close-button { position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 1.5rem; cursor: pointer; }
                .review-modal-body { display: flex; gap: 20px; margin-top: 16px; }
                .review-modal-product, .review-modal-user { flex: 1; text-align: center; }
                .review-modal-body img { max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 10px; }
                .profile-image-small { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; }

                /* Customer Support (FAQ) */
                .faq-section { margin-bottom: 30px; }
                .faq-item { border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 10px; overflow: hidden; }
                .faq-question { display: flex; align-items: center; width: 100%; text-align: left; background: #fff; padding: 16px; border: none; cursor: pointer; font-size: 1rem; font-weight: 600; }
                .faq-question:hover { background: #f9f9f9; }
                .faq-q-icon { color: var(--primary-color); margin-right: 12px; }
                .faq-q-text { flex-grow: 1; }
                .faq-q-arrow { font-size: 0.8rem; }
                .faq-answer { background: #f7f9fc; padding: 16px; color: #333; }
                .support-actions { text-align: center; }

                /* Settings Section */
                .settings-layout { display: flex; gap: 30px; }
                .settings-sidebar { flex-basis: 200px; flex-shrink: 0; }
                .settings-menu-item { display: block; width: 100%; padding: 12px 16px; border: 1px solid #ddd; background: #fff; border-radius: 6px; margin-bottom: 10px; text-align: left; cursor: pointer; }
                .settings-menu-item.active { background: var(--primary-color); color: #fff; border-color: var(--primary-color); font-weight: bold; }
                .settings-main-content { flex-grow: 1; }
                .settings-group h4 { font-size: 1.2rem; margin-bottom: 16px; }
                .setting-item { justify-content: space-between; }
                .setting-item-action { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee; }
                .account-actions-footer { margin-top: 30px; display: flex; gap: 10px; border-top: 1px solid #eee; padding-top: 20px; }
            `}</style>
            {renderReviewDetailModal()}
            <div className="mypage-container">
            <h1 className="mypage-title">마이페이지</h1>
            <div className="mypage-layout">
                <nav className="mypage-sidebar">
                    <ul>
                        <li>
                            <button className={activeSection === 'profile' || activeSection === 'edit-profile' ? 'active' : ''} onClick={() => handleSectionChange('profile')}>
                                👤 개인정보
                            </button>
                        </li>
                        <li>
                            <button className={activeSection === 'transactions' ? 'active' : ''} onClick={() => handleSectionChange('transactions', 'rentals')}>
                                📜 거래 내역
                            </button>
                            {activeSection === 'transactions' && (
                                <ul className="sidebar-submenu">
                                    <li><button className={activeSubSection === 'rentals' ? 'active' : ''} onClick={() => setActiveSubSection('rentals')}>내가 빌린 물품</button></li>
                                    <li><button className={activeSubSection === 'borrows' ? 'active' : ''} onClick={() => setActiveSubSection('borrows')}>내가 빌려준 물품</button></li>
                                </ul>
                            )}
                        </li>
                        <li>
                            <button className={activeSection === 'manage-products' ? 'active' : ''} onClick={() => handleSectionChange('manage-products')}>
                                🧺 물품 관리
                            </button>
                        </li>
                        <li>
                            <button className={activeSection === 'reviews' ? 'active' : ''} onClick={() => handleSectionChange('reviews', 'received')}>
                                ⭐ 리뷰 내역
                            </button>
                            {activeSection === 'reviews' && (
                                <ul className="sidebar-submenu">
                                    <li><button className={activeSubSection === 'received' ? 'active' : ''} onClick={() => setActiveSubSection('received')}>내가 받은 리뷰</button></li>
                                    <li><button className={activeSubSection === 'written' ? 'active' : ''} onClick={() => setActiveSubSection('written')}>내가 작성한 리뷰</button></li>
                                </ul>
                            )}
                        </li>
                        <li>
                            <button className={activeSection === 'customer-support' ? 'active' : ''} onClick={() => handleSectionChange('customer-support')}>
                                🤝 고객 지원
                            </button>
                        </li>
                        <li>
                            <button className={activeSection === 'settings' ? 'active' : ''} onClick={() => handleSectionChange('settings', 'notifications')}>
                                ⚙️ 설정
                            </button>
                            {activeSection === 'settings' && (
                                <ul className="sidebar-submenu">
                                    <li><button className={activeSubSection === 'notifications' ? 'active' : ''} onClick={() => setActiveSubSection('notifications')}>알림 설정</button></li>
                                    <li><button className={activeSubSection === 'account' ? 'active' : ''} onClick={() => setActiveSubSection('account')}>계정 관리</button></li>
                                </ul>
                            )}
                        </li>
                    </ul>
                </nav>
                <main className="mypage-content">
                    {renderSection()}
                </main>
            </div>
        </div>
        </>
    );
};

export default ProfilePage;