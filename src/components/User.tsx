import '../styling/user.css';
import Header from './Header';
import { CiStar } from "react-icons/ci";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTMDbPoster } from '../utils/fetchTMDbPoster';
import { FaTrashCan } from "react-icons/fa6";

type MovieInfo = {
    title: string;
    director: string;
    releaseYear: number;
};

type Review = {
    _id: string;
    movieId: MovieInfo;
    rating: number;
    comment: string;
    createdAt: string;
};

type EnrichedReview = Review & {
    posterUrl: string | null;
};

type UserInfo = {
    name: string;
    email: string;
};

function User() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [reviews, setReviews] = useState<EnrichedReview[]>([]);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleDeleteAccount = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const confirmed = window.confirm("Are you sure you want to delete your account? This action is permanent.");
        if (!confirmed) return;

        try {
            const res = await fetch('http://localhost:3000/user', {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.message || 'Failed to delete account.');
                return;
            }

            localStorage.removeItem('token');
            navigate('/register');
        } catch {
            setError('Something went wrong.');
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        

        try {
            const res = await fetch(`http://localhost:3000/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.message || 'Failed to delete review.');
                return;
            }

            setReviews(prev => prev.filter(r => r._id !== reviewId));
        } catch {
            setError('Something went wrong deleting the review.');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Unauthorized');
            return;
        }

        // Fetch user profile
        fetch('http://localhost:3000/user', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => setUserInfo({ name: data.name, email: data.email }))
            .catch(() => setError('Failed to fetch user profile'));

        // Fetch reviews + posters
        fetch('http://localhost:3000/user/review', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(async (data: Review[]) => {
                const enriched = await Promise.all(
                    data.map(async review => {
                        const posterUrl = await fetchTMDbPoster(review.movieId.title);
                        return { ...review, posterUrl };
                    })
                );
                setReviews(enriched);
            })
            .catch(() => setError('No reviews made yet!'));
    }, []);

    return (
        <section className='page-background'>
            <section className='user-app-wrapper'>
                <Header />

                <button className='remove-user-button' onClick={handleLogout}>LOGOUT</button>
                <button className='logout-user-button' onClick={handleDeleteAccount}>DELETE ACCOUNT</button>

                <div className='user-icon'>
                    {userInfo ? userInfo.name[0].toUpperCase() : 'U'}
                </div>

                <section className='user-information-section'>
                    <p className='user-name user-information'>{userInfo?.name}</p>
                    <p className='user-mail user-information'>{userInfo?.email}</p>
                </section>

                <p className='reviews-section-header'>Recent ratings</p>

                <section className='user-reviews-section'>
                    {reviews.map(review => (
                        <section className='user-review' key={review._id}>
                            <FaTrashCan
                                className='remove-user-review-button'
                                onClick={() => handleDeleteReview(review._id)}
                                title="Delete review"
                            />
                            <p className='review-movie-name'>{review.movieId.title}</p>
                            <section className='review-movie-rating-container'>
                                <p className='review-movie-rating-number'>{review.rating}</p>
                                <CiStar className='review-movie-rating' />
                            </section>
                            <p className='review-made-date'>
                                {new Date(review.createdAt).toISOString().slice(0, 10)}
                            </p>
                            <img
                                className='movie-poster-background'
                                src={review.posterUrl || "/fallback-poster.png"}
                                alt={review.movieId.title}
                            />
                        </section>
                    ))}
                </section>

                {error && <p className='error-message'>{error}</p>}
            </section>
        </section>
    );
}

export default User;
