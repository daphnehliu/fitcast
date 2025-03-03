import { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import Auth from "../components/Auth";
import Onboarding from "./onboarding";
import Home from "./home";
import { useSession } from "../context/SessionContext";

export default function Index() {
  const { session, setSession } = useSession();
  // When a session is detected, we want to show onboarding immediately
  const [showOnboarding, setShowOnboarding] = useState(true);

  if (session === undefined) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return (
      <Auth onSkip={() => setSession({ user: { id: "skip-user" } } as any)} />
    );
  }

  // If a session exists, show onboarding until it finishes
  if (showOnboarding) {
    return <Onboarding onFinish={() => setShowOnboarding(false)} />;
  }

  return <Home session={session} />;
}
