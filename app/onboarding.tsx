import React, { useState, useEffect, useRef } from "react";
import { AppText } from "@/components/AppText";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  TextInput,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import MapView, { Marker, MapEvent } from "react-native-maps";
import Ionicons from "@expo/vector-icons/Ionicons";

export const unstable_settings = {
  layout: "none",
};

type OnboardingProps = {
  onFinish: (prefs: {
    coldTolerance: number | null;
    items: string[]; // these are the items that the user has selected (with checkmarks)
    prefersLayers: boolean | null;
    location: {
      coords: Location.LocationObjectCoords;
      city?: string;
    } | null;
  }) => void;
};

export default function Onboarding({ onFinish }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [coldTolerance, setColdTolerance] = useState<number | null>(null);
  const [prefersLayers, setPrefersLayers] = useState<boolean | null>(null);
  const [location, setLocation] = useState<{
    coords: Location.LocationObjectCoords;
    city?: string;
  } | null>(null);
  const [region, setRegion] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isManual, setIsManual] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Clothing options and images
  const clothingOptions = [
    "Heavy Jacket",
    "T‑Shirt",
    "Shorts",
    "Pants",
    "Light Jacket",
  ];
  const clothingImages: { [key: string]: any } = {
    "Heavy Jacket": require("../assets/images/jacket.png"),
    "T‑Shirt": require("../assets/images/t-shirt.png"),
    Shorts: require("../assets/images/shorts.png"),
    Pants: require("../assets/images/pants.png"),
    "Light Jacket": require("../assets/images/light-jacket.png"),
  };

  // All clothing items are selected by default; these items get a checkmark.
  const [selectedClothes, setSelectedClothes] = useState<string[]>([
    ...clothingOptions,
  ]);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const toggleClothing = (item: string) => {
    setSelectedClothes((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Called when the user completes onboarding (e.g., after Step 4)
  const handleFinish = () => {
    // Here, instead of computing excluded items, we record the items that have a checkmark.
    onFinish({
      coldTolerance,
      items: selectedClothes, // now passing the selected items
      prefersLayers,
      location,
    });
  };

  // Reverse geocode to get the city name (if available)
  const reverseGeocode = async (coords: Location.LocationObjectCoords) => {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      if (addresses.length > 0) {
        const address = addresses[0];
        return address.city || address.subregion || "Unknown location";
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
    return "Unknown location";
  };

  // Get current device location
  const handleGetLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Location permission is required to continue."
      );
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      const city = await reverseGeocode(loc.coords);
      setLocation({ coords: loc.coords, city });
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } catch (error) {
      Alert.alert("Error", "Unable to fetch location. Please try again.");
    }
  };

  // Search for a location based on the search query.
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery || searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await Location.geocodeAsync(searchQuery);
        const filtered = results.filter((result: any) =>
          result.name || result.city || result.region
        );
        setSuggestions(filtered);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
        setSuggestions([]);
      }
    }, 500);
  }, [searchQuery]);

  // When a suggestion is clicked, update the location and map region.
  const handleSelectSuggestion = async (
    result: Location.LocationGeocodedAddress
  ) => {
    const coords = {
      latitude: result.latitude,
      longitude: result.longitude,
      accuracy: 0,
      altitude: 0,
      heading: 0,
      speed: 0,
    };
    const city =
      result.name || (await reverseGeocode(coords)) || "Unknown location";
    setLocation({ coords, city });
    setRegion({
      latitude: result.latitude,
      longitude: result.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
    setSuggestions([]);
    setSearchQuery(city);
  };

  // When the marker is dragged, update location and re-reverse geocode.
  const handleMarkerDragEnd = async (e: MapEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const coords = {
      latitude,
      longitude,
      accuracy: 0,
      altitude: 0,
      heading: 0,
      speed: 0,
    };
    const city = await reverseGeocode(coords);
    setLocation({ coords, city });
    setRegion({
      latitude,
      longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  return (
    <LinearGradient
      colors={["#4D92D9", "#B0E7F0"]}
      style={styles.gradientContainer}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Step 0: Welcome */}
        {step === 0 && (
          <View style={styles.stepContainer}>
            <Image
              source={require("../assets/images/fitcastWhite.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <AppText style={[styles.title, { fontFamily: "Roboto-Bold" }]}>
              Welcome to FitCast!
            </AppText>
            <AppText style={styles.blurb}>
              FitCast gives you personalized outfit recommendations based on the
              weather.
            </AppText>
            <TouchableOpacity style={styles.navButton} onPress={handleNext}>
              <AppText style={styles.navButtonText}>Get Started</AppText>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 1: Choose Your Location */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            {(isManual || location) && (
              <TouchableOpacity
                onPress={() => {
                  setLocation(null);
                  setRegion(null);
                  setIsManual(false);
                  setSearchQuery("");
                  setSuggestions([]);
                }}
                style={styles.backButton}
              >
                <AppText style={styles.backButtonText}>Back</AppText>
              </TouchableOpacity>
            )}
            <AppText style={styles.locationTitle}>
              Set your location to start
            </AppText>
            <AppText style={styles.locationSubtitle}>
              Explore outfit recommendations around you
            </AppText>
            {!location && !isManual && (
              <>
                <TouchableOpacity
                  style={styles.detectLocationButton}
                  onPress={handleGetLocation}
                >
                  <View style={styles.detectLocationRow}>
                    <Ionicons
                      name="location-sharp"
                      size={20}
                      color="#FFF"
                      style={{ marginRight: 8 }}
                    />
                    <AppText style={styles.detectLocationText}>
                      Detect my location
                    </AppText>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.manualLocationButton}
                  onPress={() => setIsManual(true)}
                >
                  <AppText style={styles.manualLocationText}>
                    Enter location manually
                  </AppText>
                </TouchableOpacity>
              </>
            )}
            {isManual && !location && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Enter city name..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {suggestions.length > 0 && (
                  <FlatList
                    data={suggestions}
                    keyExtractor={(item, index) =>
                      `${item.latitude}-${item.longitude}-${index}`
                    }
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.suggestionItem}
                        onPress={() => handleSelectSuggestion(item)}
                      >
                        <AppText style={styles.suggestionText}>
                          {item.name || item.city || item.region || "Unknown location"}
                        </AppText>
                      </TouchableOpacity>
                    )}
                    style={styles.suggestionsList}
                  />
                )}
              </>
            )}
            {location && (
              <>
                {region && (
                  <MapView style={styles.map} region={region}>
                    <Marker
                      coordinate={{
                        latitude: region.latitude,
                        longitude: region.longitude,
                      }}
                      draggable
                      onDragEnd={handleMarkerDragEnd}
                    />
                  </MapView>
                )}
                <TouchableOpacity style={styles.navButton} onPress={handleNext}>
                  <AppText style={styles.navButtonText}>Confirm Location</AppText>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Step 2: Cold tolerance */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <AppText style={styles.title}>
              How well do you tolerate cold weather?
            </AppText>
            {[
              { label: "I feel cold easily", value: -1 },
              { label: "Neutral", value: 0 },
              { label: "I don’t feel cold easily", value: 1 },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  coldTolerance === option.value && styles.selectedOption,
                ]}
                onPress={() => setColdTolerance(option.value)}
              >
                <AppText style={styles.optionText}>{option.label}</AppText>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.navButton,
                coldTolerance === null && styles.disabledButton,
              ]}
              onPress={handleNext}
              disabled={coldTolerance === null}
            >
              <AppText style={styles.navButtonText}>Next</AppText>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Clothing selection */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <AppText style={styles.title}>
              Select all clothing items that you wear
            </AppText>
            <View style={styles.clothingContainer}>
              {clothingOptions.map((item) => (
                <View key={item} style={styles.clothingItemContainer}>
                  <TouchableOpacity
                    onPress={() => toggleClothing(item)}
                    style={[
                      styles.clothingItem,
                      selectedClothes.includes(item) && styles.selectedOption,
                    ]}
                  >
                    <Image
                      source={clothingImages[item]}
                      style={styles.clothingImage}
                      resizeMode="contain"
                    />
                    {selectedClothes.includes(item) && (
                      <View style={styles.checkMarkContainer}>
                        <AppText style={styles.checkMark}>✓</AppText>
                      </View>
                    )}
                  </TouchableOpacity>
                  <AppText style={styles.clothingLabel}>{item}</AppText>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.navButton} onPress={handleNext}>
              <AppText style={styles.navButtonText}>Next</AppText>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 4: Layering preference */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <AppText style={styles.title}>
              Do you prefer layering clothes?
            </AppText>
            <TouchableOpacity
              style={[
                styles.optionButton,
                prefersLayers === true && styles.selectedOption,
              ]}
              onPress={() => setPrefersLayers(true)}
            >
              <AppText style={styles.optionText}>Yes</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                prefersLayers === false && styles.selectedOption,
              ]}
              onPress={() => setPrefersLayers(false)}
            >
              <AppText style={styles.optionText}>No</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.navButton,
                prefersLayers === null && styles.disabledButton,
              ]}
              onPress={handleFinish}
              disabled={prefersLayers === null}
            >
              <AppText style={styles.navButtonText}>Finish</AppText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  stepContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 27,
    fontFamily: "Roboto-Bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#FFF",
  },
  blurb: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    color: "#FFF",
  },
  navButton: {
    backgroundColor: "#0353A4",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
  },
  navButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#888",
  },
  locationTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 5,
    textAlign: "center",
  },
  locationSubtitle: {
    fontSize: 16,
    color: "#FFF",
    marginBottom: 30,
    textAlign: "center",
  },
  detectLocationButton: {
    width: "80%",
    backgroundColor: "#49B54A",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  detectLocationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detectLocationText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  manualLocationButton: {
    width: "80%",
    backgroundColor: "transparent",
    padding: 15,
    borderRadius: 8,
    borderColor: "#FFF",
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 10,
  },
  manualLocationText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    width: "80%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#FFF",
    borderRadius: 8,
    color: "#FFF",
    marginVertical: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  suggestionsList: {
    width: "80%",
    maxHeight: 150,
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginBottom: 10,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  suggestionText: {
    fontSize: 16,
    color: "#333",
  },
  optionButton: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#FFF",
    borderRadius: 8,
    width: 250,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  selectedOption: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 2,
    borderColor: "#B0E7F0",
  },
  optionText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
  },
  clothingContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  clothingItemContainer: {
    alignItems: "center",
    margin: 10,
  },
  clothingItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 1,
    borderColor: "#FFF",
  },
  clothingImage: {
    width: 70,
    height: 70,
  },
  clothingLabel: {
    marginTop: 5,
    fontSize: 14,
    color: "#FFF",
    textAlign: "center",
  },
  checkMarkContainer: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4A90E2",
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "bold",
  },
  map: {
    width: Dimensions.get("window").width - 40,
    height: 200,
    marginVertical: 20,
  },
});

export { Onboarding };
