import { fetchMovieVideos, getTrailers } from "@/services/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Trailer {
  id: string;
  key: string;
  name: string;
  type: string;
  size: number;
}

export default function AllTrailersScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const movieId = id as string;

  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrailers = async () => {
      try {
        setLoading(true);
        const videos = await fetchMovieVideos(movieId);
        const movieTrailers = getTrailers(videos);
        setTrailers(movieTrailers);
      } catch (err) {
        console.error("Error fetching trailers:", err);
        setError("Failed to load trailers");
      } finally {
        setLoading(false);
      }
    };

    loadTrailers();
  }, [movieId]);

  const playTrailer = (trailer: Trailer) => {
    // Navigate back to MovieDetails and play selected trailer
    router.push(`./trailer/${trailer.key}`);
    // You can also pass the trailer via state or context if needed
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#AB8BFF" />
        <Text className="text-white mt-2">Loading trailers...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-black p-4">
        <Text className="text-red-500 text-center">{error}</Text>
        <TouchableOpacity
          className="mt-4 px-4 py-2 bg-accent rounded"
          onPress={() => router.back()}
        >
          <Text className="text-white text-center font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!trailers.length) {
    return (
      <View className="flex-1 justify-center items-center bg-black p-4">
        <Text className="text-white text-center">No trailers available.</Text>
        <TouchableOpacity
          className="mt-4 px-4 py-2 bg-accent rounded"
          onPress={() => router.back()}
        >
          <Text className="text-white text-center font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black p-4">
      {/* <Text className="text-white text-xl font-bold mb-3">
        All Trailers ({trailers.length})
      </Text> */}

      <FlatList
        data={trailers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => playTrailer(item)} className="mb-4">
            <Image
              source={{
                uri: `https://img.youtube.com/vi/${item.key}/hqdefault.jpg`,
              }}
              className="w-full h-52 rounded-xl"
              resizeMode="cover"
            />
            <Text className="text-white font-semibold mt-2">{item.name}</Text>
            <Text className="text-light-200 text-xs">
              {item.type} • {item.size}p
            </Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
