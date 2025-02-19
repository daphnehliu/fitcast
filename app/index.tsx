// index.tsx
import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import Auth from '../components/Auth';
import Home from './home';
import { Session } from '@supabase/supabase-js';

export default function Index() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(
      ({ data: { session } }: { data: { session: Session | null } }) => {
        setSession(session);
        setLoading(false);
      }
    );

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: any, session: Session | null) => {
        setSession(session);
      }
    );

    // Cleanup the listener on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If there's no session, show the authentication screen with a skip option
  if (!session) {
    return <Auth onSkip={() => {
      // Here, you could either set a dummy session, or set a flag that indicates "skip"
      // For this example, we'll simulate a session with a dummy user id.
      setSession({ user: { id: 'skip-user' } } as Session);
    }} />;
  }

  // If logged in, show the Home screen
  let userId = session.user?.id;
  return <Home userId={userId} />;
}
