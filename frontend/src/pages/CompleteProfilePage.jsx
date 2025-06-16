import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CompleteProfilePage() {
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({
        email: '',
        name: '',
        phone: '',
        address: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/auth/me', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                setUser(data);
            });
    }, []);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...user,
                    ...form,
                }),
            });

            alert('정보가 저장되었습니다!');
            navigate('/Main');//*********
        } catch (error) {
            console.error('정보 저장 중 오류 발생:', error);
            alert('정보 저장에 실패했습니다.');
        }
    };


    if (!user) return <div>로딩 중...</div>;

    return (
        <div>
            <h2>추가 정보 입력</h2>
            <input name="email" placeholder="이메일" onChange={handleChange} />
            <input name="name" placeholder="이름" onChange={handleChange} />
            <input name="phone" placeholder="전화번호" onChange={handleChange} />
            <input name="address" placeholder="주소" onChange={handleChange} />
            <button onClick={handleSubmit}>제출</button>
        </div>
    );
}

export default CompleteProfilePage;
