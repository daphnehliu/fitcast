import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppText } from "@/components/AppText";

const { width } = Dimensions.get("window");
const API_KEY = "f076a815a1cbbdb3f228968604fdcc7a";

// ----- Helper: Convert Celsius to Fahrenheit -----
const toFahrenheit = (tempC) => Math.round((tempC * 9) / 5 + 32);

// ----- Helper: Determine clothing items for a given day's forecast -----
// Assumes forecast temperatures are in Celsius.
// Example thresholds:
// - Always add a T‑shirt (for packing list aggregation).
// - If maxTemp < 10°C, add Heavy Jacket.
// - Else if maxTemp < 18°C, add Light Jacket.
// - For bottoms: if maxTemp >= 24°C then Shorts, else Pants.
// - Add Umbrella if description mentions "Rain", "Drizzle" or "Thunderstorm".
function getClothingItemsForDay(forecast) {
  const items = [];
  // Always add T-Shirt (for packing list aggregation)
  items.push({
    type: "tshirt",
    label: "T-Shirt",
    icon: require("../../assets/images/t-shirt.png"),
  });
  // Jacket logic
  if (forecast.maxTemp < 10) {
    items.push({
      type: "heavyJacket",
      label: "Heavy Jacket",
      icon: require("../../assets/images/jacket.png"),
    });
  } else if (forecast.maxTemp < 18) {
    items.push({
      type: "lightJacket",
      label: "Light Jacket",
      icon: require("../../assets/images/light-jacket.png"),
    });
  }
  // Bottoms logic
  if (forecast.maxTemp >= 24) {
    items.push({
      type: "shorts",
      label: "Shorts",
      icon: require("../../assets/images/shorts.png"),
    });
  } else {
    items.push({
      type: "pants",
      label: "Pants",
      icon: require("../../assets/images/pants.png"),
    });
  }
  // Umbrella logic: if forecast description mentions rain.
  const rainKeywords = ["Rain", "Drizzle", "Thunderstorm", "Showers"];
  if (rainKeywords.some((kw) => forecast.description.includes(kw))) {
    items.push({
      type: "umbrella",
      label: "Umbrella",
      icon: require("../../assets/images/umbrella.png"),
    });
  }
  return items;
}

