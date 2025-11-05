import Loading from "@/components/Loading";
import { icons } from "@/constants/icons";
import { fetchMovieDetails } from "@/services/api";
import { getUserFavorites } from "@/services/favorites";

import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [moviesDetails, setMoviesDetails] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const favs = await getUserFavorites();
      setFavorites(favs);

      const details: Record<string, any> = {};
      for (const movie of favs) {
        const data = await fetchMovieDetails(movie.movie_id);
        details[movie.movie_id] = data;
      }
      setMoviesDetails(details);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, []);

  const renderMovieCard = ({ item }: { item: any }) => {
    const details = moviesDetails[item.movie_id];
    if (!details) return null;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        className="flex-row h-36 bg-[#1B1B28] mx-6 mt-8 mb-12 rounded-2xl shadow-2xl overflow-visible"
        onPress={() => router.push(`/movie/${item.movie_id}`)}
      >
        {/* Poster */}
        <View className="absolute left-6 -top-10 w-32 h-44 shadow-xl rounded-2xl overflow-hidden">
          <Image
            source={{ uri: item.poster_url }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Info Section */}
        <View className="flex-1 ml-40 py-4 pr-4 justify-between">
          <Text className="text-white text-lg font-bold mb-2" numberOfLines={1}>
            {item.title}
          </Text>

          {/* Rating */}
          <View className="flex-row items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Image
                key={i}
                source={icons.star}
                className="w-4 h-4 mr-1"
                tintColor={
                  i < Math.round(details.vote_average / 2) ? "#FFD700" : "#555"
                }
              />
            ))}
            <Text className="text-yellow-400 ml-2 font-semibold text-sm">
              {details.vote_average.toFixed(1)}
            </Text>
          </View>

          {/* Extra Info */}
          <Text className="text-gray-400 text-xs">
            {details.release_date?.split("-")[0]} /{" "}
            {details.genres?.[0]?.name || "Unknown"}
          </Text>
          <Text className="text-gray-500 text-xs mt-1">
            Director:{" "}
            {details.credits?.crew?.find((c: any) => c.job === "Director")
              ?.name || "Unknown"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-primary pt-16">
      <Text className="text-white text-2xl font-extrabold mb-10 px-5 text-center">
        Favorites
      </Text>

      {loading ? (
        <Loading />
      ) : favorites.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Image
            source={icons.save}
            className="w-12 h-12 mb-3"
            tintColor="#888"
          />
          <Text className="text-white text-lg font-semibold">
            No Favorites Yet
          </Text>
          <Text className="text-gray-400 text-sm mt-1">
            Movies you favorite will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderMovieCard}
          keyExtractor={(item) => item.$id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}
    </View>
  );
}
