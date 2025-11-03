import React, { useRef } from "react";
import { View } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

interface YouTubePlayerProps {
  videoId: string;
  height?: number;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  height = 300,
}) => {
  const playerRef = useRef(null);

  return (
    <View className="bg-black w-full" style={{ height }}>
      <YoutubePlayer
        ref={playerRef}
        height={height}
        play={true}
        videoId={videoId}
        onError={(e: any) => console.log("YouTube Error:", e)}
      />
    </View>
  );
};
