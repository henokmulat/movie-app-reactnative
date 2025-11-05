import MovieCard from "@/components/MovieCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

// 🩵 Example placeholder data (replace with your savedMovies state)
const savedMovies: Movie[] = []; // e.g. from context, provider, or database

const Saved = () => {
  const router = useRouter();

  return (
    <View className="flex-1 bg-primary relative">
      {/* Background */}
      <Image
        source={images.bg}
        className="absolute w-full h-full z-0 opacity-40"
        resizeMode="cover"
      />

      {/* Header */}
      <View className="px-6 pt-16 pb-4 flex-row justify-between items-center">
        <Text className="text-2xl font-extrabold text-white tracking-wide">
          Favorites
        </Text>
        <Image source={icons.save} className="w-7 h-7" tintColor="#fff" />
      </View>

      {/* Saved List */}
      {savedMovies.length > 0 ? (
        <FlatList
          data={savedMovies}
          renderItem={({ item }) => <MovieCard {...item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          className="px-5"
          columnWrapperStyle={{
            justifyContent: "flex-start",
            gap: 20,
            marginBottom: 16,
          }}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      ) : (
        // Empty State
        <View className="flex-1 justify-center items-center gap-5 px-10 -mt-10">
          <View className="bg-white/10 p-6 rounded-2xl items-center">
            <Image
              source={icons.save}
              className="size-14 mb-4"
              tintColor="#fff"
            />
            <Text className="text-white/80 text-center text-lg font-semibold mb-2">
              No Favorites Yet
            </Text>
            <Text className="text-gray-400 text-center text-sm leading-5">
              Your saved movies will appear here. Explore trending films and tap
              the heart icon to add them to your favorites.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/")}
            className="bg-accent px-6 py-3 rounded-full mt-5"
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-semibold">
              Browse Movies
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Saved;
