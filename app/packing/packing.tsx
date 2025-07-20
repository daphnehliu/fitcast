import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { AppText } from "@/components/AppText";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getGradientColors } from "@/lib/gradientUtils";
import { useWeather } from "@/context/WeatherContext";

// Helper function to format a Date object to "YYYY-MM-DD" using local date values.
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function PackingInput() {
  const router = useRouter();
  const { weather, isNight, weatherDesc } = useWeather();
  const gradientColors = getGradientColors(weatherDesc, isNight);
  const [destination, setDestination] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [fitcastDescription, setFitcastDescription] = useState("Loading...");

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
        `https://api.api-ninjas.com/v1/city?name=${searchText}`,
        {
          method: "GET",
          headers: {
            "X-Api-Key": "kHi87Nos1QetHeMt5q54RA==wbicP9h0O7S6nxGZ",
          },
        }
      );

      const data = await response.json();
      console.log("API Response:", data);

      if (Array.isArray(data)) {
        const sortedData = data.sort(
          (a, b) => (b.population || 0) - (a.population || 0)
        );
        setSearchResults(sortedData);
      } else {
        console.error("Unexpected API response format:", data);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("API Ninjas City API search failed", error);
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
        startDate: formatLocalDate(startDate),
        endDate: formatLocalDate(endDate),
      },
    });
  };

  // Use local date math to get the default dates at midnight.
  const now = new Date();
  const defaultStartDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  const defaultEndDate = startDate
    ? new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate() + 1
      )
    : new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <AppText type="title" style={styles.header}>
          Plan Your Packing
        </AppText>

        <AppText style={styles.label}>Destination</AppText>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder={destination || "Enter city name..."}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={searchCities}
            returnKeyType="search"
          />
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
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={async () => {
                    try {
                      setDestination(item.name);
                      await AsyncStorage.setItem("destination", item.name);
                      setSearchText("");
                      setSearchResults([]);
                      setShowResults(false);
                      Keyboard.dismiss();
                    } catch (error) {
                      console.error("Error saving destination:", error);
                    }
                  }}
                >
                  <Text style={styles.resultText}>
                    {item.name}, {item.country}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <AppText style={styles.label}>Start Date</AppText>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setStartDatePickerVisible(true)}
        >
          <AppText style={styles.navButtonText}>
            {startDate ? startDate.toDateString() : "Pick Start Date"}
          </AppText>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isStartDatePickerVisible}
          mode="date"
          date={startDate || defaultStartDate}
          minimumDate={defaultStartDate}
          maximumDate={new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000)} // Max 6 days from today
          onConfirm={async (date) => {
            try {
              date.setHours(0, 0, 0, 0);
              setStartDate(date);
              await AsyncStorage.setItem("start_date", formatLocalDate(date));
              setStartDatePickerVisible(false);
            } catch (error) {
              console.error("Error saving start date:", error);
            }
          }}
          onCancel={() => setStartDatePickerVisible(false)}
        />

        <AppText style={styles.label}>End Date</AppText>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setEndDatePickerVisible(true)}
        >
          <AppText style={styles.navButtonText}>
            {endDate ? endDate.toDateString() : "Pick End Date"}
          </AppText>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isEndDatePickerVisible}
          mode="date"
          date={endDate || defaultEndDate}
          minimumDate={startDate || defaultStartDate} // End date can't be before start date
          maximumDate={new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000)} // End date is always within 6 days from today
          onConfirm={async (date) => {
            try {
              date.setHours(0, 0, 0, 0);
              setEndDate(date);
              await AsyncStorage.setItem("end_date", formatLocalDate(date));
              setEndDatePickerVisible(false);
            } catch (error) {
              console.error("Error saving end date:", error);
            }
          }}
          onCancel={() => setEndDatePickerVisible(false)}
        />

        <TouchableOpacity style={styles.navButton} onPress={handleSubmit}>
          <AppText style={styles.navButtonText}>Get Packing List</AppText>
        </TouchableOpacity>
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
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "#fff",
  },
  label: {
    marginTop: 20,
    marginBottom: 10,
    color: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 4,
    marginRight: 10,
  },
  loadingIndicator: {
    marginVertical: 10,
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderRadius: 4,
    marginTop: 10,
    maxHeight: 200,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  resultText: {
    fontSize: 16,
  },
  navButton: {
    backgroundColor: "#0353A4",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#888",
  },
  navButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
