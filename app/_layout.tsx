import { Stack } from "expo-router";
import { SessionProvider, useSession } from "../context/SessionContext";
import { WeatherProvider } from "../context/WeatherContext";
import NavBar from "@/components/NavBar";
import { View } from "react-native";
import { TimelineProvider } from "../context/TimelineContext";

function LayoutWithNavBar() {
  const { session, profile, loadingProfile } = useSession();

  if (session) {
    return (
      <WeatherProvider session={session}>
        <TimelineProvider session={session}>
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }} />
            {!loadingProfile && profile?.onboarding_completed && <NavBar />}
          </View>
        </TimelineProvider>
      </WeatherProvider>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
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
