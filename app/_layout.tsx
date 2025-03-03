import { Stack } from "expo-router";
import { SessionProvider, useSession } from "../context/SessionContext";
import NavBar from "@/components/NavBar";
import { View } from "react-native";

function LayoutWithNavBar() {
  const { session } = useSession();

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
      {session && <NavBar />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <LayoutWithNavBar />
    </SessionProvider>
  );
}
