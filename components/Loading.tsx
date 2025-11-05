import { Text, View } from "react-native";

const Loading = () => {
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
};

export default Loading;
