import { useState, useEffect } from "react";
import "../styling/movies.css";
import Header from "./Header";
import { FaStar } from "react-icons/fa6";
import { TbArrowBack } from "react-icons/tb";
import { IoMdSend } from "react-icons/io";
import { fetchTMDbPoster } from "../utils/fetchTMDbPoster";

type Movie = {
  _id: string;
  title: string;
  director: string[];
  releaseYear: number;
  genre: string[];
};

type Review = {
  userId: { _id: string };
  rating: number;
  comment: string;
  createdAt: string;
};

function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payloadBase64 = token.split(".")[1];
    const payload = JSON.parse(atob(payloadBase64));
    return payload.userId;
  } catch {
    return null;
  }
}

function Movies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [posters, setPosters] = useState<Record<string, string>>({});
  const [inspecting, setInspecting] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState("");
  const [userComment, setUserComment] = useState("");
  const [averageRatings, setAverageRatings] = useState<Record<string, number>>({});
  const [usernames, setUsernames] = useState<Record<string, string>>({});

  const token = localStorage.getItem("token");
  const userId = getUserIdFromToken(token);

  useEffect(() => {
    const loadMovies = async () => {
      const res = await fetch("http://localhost:3000/movies");
      const data = await res.json();
      setMovies(data);

      const posterMap: Record<string, string> = {};
      const ratingMap: Record<string, number> = {};

      for (const movie of data) {
        const [poster, reviewRes] = await Promise.all([
          fetchTMDbPoster(movie.title),
          fetch(`http://localhost:3000/movies/${movie._id}/reviews`)
        ]);

        const reviews = await reviewRes.json();
        const total = reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
        const avg = reviews.length ? total / reviews.length : 0;

        if (poster) posterMap[movie._id] = poster;
        ratingMap[movie._id] = avg;
      }

      setPosters(posterMap);
      setAverageRatings(ratingMap);
    };

    loadMovies();
  }, []);

const handleMovieClick = async (movie: Movie) => {
  setSelectedMovie(movie);
  setInspecting(true);

  const res = await fetch(`http://localhost:3000/movies/${movie._id}/reviews`);
  const reviewData: Review[] = await res.json();
  setReviews(reviewData);

  const ids: string[] = [...new Set(reviewData.map((r) => r.userId._id))];
  const nameMap: Record<string, string> = {};

  await Promise.all(
    ids.map(async (id) => {
      try {
        const res = await fetch(`http://localhost:3000/user/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data: { name: string } = await res.json();
          nameMap[id] = data.name;
          console.log(`User ${id} → ${data.name}`);
        } else {
          console.warn(`Could not fetch username for ${id}: ${res.status}`);
        }
      } catch (err) {
        console.error(`Error fetching username for ${id}:`, err);
      }
    })
  );

  setUsernames(nameMap);
};



  const handleBackClick = () => {
    setInspecting(false);
    setSelectedMovie(null);
    setReviews([]);
    setUserRating("");
    setUserComment("");
    setUsernames({});
  };

  const handleReviewSubmit = async () => {
    if (!userRating || !userComment || !selectedMovie || !token) return;

    const res = await fetch("http://localhost:3000/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        movieId: selectedMovie._id,
        rating: parseFloat(userRating),
        comment: userComment
      })
    });

    if (res.status === 201) {
      const newReview = await res.json();
      setReviews((prev) => [...prev, newReview]);
      setUserRating("");
      setUserComment("");

      setUsernames((prev) => ({
        ...prev,
        [newReview.userId._id]: "You"
      }));

    } else if (res.status === 409) {
      alert("You already submitted a review for this movie.");
    } else {
      alert("Something went wrong when submitting the review.");
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return "-";
    const total = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const userReviewExists = reviews.some((r) => r.userId._id === userId);

  return (
    <section className='page-background'>
      <section className='movies-app-wrapper'>
        <Header />

        {!inspecting && (
          <section className='main-content-container'>
            <h2 className='movies-container-header'>Movies</h2>

            <section className='movies-container'>
              {movies.map((movie) => (
                <section key={movie._id} className='movie' onClick={() => handleMovieClick(movie)}>
                  <img
                    className='movie-poster'
                    src={posters[movie._id]}
                    alt={`${movie.title} poster`}
                  />
                  <section className='movie-rating-section'>
                    <FaStar className='movie-rating-star' />
                    <p className='movie-rating-amount'>
                      {averageRatings[movie._id]?.toFixed(1) || "–"}
                    </p>
                  </section>
                  <section className='movie-information'>
                    <p className='movie-title'>{movie.title}</p>
                  </section>
                </section>
              ))}
            </section>
          </section>
        )}

        {inspecting && selectedMovie && (
          <section className='inspected-movie-overlay'>
            <section className='inspected-movie-poster-container'>
              <img
                className='inspected-movie-poster'
                src={posters[selectedMovie._id]}
                alt='Inspected Poster'
              />
            </section>

            <section className='inspected-movie-rating-section'>
              <FaStar className='inspected-movie-rating-star' />
              <p className='inspected-movie-rating-number'>{getAverageRating()}</p>
            </section>

            <section className='inspected-movie-information'>
              <p className='inspected-movie-title'>{selectedMovie.title}</p>
              <p className='inspected-movie-directors'>
                <span className='inspected-movie-info-header'>Directors<br /></span>
                {selectedMovie.director.join(", ")}
              </p>
              <p className='inspected-movie-release-year'>
                <span className='inspected-movie-info-header'>Release Year<br /></span>
                {selectedMovie.releaseYear}
              </p>
              <p className='inspected-movie-genre'>
                <span className='inspected-movie-info-header'>Genres<br /></span>
                {selectedMovie.genre.join(", ")}
              </p>
            </section>

            <section className='reviews-container'>
              {!userReviewExists && (
                <section className='review review-template'>
                  <p className='review-user-name'><span className='review-by'>You</span></p>
                  <FaStar className='review-star-icon review-star-icon-template' />
                  <input
                    className='review-input-rating'
                    type="number"
                    min="1.0"
                    max="10.0"
                    step="0.1"
                    value={userRating}
                    onChange={(e) => setUserRating(e.target.value)}
                  />
                  <textarea
                    className='review-input-comment'
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                  />
                  <button className='review-input-comment-send' onClick={handleReviewSubmit}>
                    <IoMdSend className='send-icon' />
                  </button>
                </section>
              )}

              {reviews.map((r, i) => (
                <section key={i} className='review'>
                  <p className='review-user-name'>
                    <span className='review-by'>By:</span>{" "}
                    {r.userId._id === userId ? "You" : usernames[r.userId._id] ?? "Anonymous"}
                  </p>
                  <FaStar className='review-star-icon' />
                  <p className='review-rating'>{r.rating.toFixed(1)}</p>
                  <p className='review-comment'>" {r.comment} "</p>
                </section>
              ))}
            </section>

            <TbArrowBack className='back-button' onClick={handleBackClick} />
          </section>
        )}
      </section>
    </section>
  );
}

export default Movies;
