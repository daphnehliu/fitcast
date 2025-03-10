import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppText } from "@/components/AppText";

const { width } = Dimensions.get("window");
const API_KEY = "f076a815a1cbbdb3f228968604fdcc7a";
const WEATHERSTACK_API_KEY = "92f198eb4b10f922157df578957e290a";

const packingItems = [
  {
    icon: require("../../assets/images/jacket.png"),
    label: "Jacket",
    count: 2,
  },
  { icon: require("../../assets/images/pants.png"), label: "Pants", count: 3 },
  {
    icon: require("../../assets/images/t-shirt.png"),
    label: "T-Shirts",
    count: 4,
  },
  {
    icon: require("../../assets/images/umbrella.png"),
    label: "Umbrella",
    count: 1,
  },
];

export default function PackingPage() {
  const [destination, setDestination] = useState("Loading...");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [weatherForecast, setWeatherForecast] = useState<any[]>([]);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedDestination = await AsyncStorage.getItem("destination");
        const storedStartDate = await AsyncStorage.getItem("start_date");
        const storedEndDate = await AsyncStorage.getItem("end_date");

        if (storedDestination) {
          setDestination(storedDestination);
          fetchCoordinates(storedDestination); // ✅ Fetch coordinates after setting destination
        }
        if (storedStartDate)
          setStartDate(new Date(storedStartDate).toDateString());
        if (storedEndDate) setEndDate(new Date(storedEndDate).toDateString());
      } catch (error) {
        console.error("Error retrieving data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchCoordinates = async (city) => {
    try {
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
      );
      const geoData = await geoResponse.json();

      if (!geoData || geoData.length === 0) {
        console.error("❌ Geocoding API returned no results.");
        return;
      }

      const truncatedLat = parseFloat(geoData[0].lat.toFixed(2));
      const truncatedLon = parseFloat(geoData[0].lon.toFixed(2));

      setLat(truncatedLat);
      setLon(truncatedLon);
      console.log(
        "(NOBRIDGE) LOG City Coordinates:",
        truncatedLat,
        truncatedLon
      );

      // ✅ Call fetchWeatherForecast AFTER setting lat/lon
      fetchWeatherForecast(truncatedLat, truncatedLon);
    } catch (error) {
      console.error("❌ Error fetching coordinates:", error);
    }
  };

  const fetchWeatherForecast = async (lat, lon) => {
    if (!lat || !lon) {
      console.error("❌ fetchWeatherForecast NOT running: lat/lon missing!");
      return;
    }

    console.log(
      `(NOBRIDGE) LOG fetchWeatherForecast started with lat: ${lat}, lon: ${lon}`
    );

    try {
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      const weatherData = await weatherResponse.json();

      // 🚨 Log full response
      console.log(
        "(NOBRIDGE) LOG Full Weather API Response:",
        JSON.stringify(weatherData, null, 2)
      );

      // Check if data exists
      if (!weatherData.daily || !weatherData.daily.time) {
        console.error(
          "❌ Weather API returned invalid data. Response:",
          weatherData
        );
        return;
      }

      // Convert API response into an array
      const forecastArray = weatherData.daily.time.map((date, index) => ({
        date,
        maxTemp: weatherData.daily.temperature_2m_max[index],
        minTemp: weatherData.daily.temperature_2m_min[index],
      }));

      // Log each day's forecast
      forecastArray.forEach((day, index) => {
        console.log(
          `(NOBRIDGE) LOG Day ${index + 1}: ${day.date} - 🌡 Max: ${
            day.maxTemp
          }°C, Min: ${day.minTemp}°C`
        );
      });

      setWeatherForecast(forecastArray);
    } catch (error) {
      console.error("❌ Error fetching weather forecast:", error);
    }
  };

  return (
    <LinearGradient colors={["#4DC8E7", "#B0E7F0"]} style={styles.gradient}>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#FFFFFF"
            style={styles.loader}
          />
        ) : (
          <>
            <View style={styles.headerContainer}>
              <AppText type="title" style={styles.header}>
                Packing for {destination}
              </AppText>
              <AppText style={styles.dateText}>
                {startDate} - {endDate}
              </AppText>
            </View>

            <AppText type="defaultSemiBold" style={styles.timelineHeader}>
              Trip Timeline
            </AppText>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.timelineContainer}
            >
              {[startDate, endDate].map((date, index) => (
                <View key={index} style={styles.timelineItem}>
                  <AppText style={styles.dateText}>{date}</AppText>
                  <Image
                    source={require("../../assets/images/jacket.png")}
                    style={styles.timelineIcon}
                  />
                  <Image
                    source={require("../../assets/images/pants.png")}
                    style={styles.timelineIcon}
                  />
                </View>
              ))}
            </ScrollView>
            <AppText type="defaultSemiBold" style={styles.packingListHeader}>
              Packing List
            </AppText>
            <FlatList
              data={packingItems}
              numColumns={2}
              keyExtractor={(item) => item.label}
              renderItem={({ item }) => (
                <View style={styles.packingItem}>
                  <Image source={item.icon} style={styles.icon} />
                  <Text style={styles.packingText}>
                    {item.label} x{item.count}
                  </Text>
                </View>
              )}
            />
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1, justifyContent: "center" },
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loader: { marginTop: 50 },

  headerContainer: { marginTop: 50, alignItems: "center" },
  header: {
    fontSize: 30,
    color: "white",
    marginBottom: 5,
    textAlign: "center",
  },
  dateText: { fontSize: 18, color: "white", marginBottom: 15 },

  timelineHeader: {
    fontSize: 22,
    color: "white",
    marginBottom: 10,
    textAlign: "center",
  },
  timelineContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  timelineItem: {
    alignItems: "center",
    marginHorizontal: 15,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
  },
  timelineIcon: { width: 50, height: 50, margin: 5, resizeMode: "contain" },

  packingListHeader: {
    fontSize: 22,
    color: "white",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  packingItem: { alignItems: "center", margin: 10, flex: 1 },
  icon: { width: 60, height: 60, resizeMode: "contain" },
  packingText: { color: "white", fontSize: 18, marginTop: 5 },
  weatherItem: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  tempText: { fontSize: 20, fontWeight: "bold", color: "white" },
  descText: { fontSize: 16, color: "white", fontStyle: "italic" },
});
