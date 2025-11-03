import { YouTubePlayer } from "@/components/YouTubePlayer";
import { icons } from "@/constants/icons";
import {
  fetchMovieDetails,
  fetchMovieVideos,
  getBehindTheScenes,
  getPrimaryTrailer,
  getTrailers,
  getVideoStats,
} from "@/services/api";

import useFetch from "@/services/useFetch";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value || "N/A"}
    </Text>
  </View>
);

const { width: screenWidth } = Dimensions.get("window");

const MovieDetails = () => {
  const { id } = useLocalSearchParams();
  const movieId = id as string;

  // State for videos and trailer modal
  const [videos, setVideos] = useState<any[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [selectedTrailer, setSelectedTrailer] = useState<any>(null);
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  // Fetch movie details
  const { data: movie, loading: movieLoading } = useFetch(() =>
    fetchMovieDetails(movieId)
  );
  const insets = useSafeAreaInsets();
  // Fetch videos when component mounts
  useEffect(() => {
    const loadVideos = async () => {
      if (!movieId) return;

      try {
        setVideosLoading(true);
        setVideoError(null);
        const movieVideos = await fetchMovieVideos(movieId);
        setVideos(movieVideos);

        // Log video stats
        const trailers = getTrailers(movieVideos);
        const behindTheScenes = getBehindTheScenes(movieVideos);
        const stats = getVideoStats(movieVideos);

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

  // Get filtered videos
  const trailers = getTrailers(videos);
  const behindTheScenes = getBehindTheScenes(videos);
  const primaryTrailer = getPrimaryTrailer(videos);
  const stats = getVideoStats(videos);

  // Play trailer function
  const playTrailer = (trailer?: any) => {
    const trailerToPlay = trailer || primaryTrailer;
    if (trailerToPlay) {
      setSelectedTrailer(trailerToPlay);
      setShowTrailerModal(true);
    }
  };

  // Close trailer modal
  const closeTrailerModal = () => {
    setShowTrailerModal(false);
    setSelectedTrailer(null);
  };

  if (movieLoading) {
    return (
      <View className="bg-primary flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white mt-4">Loading movie details...</Text>
      </View>
    );
  }

  if (!movie) {
    return (
      <View className="bg-primary flex-1 justify-center items-center">
        <Text className="text-white text-lg">Movie not found</Text>
        <TouchableOpacity
          className="bg-accent rounded-lg py-3 px-6 mt-4"
          onPress={router.back}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="bg-primary flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-20" // Tailwind for padding bottom
        showsVerticalScrollIndicator={false}
      >
        {/* Movie Poster with Play Button */}
        <View className="relative">
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`,
            }}
            className="w-full h-[550px]"
            resizeMode="cover"
          />

          {/* Play Trailer Button Overlay */}
          {primaryTrailer && !videosLoading && (
            <TouchableOpacity
              className="absolute inset-0 justify-center items-center"
              onPress={() => playTrailer()}
              activeOpacity={0.8}
            >
              <View className="bg-black/50 rounded-full p-4">
                <View className="bg-accent rounded-full p-5">
                  <Image
                    source={icons.play}
                    className="w-8 h-8 ml-1"
                    tintColor="#fff"
                  />
                </View>
              </View>
              <Text className="text-white font-semibold text-lg mt-3 bg-black/50 px-3 py-1 rounded">
                Play Trailer
              </Text>
            </TouchableOpacity>
          )}

          {/* Loading State for Videos */}
          {videosLoading && (
            <View className="absolute inset-0 justify-center items-center bg-black/30">
              <ActivityIndicator size="large" color="#fff" />
              <Text className="text-white mt-2 text-sm">
                Loading trailer...
              </Text>
            </View>
          )}

          {/* No Trailer Available */}
          {!primaryTrailer && !videosLoading && (
            <View className="absolute inset-0 justify-center items-center bg-black/30">
              <View className="bg-dark-100 rounded-full p-5 opacity-80">
                <Image
                  source={icons.play}
                  className="w-8 h-8 ml-1"
                  tintColor="#666"
                />
              </View>
              <Text className="text-light-200 font-semibold text-sm mt-3 bg-black/50 px-3 py-1 rounded">
                No Trailer
              </Text>
            </View>
          )}
        </View>

        {/* Movie Info */}
        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-2xl">{movie?.title}</Text>

          <View className="flex-row items-center gap-3 mt-2">
            <Text className="text-light-200 text-base">
              {movie?.release_date?.split("-")[0]}
            </Text>
            <Text className="text-light-200 text-base">{movie?.runtime}m</Text>
          </View>

          <View className="flex-row items-center bg-dark-100 px-3 py-2 rounded-md gap-2 mt-3">
            <Image source={icons.star} className="w-5 h-5" />
            <Text className="text-white font-bold text-base">
              {Math.round(movie?.vote_average ?? 0)}/10
            </Text>
            <Text className="text-light-200 text-base">
              ({movie?.vote_count} votes)
            </Text>
          </View>

          {/* Video Status & Additional Trailers */}
          {!videosLoading && trailers.length > 0 && (
            <View className="mt-6 w-full">
              <Text className="text-white font-bold text-lg mb-3">
                Available Trailers ({trailers.length})
              </Text>

              {/* Additional trailers list */}
              {trailers.slice(0, 3).map((trailer, index) => (
                <TouchableOpacity
                  key={trailer.id}
                  className="flex-row items-center bg-dark-200 rounded-lg p-3 mb-2"
                  onPress={() => playTrailer(trailer)}
                >
                  <View className="bg-accent rounded-full p-2 mr-3">
                    <Image
                      source={icons.play}
                      className="w-4 h-4 ml-0.5"
                      tintColor="#fff"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-medium text-sm">
                      {trailer.name}
                    </Text>
                    <Text className="text-light-200 text-xs mt-1">
                      {trailer.type} • {trailer.size}p
                    </Text>
                  </View>
                  {index === 0 && (
                    <View className="bg-green-500 px-2 py-1 rounded">
                      <Text className="text-white text-xs font-bold">MAIN</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              {trailers.length > 3 && (
                <Text className="text-light-200 text-sm text-center mt-2">
                  +{trailers.length - 3} more trailers available
                </Text>
              )}
            </View>
          )}

          {/* Behind the Scenes Section */}
          {!videosLoading && behindTheScenes.length > 0 && (
            <View className="mt-6 w-full">
              <Text className="text-white font-bold text-lg mb-3">
                Behind the Scenes ({behindTheScenes.length})
              </Text>
              {behindTheScenes.slice(0, 2).map((video) => (
                <TouchableOpacity
                  key={video.id}
                  className="flex-row items-center bg-dark-200 rounded-lg p-3 mb-2"
                  onPress={() => playTrailer(video)}
                >
                  <View className="bg-blue-500 rounded-full p-2 mr-3">
                    <Image
                      source={icons.video}
                      className="w-4 h-4"
                      tintColor="#fff"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-medium text-sm">
                      {video.name}
                    </Text>
                    <Text className="text-light-200 text-xs mt-1">
                      {video.type}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Movie Details */}
          <MovieInfo label="Overview" value={movie?.overview} />

          <MovieInfo
            label="Genres"
            value={movie?.genres?.map((g) => g.name).join(" • ") || "N/A"}
          />

          <View className="flex-row justify-between w-full">
            <MovieInfo
              label="Budget"
              value={
                movie?.budget
                  ? `$${(movie.budget / 1_000_000).toFixed(1)}M`
                  : "N/A"
              }
            />
            <MovieInfo
              label="Revenue"
              value={
                movie?.revenue
                  ? `$${Math.round(movie.revenue / 1_000_000)}M`
                  : "N/A"
              }
            />
          </View>

          <MovieInfo
            label="Production Companies"
            value={
              movie?.production_companies?.map((c) => c.name).join(" • ") ||
              "N/A"
            }
          />
        </View>
      </ScrollView>

      {/* Trailer Modal */}
      <Modal
        visible={showTrailerModal}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <View className="flex-1 bg-black">
          {/* Close Button */}
          <TouchableOpacity
            className="absolute top-12 left-5 z-50 bg-black/50 rounded-full p-2"
            onPress={closeTrailerModal}
          >
            <Image source={icons.close} className="w-6 h-6" tintColor="#fff" />
          </TouchableOpacity>

          {/* YouTube Player */}
          {selectedTrailer && (
            <View className="flex-1 justify-center items-center">
              <YouTubePlayer
                videoId={selectedTrailer.key}
                height={screenWidth * 0.75}
              />
              <Text className="text-white text-center text-lg font-semibold mt-4 px-4">
                {selectedTrailer.name}
              </Text>
            </View>
          )}
        </View>
      </Modal>

      {/* Go Back Button */}
      <SafeAreaView
        edges={["bottom"]}
        className="absolute left-5 right-5 z-10"
        style={{
          bottom: 2, // ensures it sits above navigation bar
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={router.back}
          className="bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center"
        >
          <Image
            source={icons.arrow}
            className="w-5 h-5 mr-1 rotate-180"
            tintColor="#fff"
          />
          <Text className="text-white font-semibold text-base">Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default MovieDetails;
