import '../styling/login.css';
import logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Login() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    password: password
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || 'Login failed');
                return;
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            navigate('/user');
        } catch (err) {
            setError('Something went wrong...');
        }
    };

    return (
        <section className='page-background'>
            <section className='login-app-wrapper'>
                <img className='logo-large' src={logo} alt="logo" />
                <h1 className='logo-header'>What a flick?!</h1>
                <p className='header-subtext'>Just another movie rating website.</p>

                <section className='login-section'>
                    <p className='username-input-header'>Username:</p>
                    <input
                        className='username-input'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder='TheMovieRater01'
                    />

                    <p className='password-input-header'>Password:</p>
                    <input
                        className='password-input'
                        type='password'
                        value={password}
                        placeholder='AVerySecurePassword123!'
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button className='login-button' onClick={handleLogin}>Login</button>

                    {error && <p className="login-error">{error}</p>}

                    <p className='register-text'>
                        Don't have an account? <Link to="/register">Register now!</Link>
                    </p>
                </section>
            </section>
        </section>
    );
}

export default Login;
