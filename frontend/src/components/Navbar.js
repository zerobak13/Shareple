import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axiosInstance';

const Navbar = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await axios.get('/api/auth/me');
                setUser(response.data);
            } catch (err) {
                setUser(null);
            }
        };
        fetchCurrentUser();
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout');
        } catch (err) {
            console.error(err);
        } finally {
            setUser(null);
            window.location.href = '/login';
        }
    };

    return (
        <nav style={{
            padding: '1rem 2rem',
            background: '#f0f0f0',
            display: 'flex',
            justifyContent: 'flex-start',
            gap: '2rem',
            borderBottom: '1px solid #ccc',
            marginBottom: '2rem',
        }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>Main</Link>
            {!user && <Link to="/login" style={{ textDecoration: 'none', color: '#333' }}>Login</Link>}
            {user && (
                <>
                    <Link to="/profile" style={{ textDecoration: 'none', color: '#333' }}>
                        {user.nickname || user.email}
                    </Link>
                    <Link to="/product/register" style={{ textDecoration: 'none', color: '#333' }}>
                        물품 등록
                    </Link>
                    <button onClick={handleLogout}>Logout</button>
                </>
            )}
        </nav>
    );
};

export default Navbar;
