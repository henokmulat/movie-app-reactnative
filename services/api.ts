const TMDB_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
  },
};

export type Video = {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
  official: boolean;
  size: number;
  published_at: string;
  iso_639_1: string;
  iso_3166_1: string;
};

export type VideoResponse = {
  id: number;
  results: Video[];
};

// Video Services
export const fetchMovieVideos = async (movieId: string): Promise<Video[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_CONFIG.API_KEY}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch movie videos: ${response.statusText}`);
    }

    const data: VideoResponse = await response.json();
    return data.results || [];
  } catch (error) {
    console.log("Error fetching movie videos", error);
    throw error;
  }
};

export const getTrailers = (videos: Video[]): Video[] => {
  return videos.filter(
    (video) =>
      video.site === "YouTube" &&
      (video.type === "Trailer" || video.type === "Teaser") &&
      video.official === true
  );
};

export const getBehindTheScenes = (videos: Video[]): Video[] => {
  return videos.filter(
    (video) =>
      video.site === "YouTube" &&
      (video.type === "Behind the Scenes" ||
        video.type === "Featurette" ||
        video.type === "Making of")
  );
};

export const getClips = (videos: Video[]): Video[] => {
  return videos.filter(
    (video) => video.site === "YouTube" && video.type === "Clip"
  );
};

export const getAllYouTubeVideos = (videos: Video[]): Video[] => {
  return videos.filter((video) => video.site === "YouTube");
};

export const getPrimaryTrailer = (videos: Video[]): Video | null => {
  const trailers = getTrailers(videos);
  if (trailers.length === 0) return null;

  // Prioritize official trailers, then teasers
  const trailer = trailers.find((v) => v.type === "Trailer") || trailers[0];
  return trailer;
};

export const fetchMovieDetailsWithVideos = async (
  movieId: string
): Promise<{
  movie: MovieDetails;
  videos: Video[];
}> => {
  try {
    const [movie, videos] = await Promise.all([
      fetchMovieDetails(movieId),
      fetchMovieVideos(movieId),
    ]);

    return { movie, videos };
  } catch (error) {
    console.log("Error fetching movie details with videos", error);
    throw error;
  }
};

// Get trending movies with video availability
export const fetchTrendingMoviesWithVideos = async (): Promise<any[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/trending/movie/week?api_key=${TMDB_CONFIG.API_KEY}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch trending movies: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.log("Error fetching trending movies", error);
    throw error;
  }
};

// Search movies with video availability info
export const searchMoviesWithVideos = async (query: string): Promise<any[]> => {
  try {
    const movies = await fetchMovies({ query });

    // For each movie, check if it has videos (optional - can be heavy)
    const moviesWithVideoInfo = await Promise.all(
      movies.slice(0, 10).map(async (movie: any) => {
        try {
          const videos = await fetchMovieVideos(movie.id.toString());
          return {
            ...movie,
            hasVideos: videos.length > 0,
            trailerCount: getTrailers(videos).length,
          };
        } catch {
          return {
            ...movie,
            hasVideos: false,
            trailerCount: 0,
          };
        }
      })
    );

    return moviesWithVideoInfo;
  } catch (error) {
    console.log("Error searching movies with videos", error);
    throw error;
  }
};

// Utility function to check if movie has any watchable content
export const hasWatchableContent = (videos: Video[]): boolean => {
  return getAllYouTubeVideos(videos).length > 0;
};

// Get video statistics
export const getVideoStats = (videos: Video[]) => {
  const youtubeVideos = getAllYouTubeVideos(videos);
  return {
    totalVideos: youtubeVideos.length,
    trailers: getTrailers(videos).length,
    behindTheScenes: getBehindTheScenes(videos).length,
    clips: getClips(videos).length,
    hasContent: youtubeVideos.length > 0,
  };
};

export const fetchMovies = async ({ query }: { query: string }) => {
  const endpoint = query
    ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
    : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: TMDB_CONFIG.headers,
  });
  if (!response.ok) {
    //@ts-ignore
    throw new Error("Failed to fetch movies", response.statusText);
  }
  const data = await response.json();
  return data.results;
};

export const fetchMovieDetails = async (
  movieId: string
): Promise<MovieDetails> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );
    if (!response.ok)
      throw new Error(`Failed to fetch movie details: ${response.statusText}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error fetching movie details", error);
    throw error;
  }
};
