import "react-native-url-polyfill/auto";
import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { supabase } from "../lib/supabase";
import Auth from "../components/Auth";
import Home from "./home";
import { Session } from "@supabase/supabase-js";
import { useSession } from '../context/SessionContext';

export default function Index() {
  const { session, setSession } = useSession();

  if (session === undefined) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Auth onSkip={() => setSession({ user: { id: 'skip-user' } } as any)} />;
  }

  return <Home session={session} />;
}
