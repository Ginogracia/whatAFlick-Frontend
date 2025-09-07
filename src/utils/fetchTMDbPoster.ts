export async function fetchTMDbPoster(title: string): Promise<string | null> {
  const apiKey = "c623e15a97dfec583354cb76a5546e21";
  const res = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&api_key=${apiKey}`);
  const data = await res.json();
  const posterPath = data.results?.[0]?.poster_path;
  return posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;
}
