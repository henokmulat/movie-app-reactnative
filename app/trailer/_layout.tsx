import { Stack } from "expo-router";

export default function TrailerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="[key]"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: "#030014" },
          contentStyle: { backgroundColor: "#fff" },
          headerTitleStyle: { color: "#fff" },
          headerTitle: "Playing Trailer",
          headerTintColor: "#fff",
        }}
      />
    </Stack>
  );
}
