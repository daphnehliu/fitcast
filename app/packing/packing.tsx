import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
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
  const [showResults, setShowResults] = useState(false);

  const searchCities = async () => {
    if (searchText.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setShowResults(true);

    try {
      const response = await fetch(
        `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${searchText}&sort=-population`,
        {
          method: "GET",
          headers: {
            "X-RapidAPI-Key":
              "1eb3f6b396msh26aac4e7e576b72p19e0c9jsn6ae4bc08fde6",
            "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
          },
        }
      );
      const data = await response.json();
      setSearchResults(data.data || []);
    } catch (error) {
      console.error("GeoDB Cities API search failed", error);
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

        <AppText style={styles.label}>Destination</AppText>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter city name..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={searchCities}
            returnKeyType="search"
          />
          <Button title="Search" onPress={searchCities} />
        </View>

        {isLoading && (
          <ActivityIndicator
            size="small"
            color="white"
            style={styles.loadingIndicator}
          />
        )}

        {showResults && searchResults.length > 0 && (
          <View style={styles.dropdownContainer}>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setDestination(item.city);
                    setSearchResults([]);
                    setShowResults(false);
                    Keyboard.dismiss();
                  }}
                  style={styles.resultItem}
                >
                  <Text style={styles.resultText}>
                    {item.city}, {item.country}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {destination && (
          <AppText style={styles.selectedText}>Selected: {destination}</AppText>
        )}

        <AppText style={styles.label}>Start Date</AppText>
        <Button
          title={startDate ? startDate.toDateString() : "Pick Start Date"}
          onPress={() => setStartDatePickerVisible(true)}
        />
        <DateTimePickerModal
          isVisible={isStartDatePickerVisible}
          mode="date"
          minimumDate={new Date()}
          onConfirm={(date) => {
            setStartDate(date);
            setStartDatePickerVisible(false);
          }}
          onCancel={() => setStartDatePickerVisible(false)}
        />

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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "black",
    marginRight: 10,
  },
  dropdownContainer: {
    maxHeight: 150,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  resultText: {
    color: "black",
  },
  loadingIndicator: {
    marginVertical: 10,
  },
});
