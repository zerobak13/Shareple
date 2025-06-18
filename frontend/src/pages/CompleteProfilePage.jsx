import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CompleteProfilePage() {
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({
        email: '',
        name: '',
        phone: '',
        address: '',
        profileImageUrl: ''
    });
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/auth/me', { credentials: 'include' })
            .then(res => res.json())
            .then(data => setUser(data));
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async () => {
        try {
            let imageUrl = '';

            if (file) {
                const formData = new FormData();
                formData.append('image', file);

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                const path = await res.text();
                imageUrl = path;
            }

            await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...user,
                    ...form,
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
            <input name="email" placeholder="이메일" onChange={handleChange} /><br/>
            <input name="name" placeholder="이름" onChange={handleChange} /><br/>
            <input name="phone" placeholder="전화번호" onChange={handleChange} /><br/>
            <input name="address" placeholder="주소" onChange={handleChange} /><br/>
            <input type="file" accept="image/*" onChange={handleFileChange} /><br/>
            <button onClick={handleSubmit}>제출</button>
        </div>
    );
}

export default CompleteProfilePage;
