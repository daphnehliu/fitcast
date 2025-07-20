import React, { useState, useEffect } from "react";
import { Alert, StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Keyboard} from "react-native";
import { supabase } from "../lib/supabase";
import { Input, Button} from "@rneui/themed";
import { AppText } from "@/components/AppText";
import * as ImagePicker from "expo-image-picker";


type AuthProps = {
  onSkip: () => void;
};

export default function Auth({ onSkip }: AuthProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // username for sign-up
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true); // default is Sign Up
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const clearFormFields = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setProfileImage(null);
  };

  const toggleAuthMode = () => {
    clearFormFields();
    setIsSignUp(!isSignUp);
  };

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
  
    try {
      // Ensure username is unique
      const { data: existingUsers, error: usernameCheckError } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username);
  
      if (usernameCheckError) throw usernameCheckError;
      if (existingUsers.length > 0) {
        Alert.alert("Username is already taken. Please choose another.");
        setLoading(false);
        return;
      }
  
      // check if email exists using RPC
      const { data: emailExists, error: emailCheckError } = await supabase.rpc(
        "check_email_exists",
        { user_email: email }
      );
  
      if (emailCheckError) {
        console.error("Error checking email:", emailCheckError.message);
        Alert.alert("Error checking email:", emailCheckError.message);
        setLoading(false);
        return;
      }
  
      if (emailExists) {
        Alert.alert("This email is already in use. Please log in instead.");
        setLoading(false);
        return;
      }
  
      // Sign Up
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: null, // pause email verificatio nfor now
          data: { username: username }, // store username in metadata
        },
      });
  
      if (error) {
        Alert.alert("Sign-up failed", error.message);
        setLoading(false);
        return;
      }
      console.log("User signed up and logged in:", data.user);
  
      let avatarUrl = ""; // Default to empty string
      // upload pfp
      if (profileImage) {
        const fileExt = profileImage.split(".").pop();
        const fileName = `${data.user.id}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
  
        const { error: uploadError } = await supabase.storage
          .from("avatars") // Make sure you have this bucket in Supabase Storage
          .upload(filePath, {
            uri: profileImage,
            type: `image/${fileExt}`,
            name: fileName,
          });
  
        if (uploadError) {
          console.error("Image upload error:", uploadError.message);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);
          avatarUrl = publicUrlData.publicUrl; // save URL for profile creation
        }
      }
  
      // insert user into profiles
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id, // matches the auth user ID
            username: username,
            avatar_url: avatarUrl, //uUse uploaded image or default
          },
        ]);
  
        if (profileError) throw profileError;
      }
  
      Alert.alert("Sign-up successful! You're now logged in.");
    } catch (error: any) {
      Alert.alert("Sign-up failed", error.message);
    } finally {
      setLoading(false);
    }
  }
  
  
  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "You need to allow access to upload a profile picture.");
      return;
    }
  
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  }
  


  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Image 
            source={fitcast} 
            style={[
              styles.image,
              keyboardVisible && styles.imageKeyboardVisible
            ]} 
          /> 
          <AppText 
            type="title" 
            style={[
              styles.headerText,
              keyboardVisible && styles.headerTextKeyboardVisible
            ]}
          >
            Know the weather. {"\n"}
            Know your fits. 
          </AppText>

          {/* Toggle between Sign Up and Sign In */}
          <View style={styles.verticallySpaced}>
            <AppText style={styles.switchText}>
              {isSignUp ? "Already have an account? " : "New to fitcast? "}
              <AppText style={styles.switchTextUnderline} onPress={toggleAuthMode}>
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

          {/* Profile Picture */}
          {isSignUp && (
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            <Image
              source={profileImage ? { uri: profileImage } : require("../assets/images/default-avatar.png")}
              style={styles.profileImage}
            />
            <AppText style={styles.imagePickerText}>Choose Profile Picture</AppText>
          </TouchableOpacity>
          )}

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

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40, // Add padding at the bottom for better scrolling
  },
  container: {
    marginTop: 35,
    padding: 12,
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
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
    marginBottom: 5,
  },
  imageKeyboardVisible: {
    width: 150,
    height: 67,
    marginTop: 5,
    marginBottom: 2,
  },
  headerText: {
    marginTop: 40,
    marginBottom: 40,
    color: "black",
    textAlign: "center",
    fontSize: 35,
  },
  headerTextKeyboardVisible: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 28,
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
  imagePicker: {
    flexDirection: "row", // Places image & text side by side
    alignItems: "center", // Centers vertically
    justifyContent: "center", // Centers horizontally
    marginBottom: 15,
    marginTop: -5,
  },
  
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15, // Adds space between image and text
  },
  
  imagePickerText: {
    color: "#0353A4",
    textDecorationLine: "underline",
    fontSize: 16, 
  },
  
  
});
