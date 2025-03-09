import { Stack } from "expo-router";
import { SessionProvider, useSession } from "../context/SessionContext";
import { WeatherProvider } from "../context/WeatherContext";
import NavBar from "@/components/NavBar";
import { View } from "react-native";
import { TimelineProvider } from "../context/TimelineContext";

function LayoutWithNavBar() {
  const { session, profile, loadingProfile } = useSession();

  return (
    <View style={{ flex: 1 }}>
      <WeatherProvider>
        <TimelineProvider>
          <Stack screenOptions={{ headerShown: false }} />
          {session && !loadingProfile && profile?.onboarding_completed && (
            <NavBar />
          )}
        </TimelineProvider>
      </WeatherProvider>
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
