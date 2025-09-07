import { useEffect, useState } from "react";
import "../styling/admin.css";
import { fetchTMDbPoster } from "../utils/fetchTMDbPoster";
import ZootopiaPoster from "../assets/zootopia.jpeg";

type Movie = {
    _id?: string;
    title: string;
    director: string[];
    genre: string[];
    releaseYear: number | string;
};

function Admin() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [posterUrl, setPosterUrl] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [addMode, setAddMode] = useState(false);

    const token = localStorage.getItem("token");
    const isInputMode = editMode || addMode;

    useEffect(() => {
        fetch("http://localhost:3000/movies")
            .then(res => res.json())
            .then(setMovies)
            .catch(err => console.error("Failed to fetch movies", err));
    }, []);

    useEffect(() => {
        if (!selectedMovie?.title) return setPosterUrl(null);

        const timeout = setTimeout(() => {
            fetchTMDbPoster(selectedMovie.title).then(setPosterUrl);
        }, 300);

        return () => clearTimeout(timeout);
    }, [selectedMovie?.title]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setSelectedMovie((prev) => {
            if (!prev) return null;

            if (name === "director" || name === "genre") {
                return { ...prev, [name]: value.split(",").map(str => str.trim()) };
            }

            if (name === "releaseYear") {
                return { ...prev, releaseYear: parseInt(value) || "" };
            }

            return { ...prev, [name]: value };
        });
    };

    const handleAddMode = () => {
        setAddMode(true);
        setEditMode(false);
        setSelectedMovie({
            title: "",
            director: [],
            genre: [],
            releaseYear: "",
        });
        setPosterUrl(null);
    };

    const handleCancel = () => {
        setAddMode(false);
        setEditMode(false);
        setSelectedMovie(null);
        setPosterUrl(null);
    };

    const handleSelectMovie = (movie: Movie) => {
        setSelectedMovie(movie);
        setAddMode(false);
        setEditMode(false);
    };

    const handleAdd = async () => {
        if (!selectedMovie) return;

        try {
            const res = await fetch("http://localhost:3000/movies", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(selectedMovie)
            });

            const data = await res.json();
            const newMovie = data.movie || data;

            setMovies(prev => [...prev, newMovie]);
            handleCancel();
        } catch (err) {
            console.error("Add failed:", err);
        }
    };

    const handleUpdate = async () => {
        if (!selectedMovie || !selectedMovie._id) return;

        try {
            const res = await fetch(`http://localhost:3000/movies/${selectedMovie._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(selectedMovie)
            });

            const data = await res.json();
            const updatedMovie = data.movie || data;

            setMovies(prev =>
                prev.map(m => m._id === updatedMovie._id ? updatedMovie : m)
            );
            handleCancel();
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    const handleDelete = async () => {
        if (!selectedMovie || !selectedMovie._id) return;

        try {
            const res = await fetch(`http://localhost:3000/movies/${selectedMovie._id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error("Delete failed");

            setMovies(prev => prev.filter(m => m._id !== selectedMovie._id));
            handleCancel();
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    return (
        <section className="page-background">
            <section className="admin-app-wrapper">
                <section className="movie-list">
                    <div className="add-new-movie-button" onClick={handleAddMode}>
                        <p className="add-new-movie-title">ADD NEW MOVIE</p>
                    </div>

                    {movies.map((movie) => (
                        <div
                            className="movie-in-list"
                            key={movie._id}
                            onClick={() => handleSelectMovie(movie)}
                        >
                            <p className="movie-in-list-title">{movie.title}</p>
                        </div>
                    ))}
                </section>

                {selectedMovie && (
                    <section className="action-panel">
                        <section className="selected-movie-poster-container">
                            <img
                                className="selected-movie-poster"
                                src={posterUrl || ZootopiaPoster}
                                alt="Poster"
                            />
                        </section>

                        <section className="selected-movie-info">
                            {isInputMode ? (
                                <>
                                    <input
                                        className="selected-movie-title"
                                        name="title"
                                        value={selectedMovie.title}
                                        onChange={handleChange}
                                        placeholder="Title"
                                    />
                                    <input
                                        className="selected-movie-directors"
                                        name="director"
                                        value={selectedMovie.director.join(", ")}
                                        onChange={handleChange}
                                        placeholder="Directors"
                                    />
                                    <input
                                        className="selected-movie-genres"
                                        name="genre"
                                        value={selectedMovie.genre.join(", ")}
                                        onChange={handleChange}
                                        placeholder="Genres"
                                    />
                                    <input
                                        className="selected-movie-release-year"
                                        name="releaseYear"
                                        value={selectedMovie.releaseYear.toString()}
                                        onChange={handleChange}
                                        placeholder="Year"
                                    />
                                </>
                            ) : (
                                <>
                                    <h2 className="selected-movie-title">{selectedMovie.title}</h2>
                                    <p className="selected-movie-directors">{selectedMovie.director.join(", ")}</p>
                                    <p className="selected-movie-genres">{selectedMovie.genre.join(", ")}</p>
                                    <p className="selected-movie-release-year">{selectedMovie.releaseYear}</p>
                                </>
                            )}
                        </section>

                        {/* Bottom button row */}
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", padding: "0 10px" }}>
                            {(editMode || addMode) && (
                                <p className="selected-movie-delete" onClick={handleCancel}>
                                    CANCEL
                                </p>
                            )}

                            {!addMode && !editMode && (
                                <p className="selected-movie-delete" onClick={handleDelete}>
                                    DELETE
                                </p>
                            )}

                            {addMode ? (
                                <p className="selected-movie-edit" onClick={handleAdd}>
                                    ADD
                                </p>
                            ) : editMode ? (
                                <p className="selected-movie-edit" onClick={handleUpdate}>
                                    SAVE
                                </p>
                            ) : (
                                <p className="selected-movie-edit" onClick={() => setEditMode(true)}>
                                    EDIT
                                </p>
                            )}
                        </div>
                    </section>
                )}
            </section>
        </section>
    );
}

export default Admin;
