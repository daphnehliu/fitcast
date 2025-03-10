import React from "react";
import { View, ActivityIndicator } from "react-native";
import Auth from "../components/Auth";
import Onboarding from "./onboarding";
import Home from "./home";
import { useSession } from "../context/SessionContext";
import { supabase } from "../lib/supabase";

export default function Index() {
  const { session, setSession, profile, setProfile, loadingProfile } =
    useSession();

  // Bypass onboarding for a skip user.
  if (session && session.user && session.user.id === "skip-user") {
    return <Home session={session} />;
  }

  // Show loading spinner while session or profile is still loading.
  if (session === undefined || loadingProfile) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If there's no session, show Auth.
  if (!session) {
    return (
      <Auth onSkip={() => setSession({ user: { id: "skip-user" } } as any)} />
    );
  }

  // Show onboarding if profile is missing or onboarding is incomplete.
  if (!profile || !profile.onboarding_completed) {
    return (
      <Onboarding
        onFinish={async (prefs) => {
          try {
            // --- Prepare data for the `profiles` table ---
            // You can store just the city, or store coordinates as well.
            // Below, we just store the city name in the `location` column.
            const cityName = prefs.location?.city ?? null;

            // Upsert the profile to mark onboarding as complete, including the location.
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .upsert({
                id: session.user.id,
                onboarding_completed: true,
                location: cityName, // <--- Add the location here
              })
              .select()
              .single();

            if (profileError) {
              console.error("Index: Error updating onboarding status:", profileError);
              return;
            }

            console.log("Index: Profile after onboarding update:", profileData);

            // Upsert user preferences in the `initial_preferences` table.
            const { error: prefError } = await supabase
              .from("initial_preferences")
              .upsert({
                user_id: session.user.id,
                cold_tolerance: prefs.coldTolerance,
                items: prefs.items, // now using the selected items array
                prefers_layers: prefs.prefersLayers,
              });

            if (prefError) {
              console.error(
                "Index: Error upserting initial_preferences:",
                prefError
              );
              return;
            }

            // Update our local state with the new profile data
            setProfile(profileData);
          } catch (err) {
            console.error("Index: Error finalizing onboarding:", err);
          }
        }}
      />
    );
  }

  // Otherwise, show the Home screen.
  return <Home session={session} />;
}
