import React, { useState } from "react";
import { Alert, StyleSheet, View, Text, Image} from "react-native";
import { supabase } from "../lib/supabase";
import { Input, Button} from "@rneui/themed";
import { AppText } from "@/components/AppText";

type AuthProps = {
  onSkip: () => void;
};

export default function Auth({ onSkip }: AuthProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Username for sign-up
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true); // Default is Sign Up

  const fitcast = require("../assets/images/fitcast.png");

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    
    // Step 1: Create user in Supabase Auth
    const { data: { user }, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { username: username }, // Store username in user metadata
      },
    });

    if (error) {
      Alert.alert(error.message);
      setLoading(false);
      return;
    }

    console.log("✅ User signed up:", user);

    // Step 2: Insert new user into profiles table
    if (user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: user.id, // Matches the auth user ID
          username: username,
          avatar_url: "", // Empty for now, can be updated later
        },
      ]);

      if (profileError) {
        console.error("❌ Error inserting into profiles:", profileError);
        Alert.alert("Error setting up profile", profileError.message);
      } else {
        console.log("✅ Profile successfully created for:", user.id);
      }
    }

    Alert.alert("Sign-up successful! Please check your inbox for verification.");
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Image source={fitcast} style={styles.image} /> 
      <AppText type="title" style={styles.headerText}>
            Know the weather. {"\n"}
            Know your fits. 
        </AppText>
      {/* Title */}
      

      {/* Toggle between Sign Up and Sign In */}
      <View style={styles.verticallySpaced}>
        <AppText style={styles.switchText}>
          {isSignUp ? "Already have an account? " : "New to fitcast? "}
          <AppText style={styles.switchTextUnderline} onPress={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Log in" : "Sign up"}
          </AppText>
        </AppText>
      </View>


      {/* Sign Up Fields */}
      {isSignUp && (
        <View style={[styles.verticallySpaced, styles.inputContainer]}>
          <Input
            onChangeText={(text) => setUsername(text)}
            value={username}
            placeholder="Username*"
            autoCapitalize="none"
            inputContainerStyle={styles.input} 
            placeholderTextColor="#AEB0B5"
          />
        </View>
      )}

      {/* Common Fields */}
      <View style={[styles.verticallySpaced, styles.inputContainer]}>
        <Input
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="Email address*"
          autoCapitalize="none"
          inputContainerStyle={styles.input} 
          placeholderTextColor="#AEB0B5"
        />
      </View>

      <View style={[styles.verticallySpaced, styles.inputContainer]}>
        <Input
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password*"
          autoCapitalize="none"
          inputContainerStyle={styles.input} 
          placeholderTextColor="#AEB0B5"
        />
      </View>

      {/* Sign Up / Sign In Button */}
      <View style={styles.verticallySpaced}>
        {isSignUp ? (
          <Button 
            title="Create account" 
            disabled={loading} 
            onPress={signUpWithEmail} 
            buttonStyle={styles.button}
            containerStyle={styles.buttonContainer}
            titleStyle={styles.buttonText}/>
        ) : (
          <Button 
            title="Sign In" 
            disabled={loading} 
            onPress={signInWithEmail}
            buttonStyle={styles.button}
            containerStyle={styles.buttonContainer}
            titleStyle={styles.buttonText} />
        )}
      </View>

      {/* Skip Button */}
      <View style={styles.verticallySpaced}>
        <Button 
        title="Skip" 
        disabled={loading} 
        onPress={onSkip}
        buttonStyle={styles.buttonOutline}
        containerStyle={styles.buttonContainer}
        titleStyle={styles.buttonOutlineText} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    padding: 12,
  },
  switchText: {
    color: "#0353A4",
    textAlign: "center",
    marginBottom: 10,
  },
  switchTextUnderline: {
    textDecorationLine: "underline",
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  image: {
    marginTop: 15,
    width: 200,
    height: 90,
    resizeMode: "contain",
    textAlign: "center",
    marginLeft: "25%",
    marginBottom: 10,
  },
  headerText: {
    marginTop: 40,
    marginBottom: 40,
    color: "black",
    textAlign: "center",
    fontSize: 35,
  },
  input: {
    width: "90%", // Takes full width
    alignSelf: "center", // Centers text
    borderWidth: 1, // Thin border
    borderColor: "#AEB0B5", // Light gray border
    borderRadius: 8, // Rounded corners
    paddingHorizontal: 12, // Padding inside input
    height: 45, // Matches the updated style
    backgroundColor: "white", // White background
  },
  buttonContainer: {
    width: "90%", // Makes buttons wide and centered
    alignSelf: "center",
    marginBottom: 5, // Adds spacing between buttons
  },
  button: {
    backgroundColor: "#0353A4", // Blue background
    borderRadius: 25, // Rounded edges
    paddingVertical: 12, // Adds padding inside the button
    paddingHorizontal: 20,
  },
  buttonOutline: {
    backgroundColor: "transparent", // No background for outlined button
    borderColor: "#0353A4",
    borderWidth: 2,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white", // White text for filled buttons
    textAlign: "center",
  },
  buttonOutlineText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0353A4", // Blue text for outlined buttons
    textAlign: "center",
  },
});
