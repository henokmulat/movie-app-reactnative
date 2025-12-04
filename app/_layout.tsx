import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "./globals.css";
export default function RootLayout() {
  return (
    <>
      <StatusBar hidden={true} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="movie/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="all-trailers"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: "#030014" },
            contentStyle: { backgroundColor: "#fff" },
            headerTitleStyle: { color: "#fff" },
            headerTitle: "All Trailers",
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen name="trailer" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
