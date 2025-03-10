import React, { useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";

const getGradientColors = (
  weatherDesc: string,
  isNight: boolean
): [string, string, ...string[]] => {
  if (!weatherDesc) return ["#4DC8E7", "#B0E7F0"];
  ``;
  if (weatherDesc.includes("Clear")) {
    return isNight ? ["#0B1A42", "#2E4B7A"] : ["#4D92D9", "#B0E7F0"];
  } else if (weatherDesc.includes("Cloud")) {
    return isNight ? ["#2F3E46", "#4B6584"] : ["#B0B0B0", "#90A4AE"];
  } else if (weatherDesc.includes("Rain") || weatherDesc.includes("Snow")) {
    return isNight ? ["#1B262C", "#0F4C75"] : ["#A0ADB9", "#697582"];
  } else if (weatherDesc.includes("Thunderstorm")) {
    return ["#1F1C2C", "#928DAB"];
  } else if (isNight) {
    return ["#0B1A42", "#2E4B7A"];
  }

  return ["#4DC8E7", "#B0E7F0"];
};

export default function PackingInput() {
  const router = useRouter();
  const [gradientColors, setGradientColors] = useState<
    [string, string, ...string[]]
  >(["#4DC8E7", "#B0E7F0"]);
  const [destination, setDestination] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const [isNight, setIsNight] = useState(false);
  const [weatherDesc, setWeatherDesc] = useState("");
  const [fitcastDescription, setFitcastDescription] = useState("Loading...");

  useEffect(() => {
    setGradientColors(getGradientColors(weatherDesc, isNight));
  }, [weatherDesc, isNight]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = "f076a815a1cbbdb3f228968604fdcc7a";
        const response = await fetch(
          `http://api.openweathermap.org/data/2.5/weather?q=Palo%20Alto&appid=${apiKey}&units=imperial`
        );
        const data = await response.json();
        setWeather(data);

        const currentHour = new Date().getHours();
        setIsNight(currentHour < 6 || currentHour > 18);
        const formattedDesc = data.weather[0].description
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        setWeatherDesc(formattedDesc);
      } catch (error) {
        console.error("Error fetching weather: ", error);
      }
    };

    fetchWeather();
  }, []);

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

      // Log the response for debugging
      console.log("API Response:", data);

      // Ensure data is an array before sorting
      if (Array.isArray(data)) {
        // Sort results by population in descending order
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
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
    });
  };

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
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
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={async () => {
                    try {
                      setDestination(item.name);
                      await AsyncStorage.setItem("destination", item.name); // ✅ Correct usage of await
                      setSearchText(""); // Clear input field
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
        <Button
          title={startDate ? startDate.toDateString() : "Pick Start Date"}
          onPress={() => setStartDatePickerVisible(true)}
        />
        <DateTimePickerModal
          isVisible={isStartDatePickerVisible}
          mode="date"
          minimumDate={new Date()} // ✅ Ensures start date is today or later
          maximumDate={new Date(Date.now() + 16 * 24 * 60 * 60 * 1000)} // ✅ Ensures start date is within 16 days from today
          onConfirm={async (date) => {
            try {
              setStartDate(date);
              await AsyncStorage.setItem("start_date", date.toISOString());
              setStartDatePickerVisible(false);
            } catch (error) {
              console.error("Error saving start date:", error);
            }
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
          minimumDate={startDate || new Date()} // ✅ Ensures end date is after start date
          maximumDate={new Date(Date.now() + 16 * 24 * 60 * 60 * 1000)} // ✅ Ensures end date is within 16 days from today
          onConfirm={async (date) => {
            try {
              setEndDate(date);
              await AsyncStorage.setItem("end_date", date.toISOString());
              setEndDatePickerVisible(false);
            } catch (error) {
              console.error("Error saving end date:", error);
            }
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
