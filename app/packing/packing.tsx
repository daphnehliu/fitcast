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
  const router = useRouter();

  const [destination, setDestination] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchCities = async (text: string) => {
    setSearchText(text);

    if (text.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);

    try {
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

  const handleSubmit = () => {
    if (!destination || !startDate || !endDate) {
      alert("Please fill out all fields!");
      return;
    }

    router.push({
      pathname: "/packing/results",
      params: {
        destination,
        startDate: startDate.toISOString().split("T")[0],
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

        {/* City Search */}
        <AppText style={styles.label}>Destination</AppText>
        <TextInput
          style={styles.input}
          placeholder="Search for a city..."
          value={searchText}
          onChangeText={searchCities}
        />

        {isLoading && <AppText style={styles.loadingText}>Loading...</AppText>}

        {searchResults.length > 0 && (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.place_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setDestination(item.display_name);
                  setSearchResults([]);
                  setSearchText(item.display_name);
                  Keyboard.dismiss();
                }}
                style={styles.resultItem}
              >
                <Text style={styles.resultText}>{item.display_name}</Text>
              </TouchableOpacity>
            )}
          />
        )}

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
          minimumDate={new Date()} // ✅ Prevents past dates
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
          minimumDate={startDate || new Date()}
          onConfirm={(date) => {
            setEndDate(date);
            setEndDatePickerVisible(false);
          }}
          onCancel={() => setEndDatePickerVisible(false)}
        />

        {/* Submit */}
        <Button title="Get Packing List" onPress={handleSubmit} />
      </View>
    </LinearGradient>
  );
}

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
