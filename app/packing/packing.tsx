import { useState } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { AppText } from "@/components/AppText";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function PackingInput() {
  const router = useRouter(); // Hook for navigation

  // State variables for form inputs
  const [destination, setDestination] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // State for managing date pickers' visibility
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);

  // State for city search input and results
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to search cities using an API
  const searchCities = async (text: string) => {
    setSearchText(text);

    if (text.length < 3) {
      // Only search if input is at least 3 characters long
      setSearchResults([]);
      return;
    }

    setIsLoading(true);

    try {
      // Fetch cities from OpenStreetMap API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${text}&addressdetails=1&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Nominatim search failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle form submission
  const handleSubmit = () => {
    if (!destination || !startDate || !endDate) {
      // Validate all fields are filled
      alert("Please fill out all fields!");
      return;
    }

    // Navigate to the results page with parameters
    router.push({
      pathname: "/packing/results",
      params: {
        destination,
        startDate: startDate.toISOString().split("T")[0], // Format date
        endDate: endDate.toISOString().split("T")[0],
      },
    });
  };

  return (
    <LinearGradient colors={["#4DC8E7", "#B0E7F0"]} style={styles.gradient}>
      <View style={styles.container}>
        <AppText type="title" style={styles.header}>
          Plan Your Packing
        </AppText>

        {/* City Search Input */}
        <AppText style={styles.label}>Destination</AppText>
        <TextInput
          style={styles.input}
          placeholder="Search for a city..."
          value={searchText}
          onChangeText={searchCities}
        />

        {/* Show loading text while fetching search results */}
        {isLoading && <AppText style={styles.loadingText}>Loading...</AppText>}

        {/* Display city search results */}
        {searchResults.length > 0 && (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.place_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setDestination(item.display_name); // Set selected city
                  setSearchResults([]);
                  setSearchText(item.display_name);
                  Keyboard.dismiss(); // Close keyboard
                }}
                style={styles.resultItem}
              >
                <Text style={styles.resultText}>{item.display_name}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Display selected destination */}
        {destination && (
          <AppText style={styles.selectedText}>Selected: {destination}</AppText>
        )}

        {/* Start Date Picker */}
        <AppText style={styles.label}>Start Date</AppText>
        <Button
          title={startDate ? startDate.toDateString() : "Pick Start Date"}
          onPress={() => setStartDatePickerVisible(true)}
        />
        <DateTimePickerModal
          isVisible={isStartDatePickerVisible}
          mode="date"
          minimumDate={new Date()} // Prevent past dates
          onConfirm={(date) => {
            setStartDate(date);
            setStartDatePickerVisible(false);
          }}
          onCancel={() => setStartDatePickerVisible(false)}
        />

        {/* End Date Picker */}
        <AppText style={styles.label}>End Date</AppText>
        <Button
          title={endDate ? endDate.toDateString() : "Pick End Date"}
          onPress={() => setEndDatePickerVisible(true)}
        />
        <DateTimePickerModal
          isVisible={isEndDatePickerVisible}
          mode="date"
          minimumDate={startDate || new Date()} // End date must be after start date
          onConfirm={(date) => {
            setEndDate(date);
            setEndDatePickerVisible(false);
          }}
          onCancel={() => setEndDatePickerVisible(false)}
        />

        {/* Submit Button */}
        <Button title="Get Packing List" onPress={handleSubmit} />
      </View>
    </LinearGradient>
  );
}

// Styles for the UI components
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    fontSize: 32,
    marginBottom: 24,
    color: "white",
  },
  label: {
    fontSize: 18,
    marginVertical: 8,
    color: "white",
  },
  input: {
    height: 50,
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "black",
  },
  resultItem: {
    backgroundColor: "#fff",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  resultText: {
    color: "black",
  },
  selectedText: {
    fontSize: 16,
    color: "white",
    marginBottom: 8,
  },
  loadingText: {
    color: "white",
  },
});
