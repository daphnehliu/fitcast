import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { StyleSheet, View, Alert, Text, Image, TouchableOpacity } from "react-native";
import { Button, Input } from "@rneui/themed";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { AppText } from "@/components/AppText";


export default function Account({ session }: { session: Session }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);


  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Logout error", error.message);
    }

    // go back to index
    router.replace("/");
    router.dismissAll(); // Ensure all previous screens are removed
  }

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");
  
      const { data, error, status } = await supabase
        .from("profiles")
        .select(`username, avatar_url`)
        .eq("id", session?.user.id)
        .single();
  
      if (error && status !== 406) {
        throw error;
      }
  
      if (data) {
        setUsername(data.username);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }
  
  async function updateProfile({
    username,
    avatar_url,
  }: {
    username: string;
    avatar_url: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      // 1. Fetch current metadata to avoid overwriting other fields
      const { data: user, error: fetchError } = await supabase.auth.getUser();
      if (fetchError) throw fetchError;

      const currentMeta = user?.user?.user_metadata || {};

      // 2. Update `display_name` in Supabase Auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          ...currentMeta, // Preserve existing metadata
          display_name: username, // Update display name
        },
      });

      if (authError) {
        throw authError;
      }

      // 3. Update the `profiles` table in Supabase
      const updates = {
        id: session.user.id,
        username,
        avatar_url,
        updated_at: new Date(),
      };

      const { error: profileError } = await supabase.from("profiles").upsert(updates);

      if (profileError) {
        throw profileError;
      }

      console.log("Profile updated in `profiles` table");

      // 4. Refresh session to reflect changes
      const { data: refreshedSession, error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError) {
        throw sessionError;
      }

      console.log("🔄 Session refreshed:", refreshedSession);

      Alert.alert("Profile updated successfully!");
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "You need to allow access to change your profile picture.");
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
      await uploadAvatar(result.assets[0].uri);
    }
  }
  
  async function uploadAvatar(uri: string) {
    try {
      setUploading(true);
      if (!session?.user) throw new Error("No user on the session!");
  
      const fileExt = uri.split(".").pop();
      const fileName = `${session.user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
  
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, {
          uri,
          type: `image/${fileExt}`,
          name: fileName,
        });
  
      if (uploadError) throw uploadError;
  
      // Get the new public URL
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
  
      setAvatarUrl(publicUrlData.publicUrl);
  
      // Update profile in database
      await updateProfile({ username, avatar_url: publicUrlData.publicUrl });
  
      Alert.alert("Profile picture updated!");
    } catch (error) {
      Alert.alert("Failed to update profile picture");
    } finally {
      setUploading(false);
    }
  }
  

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Hello, {username || "User"}!</Text>

      <View style={styles.imagePicker}>
        <Image
          source={avatarUrl ? { uri: avatarUrl } : require("../assets/images/default-avatar.png")}
          style={styles.profileImage}
        />
        <TouchableOpacity onPress={pickImage}>
          <AppText style={styles.imagePickerText}>Change Profile Picture</AppText>
        </TouchableOpacity>
      </View>



      {/* Input Fields */}
      
      {/* Email (Read-Only) */}
      <View style={styles.inputContainer}>
        <Input
          placeholder="Email"
          value={session?.user?.email || ""}
          autoCapitalize="none"
          inputContainerStyle={styles.input} 
          placeholderTextColor="#AEB0B5"
          disabled={true} // Read-only email
        />
      </View>

      {/* Username (Editable) */}
      <View style={styles.inputContainer}>
        <Input
          placeholder="Username"
          value={username || ""}
          onChangeText={(text) => setUsername(text)}
          autoCapitalize="none"
          inputContainerStyle={styles.input}
          placeholderTextColor="#AEB0B5"
        />
      </View>

      {/* Update Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Update"
          onPress={() => {
            updateProfile({ username, avatar_url: avatarUrl });
          }}
          disabled={loading}
          buttonStyle={styles.button}
          containerStyle={styles.buttonContainer}
          titleStyle={styles.buttonText}
        />
      </View>

      {/* Sign Out Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Sign Out"
          onPress={handleLogout}
          buttonStyle={styles.buttonOutline}
          containerStyle={styles.buttonContainer}
          titleStyle={styles.buttonOutlineText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 60,
    padding: 12,
    alignItems: "center", // Centers everything
  },
  title: {
    fontSize: 28, // Bigger text for greeting
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    width: "90%", // Makes input full width
    alignSelf: "center",
    marginBottom: 12, // Space between inputs
  },
  input: {
    borderWidth: 1, // Thin border
    borderColor: "#AEB0B5", // Light gray border
    borderRadius: 8, // Rounded corners
    paddingHorizontal: 12, // Padding inside input
    height: 45, // Matches the updated style
    backgroundColor: "white", // White background
  },
  buttonContainer: {
    width: "90%", // Full width buttons
    alignSelf: "center",
    marginBottom: 12, // Space between buttons
  },
  button: {
    backgroundColor: "#0353A4", // Blue background
    borderRadius: 25, // Rounded edges
    paddingVertical: 12, // Padding for better touch area
  },
  buttonOutline: {
    backgroundColor: "transparent", // No background for outlined button
    borderColor: "#0353A4",
    borderWidth: 2,
    borderRadius: 25,
    paddingVertical: 12,
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
    color: "#0353A4", // Blue text for outlined button
    textAlign: "center",
  },
  imagePicker: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8, // Space between image and text
  },
  
  imagePickerText: {
    color: "#0353A4",
    textDecorationLine: "underline",
    fontSize: 16,
  },  
});
