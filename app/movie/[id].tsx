import { YouTubePlayer } from "@/components/YouTubePlayer";
import { icons } from "@/constants/icons";
import {
  fetchMovieCast,
  fetchMovieDetails,
  fetchMovieReviews,
} from "@/services/api";
import { addFavorite, isFavorite, removeFavorite } from "@/services/favorites";
import useFetch from "@/services/useFetch";
import { useMovieVideos } from "@/services/useMovieVideos";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get("window");

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

const MovieDetails = () => {
  const { id } = useLocalSearchParams();
  const movieId = id as string;
  const insets = useSafeAreaInsets();

  const [favorite, setFavorite] = useState(false);
  const [cast, setCast] = useState<any[]>([]);
  const [castLoading, setCastLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const {
    trailers,
    behindTheScenes,
    videosLoading,
    selectedTrailer,
    setSelectedTrailer,
    showTrailerModal,
    setShowTrailerModal,
    showAllTrailers,
    setShowAllTrailers,
    showAllBehindScenes,
    setShowAllBehindScenes,
    primaryTrailer,
  } = useMovieVideos(movieId);

  // Fetch movie details
  const { data: movie, loading: movieLoading } = useFetch(() =>
    fetchMovieDetails(movieId)
  );

  // Favorite status
  useEffect(() => {
    (async () => {
      setFavorite(await isFavorite(movieId));
    })();
  }, [movieId]);

  const toggleFavorite = useCallback(async () => {
    if (!movie) return;
    if (favorite) {
      await removeFavorite(movieId);
      setFavorite(false);
    } else {
      await addFavorite(movie);
      setFavorite(true);
    }
  }, [favorite, movie, movieId]);

  // Load cast
  useEffect(() => {
    (async () => {
      try {
        const credits = await fetchMovieCast(movieId);
        setCast(credits || []);
      } catch (err) {
        console.error(err);
      } finally {
        setCastLoading(false);
      }
    })();
  }, [movieId]);

  // Load reviews
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMovieReviews(movieId);
        setReviews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setReviewsLoading(false);
      }
    })();
  }, [movieId]);

  // Play trailer
  const playTrailer = useCallback(
    (trailer?: any) => {
      const trailerToPlay = trailer || primaryTrailer;
      if (trailerToPlay) {
        setSelectedTrailer(trailerToPlay);
        setShowTrailerModal(true);
      }
    },
    [primaryTrailer, setSelectedTrailer, setShowTrailerModal]
  );

  const closeTrailerModal = () => {
    setShowTrailerModal(false);
    setSelectedTrailer(null);
  };

  if (movieLoading) {
    return (
      <View className="bg-primary flex-1 justify-center items-center">
        <View className="relative">
          {/* Elegant spinner */}
          <View className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />

          {/* Center dot */}
          <View className="absolute inset-0 justify-center items-center">
            <View className="w-2 h-2 bg-white rounded-full" />
          </View>
        </View>

        <Text className="text-white mt-6 text-lg font-light tracking-widest">
          LOADING
        </Text>

        {/* Animated dots */}
        <View className="flex-row mt-2">
          {[".", ".", "."].map((dot, index) => (
            <Text
              key={index}
              className="text-white text-lg font-light"
              style={{
                opacity: (index + 1) * 0.3,
              }}
            >
              {dot}
            </Text>
          ))}
        </View>
      </View>
    );
  }

  if (!movie) {
    return (
      <View className="bg-primary flex-1 justify-center items-center">
        <Text className="text-white text-lg">
          Movie not found.Check your Internet Connection!
        </Text>
        <TouchableOpacity
          className="bg-accent rounded-lg py-3 px-6 mt-4"
          onPress={router.back}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const CARD_WIDTH = screenWidth * 0.8; // 70% of screen width
  const CARD_HEIGHT = 200;

  const renderTrailerItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      key={item.id}
      className="mr-4 bg-zinc-900 p-4 rounded-lg"
      activeOpacity={0.8}
      onPress={() => playTrailer(item)}
      style={{ width: CARD_WIDTH }}
    >
      <View className="relative">
        <Image
          source={{
            uri: `https://img.youtube.com/vi/${item.key}/hqdefault.jpg`,
          }}
          className="rounded-lg"
          resizeMode="cover"
          style={{ width: "100%", height: CARD_HEIGHT }}
        />
        <View className="absolute inset-0 items-center justify-center bg-black/40 rounded-lg">
          <Image source={icons.play} className="w-10 h-10" tintColor="#fff" />
        </View>
        {index === 0 && (
          <View className="absolute top-2 left-2 bg-green-500 px-2 py-1 rounded">
            <Text className="text-white text-xs font-bold">MAIN</Text>
          </View>
        )}
      </View>
      <View className="mt-2">
        <Text numberOfLines={1} className="text-white font-medium text-sm">
          {item.name}
        </Text>
        <Text className="text-light-200 text-xs mt-1">
          {item.type} • {item.size}p
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="bg-primary flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-20"
        showsVerticalScrollIndicator={false}
      >
        {/* Movie Poster */}
        <View className="relative">
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            }}
            className="w-full h-[550px]"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={toggleFavorite}
            className="absolute right-4 -bottom-6 bg-[#AB8BFF] p-3 rounded-full z-20"
            activeOpacity={0.8}
          >
            <Image
              source={favorite ? icons.heartFilled : icons.heart}
              className="w-6 h-6"
              tintColor="#fff"
            />
          </TouchableOpacity>

          {videosLoading && (
            <View className="absolute inset-0 justify-center items-center bg-black/30">
              <ActivityIndicator size="large" color="#fff" />
              <Text className="text-white mt-2 text-sm">
                Loading trailer...
              </Text>
            </View>
          )}

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
          <Text className="text-white font-bold text-2xl">{movie.title}</Text>
          <View className="flex-row items-center gap-3 mt-2">
            <Text className="text-light-200 text-base">
              {movie.release_date?.split("-")[0]}
            </Text>
            <Text className="text-light-200 text-base">{movie.runtime}m</Text>
          </View>
          <View className="flex-row items-center bg-dark-100 px-3 py-2 rounded-md gap-2 mt-3">
            <Image source={icons.star} className="w-5 h-5" />
            <Text className="text-white font-bold text-base">
              {Math.round(movie.vote_average ?? 0)}/10
            </Text>
            <Text className="text-light-200 text-base">
              ({movie.vote_count} votes)
            </Text>
          </View>
          <MovieInfo label="Overview" value={movie.overview} />
          <MovieInfo
            label="Genres"
            value={movie.genres?.map((g) => g.name).join(" • ") || "N/A"}
          />

          {/* Cast */}
          {!castLoading && cast.length > 0 && (
            <View className="mt-8 w-full">
              <Text className="text-white font-bold text-lg mb-4">Cast</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {cast.slice(0, 10).map((actor) => (
                  <View key={actor.cast_id} className="items-center mr-5 w-24">
                    <Image
                      source={{
                        uri: actor.profile_path
                          ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                          : "https://via.placeholder.com/100x100?text=No+Image",
                      }}
                      className="w-20 h-20 rounded-full border-2 border-accent"
                    />
                    <Text
                      className="text-white text-center mt-2 text-xs font-semibold"
                      numberOfLines={1}
                    >
                      {actor.original_name}
                    </Text>
                    <Text
                      className="text-light-200 text-center text-xs"
                      numberOfLines={1}
                    >
                      {actor.character}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Trailers Section */}
          {!videosLoading && trailers.length > 0 && (
            <View className="mt-6 w-full ">
              <View className="flex-row justify-between items-center mb-3 ">
                <Text className="text-white font-bold text-lg">
                  Available Trailers ({trailers.length})
                </Text>
                {trailers.length > 3 && (
                  <TouchableOpacity
                    onPress={() => router.push(`/all-trailers?id=${movieId}`)}
                  >
                    <Text className="text-accent font-semibold text-sm">
                      See All
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <FlatList
                data={showAllTrailers ? trailers : trailers.slice(0, 3)}
                horizontal
                keyExtractor={(item) => item.id.toString()}
                showsHorizontalScrollIndicator={false}
                renderItem={renderTrailerItem}
              />
            </View>
          )}

          {/* Behind the Scenes */}
          {!videosLoading && behindTheScenes.length > 0 && (
            <View className="mt-6 w-full">
              <Text className="text-white font-bold text-lg mb-3">
                Behind the Scenes ({behindTheScenes.length})
              </Text>
              {(showAllBehindScenes
                ? behindTheScenes
                : behindTheScenes.slice(0, 2)
              ).map((video: any) => (
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
              {behindTheScenes.length > 2 && (
                <TouchableOpacity
                  onPress={() => setShowAllBehindScenes((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <Text className="text-accent text-sm text-center mt-2 font-semibold">
                    {showAllBehindScenes
                      ? "Show less"
                      : `+${behindTheScenes.length - 2} more behind the scenes`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Movie Details */}

          {/* Reviews */}
          {!reviewsLoading && reviews.length > 0 && (
            <View className="mt-6 w-full">
              <Text className="text-white font-bold text-lg mb-3">
                Reviews ({reviews.length})
              </Text>
              {(showAllReviews ? reviews : reviews.slice(0, 3)).map(
                (review) => (
                  <View
                    key={review.id}
                    className="bg-dark-200 rounded-lg p-4 mb-3"
                  >
                    <View className="flex-row items-center mb-2">
                      {review.author_details?.avatar_path ? (
                        <Image
                          source={{
                            uri: review.author_details.avatar_path.startsWith(
                              "/https"
                            )
                              ? review.author_details.avatar_path.slice(1)
                              : `https://image.tmdb.org/t/p/w200${review.author_details.avatar_path}`,
                          }}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <View className="w-10 h-10 rounded-full bg-gray-500 mr-3 justify-center items-center">
                          <Text className="text-white font-bold text-base">
                            {review.author[0].toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View>
                        <Text className="text-white font-semibold text-sm">
                          {review.author}
                        </Text>
                        <Text className="text-light-200 text-xs">
                          {new Date(review.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-light-100 text-sm leading-5">
                      {review.content.length > 250
                        ? review.content.slice(0, 250) + "..."
                        : review.content}
                    </Text>
                  </View>
                )
              )}
              {reviews.length > 3 && (
                <TouchableOpacity
                  onPress={() => setShowAllReviews((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <Text className="text-accent text-sm text-center mt-2 font-semibold">
                    {showAllReviews ? "Show less" : "See all reviews"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Budget & Revenue */}
          <View className="flex-row justify-between w-full">
            <MovieInfo
              label="Budget"
              value={
                movie.budget
                  ? `$${(movie.budget / 1_000_000).toFixed(1)}M`
                  : "N/A"
              }
            />
            <MovieInfo
              label="Revenue"
              value={
                movie.revenue
                  ? `$${Math.round(movie.revenue / 1_000_000)}M`
                  : "N/A"
              }
            />
          </View>
          <View className="mb-10">
            <MovieInfo
              label="Production Companies"
              value={
                movie.production_companies?.map((c) => c.name).join(" • ") ||
                "N/A"
              }
            />
          </View>
        </View>
      </ScrollView>

      {/* Trailer Modal */}
      <Modal
        visible={showTrailerModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View className="flex-1 bg-black">
          <TouchableOpacity
            className="absolute top-12 left-5 z-50 bg-black/50 rounded-full p-2"
            onPress={closeTrailerModal}
          >
            <Image source={icons.close} className="w-6 h-6" tintColor="#fff" />
          </TouchableOpacity>

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
      <TouchableOpacity
        onPress={router.back}
        activeOpacity={0.7}
        style={{
          position: "absolute",
          top: insets.top + 10, // ensures it's below notch/camera
          left: 10,
          zIndex: 50,
          backgroundColor: "rgba(0,0,0,0.3)",
          borderRadius: 20,
          padding: 6,
        }}
      >
        <Image
          source={icons.left}
          className="w-8 h-8" // ensures it points left
          tintColor="#fff"
        />
      </TouchableOpacity>
    </View>
  );
};

export default MovieDetails;
