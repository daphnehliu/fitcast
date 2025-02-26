import { Stack } from "expo-router";
import { SessionProvider } from "../context/SessionContext"; // Import the context provider

export default function RootLayout() {
  return (
    <SessionProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SessionProvider>
  );
}
