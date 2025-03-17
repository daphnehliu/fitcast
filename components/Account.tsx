import { useState, useEffect, SetStateAction } from "react";
import { supabase } from "../lib/supabase";
import { StyleSheet, View, Alert, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { Button, Input } from "@rneui/themed";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { AppText } from "@/components/AppText";
import DropDownPicker from "react-native-dropdown-picker";
DropDownPicker.setListMode("SCROLLVIEW")
import Ionicons from "@expo/vector-icons/Ionicons";
import CurrentLocation from "@/components/CurrentLocation";


export default function Account({ session }: { session: Session }) {
  // states
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [location, setLocation] = useState<string>("No location set"); // Location from Supabase
  const [tempLocation, setTempLocation] = useState<string | null>(null); // Temporary location before saving
  const [showLocationModal, setShowLocationModal] = useState(false); // Controls location modal visibility

  

  const [open, setOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);

  
  const [coldTolerance, setColdTolerance] = useState<number | null>(null);
  const [prefersLayers, setPrefersLayers] = useState<boolean | null>(null);
  const [layerOptions, setLayerOptions] = useState([
    { label: "Yes", value: true },
    { label: "No", value: false },
  ]);

  const [items, setItems] = useState([
    { label: "I feel cold easily", value: -1 },
    { label: "Neutral", value: 0 },
    { label: "I don't feel cold easily", value: 1 },
  ]);

  const [clothingItems, setClothingItems] = useState<string[]>([]);
  const [clothingOpen, setClothingOpen] = useState(false);
  const [clothingOptions, setClothingOptions] = useState([
    { label: "Heavy Jacket", value: "Heavy Jacket", type: "top" },
    { label: "Shirt", value: "T‑Shirt", type: "top" },
    { label: "Pants", value: "Pants", type: "bottom" },
    { label: "Shorts", value: "Shorts", type: "bottom" },
    { label: "Light Jacket", value: "Light Jacket", type: "top" },
  ]);

  // Helper function to validate clothing selection
  const validateClothingSelection = (items: string[]) => {
    // Check for pants
    const hasPants = items.includes("Pants");
    
    // Check for T-Shirt
    const hasShirt = items.includes("T‑Shirt");
    
    // Check for at least one jacket
    const hasJacket = items.some(item => 
      item === "Heavy Jacket" || item === "Light Jacket"
    );

    return hasPants && hasShirt && hasJacket;
  };

  // logout function
  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert("Logout error", error.message);
        return;
      }

      // Navigate to index after successful logout
      router.replace("/");
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Logout error", "An unexpected error occurred during logout.");
    }
  }

  useEffect(() => {
    if (router.query?.newLocation) {
      setTempLocation(router.query.newLocation as string);
    }
  }, [router.query?.newLocation]);  

  useEffect(() => {
    if (session) {
      getUserData();
    }
  }, [session]);
  
  async function getUserData() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");
  
      console.log("User ID:", session?.user?.id);
  
      // Fetch Profile and Preferences Simultaneously
      const [{ data: profileData, error: profileError }, { data: preferencesData, error: preferencesError }] = await Promise.all([
        supabase.from("profiles").select("username, avatar_url, location").eq("id", session.user.id).single(),
        supabase.from("initial_preferences").select("cold_tolerance, prefers_layers, items").eq("user_id", session.user.id).limit(1),
      ]);
  
      console.log("Profile data:", profileData);
      console.log("Preferences data:", preferencesData);
  
      // Handle Errors
      if (profileError && profileError.status !== 406) throw profileError;
      if (preferencesError && preferencesError.code !== "PGRST116") throw preferencesError;
  
      // Update States
      if (profileData) {
        setUsername(profileData.username);
        setAvatarUrl(profileData.avatar_url);
        setLocation(profileData.location || "No location set");
      }
      if (preferencesData?.length > 0) {
        const preferences = preferencesData[0]; // Get the first (and only) entry
        setColdTolerance(preferences.cold_tolerance ?? 0); // Default to 0
        setClothingItems(preferences.items || []); // Load clothing items
        setPrefersLayers(preferences.prefers_layers ?? null); // Ensure boolean or null
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }
  
  
  async function updateAccount() {
    try {
      if (!session?.user) throw new Error("No user on the session!");
  
      // Validate clothing selection
      if (!validateClothingSelection(clothingItems)) {
        Alert.alert(
          "Invalid Selection",
          "Please select pants, a T-shirt, and at least one jacket (heavy or light)."
        );
        return;
      }
  
      setLoading(true);
  
      // Update Profile in Supabase
      const updates = {
        id: session.user.id,
        username,
        avatar_url: avatarUrl,
        location: tempLocation || location, // Save temp location if changed
        updated_at: new Date(),
      };
  
      const { error: profileError } = await supabase.from("profiles").upsert(updates);
      if (profileError) throw profileError;
  
      console.log("Profile updated in `profiles` table");
  
      // Update Preferences in Supabase (ensures only one row per user)
      const { error: preferencesError } = await supabase.from("initial_preferences").upsert({
        user_id: session.user.id,
        cold_tolerance: coldTolerance,
        prefers_layers: prefersLayers, // Added layering preference
        items: clothingItems,
      }, { onConflict: ['user_id'] }); // Ensures one entry per user
  
      if (preferencesError) throw preferencesError;
  
      console.log("Preferences updated in `initial_preferences` table");
  
      // Refresh session to reflect changes
      const { error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError) throw sessionError;
  
      console.log("Session refreshed successfully!");
  
      // Show only ONE success alert
      Alert.alert("Updated!", "Your profile and preferences updated successfully :)");
    } catch (error) {
      console.error("Error updating account:", error);
      // Show only ONE error alert
      Alert.alert("Update Failed", "Could not update your profile and preferences.");
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
      await updateAccount();
  
      Alert.alert("Profile picture updated!");
    } catch (error) {
      Alert.alert("Failed to update profile picture");
    } finally {
      setUploading(false);
    }
  }

  function handleUpdateLocation() {
    setShowLocationModal(true); // Open modal instead of navigating
  }  

  const handleColdToleranceOpen = (value: SetStateAction<boolean>) => {
    setOpen(value);
    if (value) {
      setLayersOpen(false);
      setClothingOpen(false);
    }
  };

  const handleLayersOpen = (value: SetStateAction<boolean>) => {
    setLayersOpen(value);
    if (value) {
      setOpen(false);
      setClothingOpen(false);
    }
  };

  const handleClothingOpen = (value: SetStateAction<boolean>) => {
    setClothingOpen(value);
    if (value) {
      setOpen(false);
      setLayersOpen(false);
    }
  };

  return (
    <View style={styles.fullScreen}>
      {showLocationModal ? (
        <CurrentLocation
          onClose={() => setShowLocationModal(false)}
          onLocationSelect={(newLocation) => {
            setTempLocation(newLocation);
            setShowLocationModal(false);
          }}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <View>
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

            <View style={styles.inputContainer}>
              <TouchableOpacity onPress={handleUpdateLocation} style={styles.locationBox}>
                <Ionicons name="location-outline" size={20} color="#0353A4" style={styles.locationIcon} />
                <Text style={styles.locationText}>{tempLocation || location}</Text>
                <Text style={styles.updateText}>Change</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.inputContainer, { zIndex: layersOpen ? 1 : 2 }]}>
              <AppText style={styles.label}>Cold Tolerance</AppText>
              <DropDownPicker
                open={open}
                value={coldTolerance ?? 0}
                items={[
                  { label: "I feel cold easily", value: -1 },
                  { label: "Neutral", value: 0 },
                  { label: "I don't feel cold easily", value: 1 },
                ]}
                setOpen={handleColdToleranceOpen}
                setValue={setColdTolerance}
                containerStyle={{ zIndex: layersOpen ? 1 : 2 }}
                style={styles.dropdown}
              />
            </View>


            <View style={[styles.inputContainer, { zIndex: open ? 1 : 2 }]}>
              <AppText style={styles.label}>Do you prefer layering?</AppText>
              <DropDownPicker
                open={layersOpen}
                value={prefersLayers}
                items={layerOptions}
                setOpen={handleLayersOpen}
                setValue={setPrefersLayers}
                containerStyle={{ zIndex: open ? 1 : 2 }}
                style={styles.dropdown}
              />
            </View>

            <View style={[styles.inputContainer, { zIndex: open || layersOpen ? 1 : 2 }]}>
              <AppText style={styles.label}>Clothing Items</AppText>
              <AppText style={styles.sublabel}>Must select pants, shirt, and at least one jacket</AppText>
              <DropDownPicker
                open={clothingOpen}
                value={clothingItems}
                items={clothingOptions}
                setOpen={handleClothingOpen}
                setValue={setClothingItems}
                multiple={true}
                min={2}
                mode="BADGE"
                badgeDotColors={["#0353A4"]}
                containerStyle={{ zIndex: open || layersOpen ? 1 : 2 }}
                style={styles.dropdown}
                listItemLabelStyle={styles.dropdownItemLabel}
              />
            </View>

            {/* Update Button */}
            <View style={styles.buttonContainer}>
              <Button
                title="Update"
                onPress={updateAccount}
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
        </ScrollView>   
        )}
    </View> 
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1, 
    backgroundColor: "white",
  },
  container: {
    marginTop: 60,
    padding: 12,
    paddingBottom: 40,
    minHeight: '100%',
  },
  title: {
    fontSize: 28, // Bigger text for greeting
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
    paddingHorizontal: 10,
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
    marginTop: 10, // Space between buttons
    width: "90%", // Full width buttons
    alignSelf: "center",
  },
  button: {
    backgroundColor: "#0353A4", // Blue background
    borderRadius: 25, // Rounded edges
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
  
  dropdown: {
    borderWidth: 1,
    width: "95%",
    borderColor: "#AEB0B5",
    borderRadius: 8,
    backgroundColor: "white",
    alignSelf: "center", // Ensures it's centered
    marginBottom: 12, // Adds space between dropdowns
  },
  
  dropdownList: {
    backgroundColor: "white",
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333", // Darker text for contrast
    marginBottom: 5,
    alignSelf: "flex-start", // Ensures it aligns with the input fields
    paddingLeft: 10, // Adds slight padding for alignment
    marginTop: 5, // Adds space between dropdowns
  },
  
  locationBox: {
    width: "95%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#AEB0B5",
    borderRadius: 8,
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 12,
    alignSelf: "center",
  },
  
  locationIcon: {
    marginRight: 10,
  },
  
  locationText: {
    flex: 1, // Ensures text takes up remaining space
    fontSize: 16,
    color: "#333",
  },
  
  updateText: {
    fontSize: 16,
    color: "#0353A4",
    fontWeight: "bold",
  },

  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  
  sublabel: {
    fontSize: 14,
    color: "#666",
    alignSelf: "flex-start",
    paddingLeft: 10,
    marginBottom: 5,
  },
  dropdownItemLabel: {
    color: "#333",
  },
});
