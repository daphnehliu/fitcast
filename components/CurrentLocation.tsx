import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, Text, TextInput, Alert, StyleSheet, FlatList } from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, MapEvent } from "react-native-maps";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AppText } from "@/components/AppText";

export default function CurrentLocation({ onClose, onLocationSelect }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ coords: Location.LocationObjectCoords; city?: string } | null>(null);
  const [region, setRegion] = useState<any>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isManual, setIsManual] = useState(false);

  // Reverse geocode to get city name
  const reverseGeocode = async (coords: Location.LocationObjectCoords) => {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (addresses.length > 0) {
        return addresses[0].city || addresses[0].subregion || "Unknown";
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
    return "Unknown";
  };

  // Get current location
  async function handleGetLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Location permission is required.");
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const city = await reverseGeocode(loc.coords);

      setSelectedLocation({ coords: loc.coords, city });
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } catch (error) {
      Alert.alert("Error", "Unable to fetch location.");
    }
  }

  // Search for a location
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery || searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await Location.geocodeAsync(searchQuery);
        const filtered = results.filter((result: any) => result.latitude && result.longitude);

        // **Ensure valid city name resolution**
        const updatedResults = await Promise.all(
          filtered.map(async (result: any) => {
            const coords = { latitude: result.latitude, longitude: result.longitude };
            const city = await reverseGeocode(coords);
            return { ...result, city };
          })
        );

        setSuggestions(updatedResults);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
        setSuggestions([]);
      }
    }, 500);
  }, [searchQuery]);

  // Select a location from search results
  const handleSelectSuggestion = async (result: Location.LocationGeocodedAddress) => {
    const coords = {
      latitude: result.latitude,
      longitude: result.longitude,
      accuracy: 0,
      altitude: 0,
      heading: 0,
      speed: 0,
    };

    const city = await reverseGeocode(coords);

    setSelectedLocation({ coords, city });
    setRegion({
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });

    // **Now ensure proper city name shows**
    setSearchQuery(city || searchQuery);
    setSuggestions([]);
  };

  // Handle manual location confirmation
  function handleConfirm() {
    if (!selectedLocation) {
      Alert.alert("No location selected", "Please select a location.");
      return;
    }
    onLocationSelect(selectedLocation.city || "Unknown"); // Pass correct city name
    onClose(); // Close modal
  }

  // Handle map marker drag
  const handleMarkerDragEnd = async (e: MapEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const coords = { latitude, longitude, accuracy: 0, altitude: 0, heading: 0, speed: 0 };
    const city = await reverseGeocode(coords);

    setSelectedLocation({ coords, city });
    setRegion({
      latitude,
      longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.container}>
        <AppText style={styles.title}>Update Your Location</AppText>

        {!selectedLocation && !isManual && (
          <>
            <TouchableOpacity style={styles.button} onPress={handleGetLocation}>
              <Ionicons name="location-sharp" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Detect My Location</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.manualButton} onPress={() => setIsManual(true)}>
              <Text style={styles.manualButtonText}>Enter location manually</Text>
            </TouchableOpacity>
          </>
        )}

        {isManual && !selectedLocation && (
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
                keyExtractor={(item, index) => `${item.latitude}-${item.longitude}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelectSuggestion(item)}>
                    <AppText style={styles.suggestionText}>{item.city || searchQuery}</AppText>
                  </TouchableOpacity>
                )}
                style={styles.suggestionsList}
              />
            )}
          </>
        )}

        {selectedLocation && (
          <>
            <MapView style={styles.map} region={region}>
              <Marker coordinate={selectedLocation.coords} draggable onDragEnd={handleMarkerDragEnd} />
            </MapView>
            <TouchableOpacity style={styles.button} onPress={handleConfirm}>
              <Text style={styles.buttonText}>Confirm Location</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20 
  },
  button: {
    backgroundColor: "#0353A4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    marginTop: 10,
    borderRadius: 5,
    width: "100%",
  },
  buttonText: { 
    color: "#FFF", 
    fontWeight: "bold" 
  },
  manualButton: { 
    marginTop: 10 
  },
  manualButtonText: { 
    color: "#0353A4", 
    fontWeight: "bold" 
  },
  input: { 
    borderWidth: 1,
    borderColor: "#AEB0B5", 
    padding: 10, 
    width: "100%", 
    marginTop: 10 
  },
  cancelButton: { 
    marginTop: 20 
  },
  cancelButtonText: { 
    color: "grey" 
  },
  map: { 
    width: "100%", 
    height: 200, 
    marginTop: 10 
  },
  suggestionItem: { 
    padding: 10, 
    borderBottomWidth: 1, 
    borderColor: "#EEE" 
  },
  suggestionText: { 
    fontSize: 16, 
    color: "#333" 
  },
  suggestionsList: { 
    width: "100%", 
    maxHeight: 150, 
    backgroundColor: "#FFF", 
    borderRadius: 8 
  },
});

