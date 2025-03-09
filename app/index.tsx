import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import Auth from "../components/Auth";
import Onboarding from "./onboarding";
import Home from "./home";
import { useSession } from "../context/SessionContext";
import { supabase } from "../lib/supabase";

export default function Index() {
  const { session, setSession } = useSession();

  // Immediately bypass onboarding for a skip user.
  if (session && session.user && session.user.id === "skip-user") {
    return <Home session={session} />;
  }

  // We'll use undefined for "not fetched yet" and null to indicate "no profile row exists"
  const [profile, setProfile] = useState<any | null | undefined>(undefined);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    // If there's no session, we don't need to fetch the profile; stop loading.
    if (!session) {
      setLoadingProfile(false);
      return;
    }
    if (session?.user?.id) {
      const fetchProfile = async () => {
        try {
          setLoadingProfile(true);
          const { data, error } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("id", session.user.id)
            .single();
          if (error) {
            // If no row is found, treat that as a new account that hasn't onboarded.
            console.error("Index: Profile not found for user id", session.user.id, "Error:", error);
            setProfile(null);
          } else {
            console.log("Index: Fetched profile for user id", session.user.id, ":", data);
            setProfile(data);
          }
        } catch (err) {
          console.error("Index: Error fetching profile:", err);
          setProfile(null);
        } finally {
          setLoadingProfile(false);
        }
      };
      fetchProfile();
    }
  }, [session]);

  // Show a spinner while the session is undefined or we're still loading.
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

  // For non‑skip users:
  // If no profile row exists (profile is null) OR if the profile exists but onboarding_completed is false,
  // show Onboarding.
  if (profile === null || (profile && !profile.onboarding_completed)) {
    return (
      <Onboarding
        onFinish={async (prefs) => {
          // Step 1: Ensure the profile row exists.
          let profileData;
          if (profile) {
            // Update existing profile to mark onboarding as complete.
            const { data, error } = await supabase
              .from("profiles")
              .update({ onboarding_completed: true })
              .eq("id", session.user.id)
              .select()
              .single();
            if (error) {
              console.error("Index: Error updating onboarding status:", error);
              return;
            }
            profileData = data;
          } else {
            // Upsert a new row in profiles if none exists.
            const { data, error } = await supabase
              .from("profiles")
              .upsert({ id: session.user.id, onboarding_completed: true })
              .select()
              .single();
            if (error) {
              console.error("Index: Error upserting onboarding status:", error);
              return;
            }
            profileData = data;
          }
          setProfile(profileData);
          console.log("Index: Profile after update:", profileData);

          // Step 2: Now that the profile row exists, upsert the user preferences.
          const { data: prefData, error: prefError } = await supabase
            .from("initial_preferences")
            .upsert({
              user_id: session.user.id,
              cold_tolerance: prefs.coldTolerance,
              excluded_items: prefs.excludedItems,
              prefers_layers: prefs.prefersLayers,
            })
            .select()
            .single();

          if (prefError) {
            console.error("Index: Error upserting initial_preferences:", prefError);
            return;
          }
          console.log("Index: Preferences saved:", prefData);
        }}
      />
    );
  }

  // Otherwise, show the Home screen.
  return <Home session={session} />;
}
