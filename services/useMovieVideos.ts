import { useEffect, useState } from "react";
import {
  fetchMovieVideos,
  getBehindTheScenes,
  getPrimaryTrailer,
  getTrailers,
} from "../services/api"; // adjust path

export const useMovieVideos = (movieId: string) => {
  const [videos, setVideos] = useState<any[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [selectedTrailer, setSelectedTrailer] = useState<any>(null);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [showAllTrailers, setShowAllTrailers] = useState(false);
  const [showAllBehindScenes, setShowAllBehindScenes] = useState(false);

  useEffect(() => {
    const loadVideos = async () => {
      if (!movieId) return;

      try {
        setVideosLoading(true);
        setVideoError(null);
        const movieVideos = await fetchMovieVideos(movieId);
        setVideos(movieVideos);

        // Optional: Log stats
        const trailers = getTrailers(movieVideos);
        const behindTheScenes = getBehindTheScenes(movieVideos);
        console.log(
          `Found ${trailers.length} trailers and ${behindTheScenes.length} behind-the-scenes videos`
        );
      } catch (error) {
        console.error("Error loading videos:", error);
        setVideoError("Failed to load videos");
      } finally {
        setVideosLoading(false);
      }
    };

    loadVideos();
  }, [movieId]);

  // Derived data
  const trailers = getTrailers(videos);
  const behindTheScenes = getBehindTheScenes(videos);
  const primaryTrailer = getPrimaryTrailer(videos);

  return {
    videos,
    videosLoading,
    videoError,
    trailers,
    behindTheScenes,
    primaryTrailer,
    selectedTrailer,
    setSelectedTrailer,
    showTrailerModal,
    setShowTrailerModal,
    showAllTrailers,
    setShowAllTrailers,
    showAllBehindScenes,
    setShowAllBehindScenes,
  };
};
