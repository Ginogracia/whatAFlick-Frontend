import '../styling/register.css';
import logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async () => {
        try {
            // Step 1: Register the user
            const registerResponse = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            if (!registerResponse.ok) {
                const errorData = await registerResponse.json();
                setError(errorData.message || 'Registration failed');
                return;
            }

            // Step 2: Auto-login
            const loginResponse = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password }),
            });

            if (!loginResponse.ok) {
                const errorData = await loginResponse.json();
                setError(errorData.message || 'Login after registration failed');
                return;
            }

            const loginData = await loginResponse.json();
            localStorage.setItem('token', loginData.token);

            // Step 3: Navigate to /user
            navigate('/user');
        } catch (err) {
            setError('Something went wrong. Try again later.');
        }
    };

    return (
        <section className='page-background'>
            <section className='register-app-wrapper'>
                <img className='logo-large' src={logo} alt="logo" />
                <h1 className='logo-header'>Register now?!</h1>

                <section className='register-section'>
                    <p className='username-input-header'>Username:</p>
                    <input
                        className='username-input'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <p className='mail-input-header'>Mail:</p>
                    <input
                        className='mail-input'
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <p className='password-input-header'>Password:</p>
                    <input
                        className='password-input'
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button className='register-button' onClick={handleRegister}>Register</button>

                    {error && <p className="register-error">{error}</p>}

                    <p className='login-text'>
                        Already have an account? <Link to="/login">Login now!</Link>
                    </p>
                </section>
            </section>
        </section>
    );
}

export default Register;
