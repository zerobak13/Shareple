import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CompleteProfilePage() {
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({
        nickname: '', // 사용자가 입력하는 별명
        phone: '',
        address: '',
        profileImageUrl: '',
        email: ''
    });
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    // 사용자 정보 로드
    useEffect(() => {
        fetch('/api/auth/me', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                setUser(data);
                setForm({
                    nickname: data.nickname || '',      // 사용자가 수정할 별명
                    phone: data.phone || '',
                    address: data.address || '',
                    profileImageUrl: data.profileImageUrl || '',
                    email: data.email || ''
                });
            });
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async () => {
        try {
            let imageUrl = form.profileImageUrl;

            if (file) {
                const formData = new FormData();
                formData.append('image', file);

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                imageUrl = await res.text();
            }

            await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nickname: form.nickname,
                    email: form.email,
                    name: user.name, // 카카오에서 받은 이름은 그대로 유지
                    phone: form.phone,
                    address: form.address,
                    profileImageUrl: imageUrl,
                }),
            });

            alert('정보가 저장되었습니다!');
            navigate('/main');
        } catch (error) {
            console.error('정보 저장 중 오류:', error);
            alert('저장 실패');
        }
    };

    if (!user) return <div>로딩 중...</div>;

    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
            <h2>추가 정보 입력</h2>

            <div>카카오 이름: {user.name}</div>
            <div>현재 별명: {form.nickname}</div>

            <input
                name="nickname"
                placeholder="별명 (닉네임)"
                value={form.nickname}
                onChange={handleChange}
            /><br />

            <input
                name="email"
                placeholder="이메일"
                value={form.email}
                onChange={handleChange}
            /><br />

            <input
                name="phone"
                placeholder="전화번호"
                value={form.phone}
                onChange={handleChange}
            /><br />

            <input
                name="address"
                placeholder="주소"
                value={form.address}
                onChange={handleChange}
            /><br />

            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
            /><br />

            <button onClick={handleSubmit}>제출</button>
        </div>
    );
}

export default CompleteProfilePage;