// ----- Main Component -----
export default function PackingPage() {
  const [destination, setDestination] = useState("Loading...");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [weatherForecast, setWeatherForecast] = useState([]);
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
          fetchCoordinates(storedDestination);
        }
        if (storedStartDate)
          // Append "T00:00:00" to parse as local midnight
          setStartDate(new Date(storedStartDate + "T00:00:00").toDateString());
        if (storedEndDate)
          setEndDate(new Date(storedEndDate + "T00:00:00").toDateString());
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
      console.log("City Coordinates:", truncatedLat, truncatedLon);

      fetchWeatherForecast(truncatedLat, truncatedLon);
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    }
  };

  const fetchWeatherForecast = async (lat, lon) => {
    if (!lat || !lon) {
      console.error("❌ fetchWeatherForecast NOT running: lat/lon missing!");
      return;
    }

    try {
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
      );
      const weatherData = await weatherResponse.json();

      if (!weatherData.daily || !weatherData.daily.time) {
        console.error("❌ Weather API returned invalid data.", weatherData);
        return;
      }

      // Map weather codes to descriptions
      const weatherCodeToDescription = {
        0: "Clear",
        1: "Mostly Clear",
        2: "Partly Cloudy",
        3: "Cloudy",
        45: "Foggy",
        48: "Freezing Fog",
        51: "Drizzle",
        53: "Light Rain",
        55: "Heavy Rain",
        61: "Rainy",
        63: "Moderate Rain",
        65: "Heavy Rain",
        71: "Snow",
        73: "Moderate Snow",
        75: "Heavy Snow",
        80: "Scattered Showers",
        81: "Rain Showers",
        82: "Thunderstorms",
      };

      // Build forecast array (temperatures in Celsius)
      const forecastArray = weatherData.daily.time.map((date, index) => ({
        date,
        maxTemp: weatherData.daily.temperature_2m_max[index],
        minTemp: weatherData.daily.temperature_2m_min[index],
        description:
          weatherCodeToDescription[weatherData.daily.weathercode[index]] ||
          "Unknown",
      }));

      forecastArray.forEach((day, index) => {
        console.log(
          `Day ${index + 1}: ${day.date} - Max: ${day.maxTemp}°C, Min: ${
            day.minTemp
          }°C, Weather: ${day.description}`
        );
      });

      setWeatherForecast(forecastArray);
    } catch (error) {
      console.error("Error fetching weather forecast:", error);
    }
  };

  // Generates an array of Date objects between start and end.
  const generateDateRange = (start, end) => {
    if (!start || !end) return [];
    let currentDate = new Date(start);
    const endDateObj = new Date(end);
    const dateArray = [];
    while (currentDate <= endDateObj) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
  };

  // Compute aggregated clothing counts from timeline days.
  // For heavy jacket, if needed on any day, count is 1.
  const timelineDates = generateDateRange(startDate, endDate);
  const aggregatedCounts = {
    tshirt: 0,
    heavyJacket: 0,
    lightJacket: 0,
    pants: 0,
    shorts: 0,
    umbrella: 0,
  };

  timelineDates.forEach((day) => {
    const forecast = weatherForecast.find(
      (d) => d.date === day.toISOString().split("T")[0]
    );
    if (forecast) {
      const items = getClothingItemsForDay(forecast);
      items.forEach((item) => {
        if (item.type === "heavyJacket") {
          aggregatedCounts.heavyJacket = 1; // Only need one heavy jacket.
        } else {
          aggregatedCounts[item.type] += 1;
        }
      });
    }
  });

  // Build packing list items array, filtering out any with count 0.
  const packingListItems = [
    {
      type: "tshirt",
      label: "T-Shirt",
      icon: require("../../assets/images/t-shirt.png"),
      count: aggregatedCounts.tshirt,
    },
    {
      type: "heavyJacket",
      label: "Heavy Jacket",
      icon: require("../../assets/images/jacket.png"),
      count: aggregatedCounts.heavyJacket,
    },
    {
      type: "lightJacket",
      label: "Light Jacket",
      icon: require("../../assets/images/light-jacket.png"),
      count: aggregatedCounts.lightJacket,
    },
    {
      type: "pants",
      label: "Pants",
      icon: require("../../assets/images/pants.png"),
      count: aggregatedCounts.pants,
    },
    {
      type: "shorts",
      label: "Shorts",
      icon: require("../../assets/images/shorts.png"),
      count: aggregatedCounts.shorts,
    },
    {
      type: "umbrella",
      label: "Umbrella",
      icon: require("../../assets/images/umbrella.png"),
      count: aggregatedCounts.umbrella,
    },
  ].filter((item) => item.count > 0);

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
            <FlatList
              data={timelineDates}
              horizontal
              keyExtractor={(item) => item.toISOString()}
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.timelineContainer}
              renderItem={({ item }) => {
                const forecast = weatherForecast.find(
                  (day) => day.date === item.toISOString().split("T")[0]
                );
                let clothingItems = [];
                if (forecast) {
                  clothingItems = getClothingItemsForDay(forecast);
                }
                const umbrellaPresent = clothingItems.some(
                  (ci) => ci.type === "umbrella"
                );
                if (umbrellaPresent) {
                  // Filter out umbrella for the vertical stack.
                  const nonUmbrellaItems = clothingItems.filter(
                    (ci) => ci.type !== "umbrella"
                  );
                  // Separate non-umbrella items into top and bottom.
                  let topItems = nonUmbrellaItems.filter(
                    (ci) => ci.type !== "pants" && ci.type !== "shorts"
                  );
                  if (
                    topItems.some(
                      (ci) =>
                        ci.type === "heavyJacket" || ci.type === "lightJacket"
                    )
                  ) {
                    topItems = topItems.filter((ci) => ci.type !== "tshirt");
                  }
                  const bottomItems = nonUmbrellaItems.filter(
                    (ci) => ci.type === "pants" || ci.type === "shorts"
                  );
                  // Get the umbrella item.
                  const umbrellaItem = clothingItems.find(
                    (ci) => ci.type === "umbrella"
                  );
                  return (
                    <View style={styles.timelineItem}>
                      <AppText style={styles.dateText}>
                        {item.toDateString().split(" ").slice(0, 3).join(" ")}
                      </AppText>
                      <View style={styles.umbrellaLayoutContainer}>
                        <View style={styles.verticalStack}>
                          <View style={styles.topRow}>
                            {topItems.map((clothing, index) => (
                              <View key={index} style={styles.clothingItem}>
                                <Image
                                  source={clothing.icon}
                                  style={styles.clothingIcon}
                                />
                              </View>
                            ))}
                          </View>
                          <View style={styles.bottomRow}>
                            {bottomItems.map((clothing, index) => (
                              <View key={index} style={styles.clothingItem}>
                                <Image
                                  source={clothing.icon}
                                  style={styles.clothingIcon}
                                />
                              </View>
                            ))}
                          </View>
                        </View>
                        <View style={styles.umbrellaContainer}>
                          <Image
                            source={umbrellaItem.icon}
                            style={styles.umbrellaIcon}
                          />
                        </View>
                      </View>
                      {forecast ? (
                        <View style={styles.weatherInfo}>
                          <Text style={styles.tempText}>
                            {toFahrenheit(forecast.maxTemp)}°F /{" "}
                            {toFahrenheit(forecast.minTemp)}°F
                          </Text>
                          <Text style={styles.descText}>
                            {forecast.description}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.descText}>Loading...</Text>
                      )}
                    </View>
                  );
                } else {
                  // Regular layout (no umbrella)
                  let topItems = clothingItems.filter(
                    (ci) => ci.type !== "pants" && ci.type !== "shorts"
                  );
                  if (
                    topItems.some(
                      (ci) =>
                        ci.type === "heavyJacket" || ci.type === "lightJacket"
                    )
                  ) {
                    topItems = topItems.filter((ci) => ci.type !== "tshirt");
                  }
                  const bottomItems = clothingItems.filter(
                    (ci) => ci.type === "pants" || ci.type === "shorts"
                  );
                  return (
                    <View style={styles.timelineItem}>
                      <AppText style={styles.dateText}>
                        {item.toDateString().split(" ").slice(0, 3).join(" ")}
                      </AppText>
                      <View style={styles.topRow}>
                        {topItems.map((clothing, index) => (
                          <View key={index} style={styles.clothingItem}>
                            <Image
                              source={clothing.icon}
                              style={styles.clothingIcon}
                            />
                          </View>
                        ))}
                      </View>
                      <View style={styles.bottomRow}>
                        {bottomItems.map((clothing, index) => (
                          <View key={index} style={styles.clothingItem}>
                            <Image
                              source={clothing.icon}
                              style={styles.clothingIcon}
                            />
                          </View>
                        ))}
                      </View>
                      {forecast ? (
                        <View style={styles.weatherInfo}>
                          <Text style={styles.tempText}>
                            {toFahrenheit(forecast.maxTemp)}°F /{" "}
                            {toFahrenheit(forecast.minTemp)}°F
                          </Text>
                          <Text style={styles.descText}>
                            {forecast.description}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.descText}>Loading...</Text>
                      )}
                    </View>
                  );
                }
              }}
            />

            <AppText type="defaultSemiBold" style={styles.packingListHeader}>
              Packing List
            </AppText>
            <View style={styles.packingListContainer}>
              {packingListItems.map((item) => (
                <View key={item.type} style={styles.packingItem}>
                  <Image source={item.icon} style={styles.icon} />
                  <Text style={styles.packingText}>
                    {item.label} x {item.count}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "flex-start",
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
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
    width: 150,
    height: 250,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 5,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  clothingItem: {
    alignItems: "center",
    marginHorizontal: 5,
  },
  clothingIcon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  umbrellaLayoutContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  verticalStack: {
    flexDirection: "column",
    justifyContent: "center",
  },
  umbrellaContainer: {
    marginLeft: 10,
  },
  umbrellaIcon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  weatherInfo: { marginTop: 5, alignItems: "center" },
  tempText: { fontSize: 16, fontWeight: "bold", color: "white" },
  descText: { fontSize: 14, color: "white", fontStyle: "italic" },
  packingListHeader: {
    fontSize: 22,
    color: "white",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  packingListContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 50,
  },
  packingItem: { width: "30%", alignItems: "center", marginVertical: 10 },
  icon: { width: 60, height: 60, resizeMode: "contain" },
  packingText: { color: "white", fontSize: 16, marginTop: 5 },
});
