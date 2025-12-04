import YoutubePlayer from "react-native-youtube-iframe";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function TrailerPlayer() {
  const { key } = useLocalSearchParams();

  return (
    <View
      style={{ flex: 1, backgroundColor: "black", justifyContent: "center" }}
    >
      <YoutubePlayer height={300} play={true} videoId={key as string} />
    </View>
  );
}
