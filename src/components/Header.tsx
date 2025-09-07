import '../styling/header.css';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Header() {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [adminDenied, setAdminDenied] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) return;

            try {
                const res = await fetch("http://localhost:3000/user", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setUserRole(data.role); // "Admin" or "Rater"
                }
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };

        fetchUser();
    }, [token]);

    const handleAdminClick = () => {
        if (userRole === "Admin") {
            navigate("/admin");
        } else {
            setAdminDenied(true);
        }
    };

    return (
        <section className='header-container'>
            <button
                className={`nav-admin-button ${adminDenied ? "denied" : ""}`}
                onClick={handleAdminClick}
            >
                Admin
            </button>

            <img className='header-logo' src={logo} onClick={() => navigate('/movies')} />

            <button className='nav-user-button' onClick={() => navigate('/user')}>
                User
            </button>
        </section>
    );
}

export default Header;
