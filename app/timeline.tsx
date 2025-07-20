import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Image,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppText } from "@/components/AppText";
import { useTimeline } from "@/context/TimelineContext";
import { getGradientColors } from "@/lib/gradientUtils";

const { width } = Dimensions.get("window");
function Timeline() {
  const scrollViewRef = useRef(null);
  const {
    weatherData,
    dailyForecast,
    location,
    loading,
    fitcastForecast,
    fitcastDescription,
  } = useTimeline();

  const jacket = require("../assets/images/jacket.png");
  const pants = require("../assets/images/pants.png");
  const shirt = require("../assets/images/t-shirt.png");
  const umbrella = require("../assets/images/umbrella.png");

  const topChoices = ["shirt", "light jacket", "thick jacket"];
  const bottomChoices = ["shorts", "pants"];
  const accessories = ["umbrella"];

  const topMap = {
    shirt: require("../assets/images/t-shirt.png"),
    "light jacket": require("../assets/images/light-jacket.png"),
    "thick jacket": require("../assets/images/jacket.png"),
  };
  const bottomMap = {
    shorts: require("../assets/images/shorts.png"),
    pants: require("../assets/images/pants.png"),
  };
  const accessoryMap = {
    umbrella: require("../assets/images/umbrella.png"),
  };

  const [gradientColors, setGradientColors] = useState(["#4DC8E7", "#B0E7F0"]);

  useEffect(() => {
    if (weatherData) {
      const currentWeather = weatherData[0]?.weather || "";
      const currentHour = new Date().getHours();
      const isNight = currentHour < 6 || currentHour > 18;
      const colors = getGradientColors(currentWeather, isNight);
      setGradientColors(colors);
    }
  }, [weatherData]);

  function extractClothingItems(fitcastString: string) {
    console.log("fitcastString:", fitcastString);
    const selectedTop =
      topChoices.find((item) => fitcastString.includes(item)) || null;
    const selectedBottom =
      bottomChoices.find((item) => fitcastString.includes(item)) || null;
    const selectedAccessory =
      accessories.find((item) => fitcastString.includes(item)) || null;

    return {
      top: selectedTop ? topMap[selectedTop] : null,
      bottom: selectedBottom ? bottomMap[selectedBottom] : null,
      accessory: selectedAccessory ? accessoryMap[selectedAccessory] : null,
    };
  }

  const getOutfitForHour = (hour: number) => {
    if (!fitcastForecast || fitcastForecast === "Loading...") return [];

    console.log("fitcastForecast for hour:", fitcastForecast);

    const hourlyOutfits = fitcastForecast
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("-"));

    const matchingOutfit = hourlyOutfits.find((outfit) => {
      const timeMatch = outfit.match(/^-\s*(\d+):00/);
      return timeMatch && parseInt(timeMatch[1]) === hour;
    });

    if (!matchingOutfit) return [];

    const items = extractClothingItems(matchingOutfit);
    return [items.top, items.bottom, items.accessory].filter(
      (item) => item !== null
    );
  };

  // hardcoded for now; integrate with user's recommendations/prefs later
  const getOutfitForWeather = (weather, temp) => {
    if (weather.includes("Rain")) return [jacket, pants, umbrella];
    if (weather.includes("Showers")) return [jacket, pants, umbrella];
    if (temp < 50) return [jacket, pants];
    if (temp >= 50 && temp < 70) return [shirt, pants];
    return [shirt];
  };

  const convertTo12Hour = (time) => {
    let hour = parseInt(time, 10);
    let suffix = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour} ${suffix}`;
  };

  return (
    <LinearGradient
      colors={gradientColors}
      style={{ flex: 1, justifyContent: "center" }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          paddingBottom: 20,
        }}
        nestedScrollEnabled={true}
      >
        <View style={{ marginTop: 50 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <>
              <AppText
                type="subtitle"
                style={{
                  fontSize: 30,
                  textAlign: "center",
                  marginVertical: 20,
                  color: "white",
                }}
              >
                {location.split(",")[0]} Timeline
              </AppText>

              <AppText
                type="defaultSemiBold"
                style={{ marginBottom: 10, marginLeft: 10, color: "white" }}
              >
                Next 12 Hours
              </AppText>

              <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={{
                  width: ((2 * width) / 3) * weatherData.length,
                  height: 200,
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  padding: 10,
                }}
              >
                {weatherData.map((hour, index) => (
                  <View
                    key={index}
                    style={{
                      width: (2 * width) / 3,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <AppText style={{ color: "white" }}>
                      {convertTo12Hour(hour.time)}
                    </AppText>
                    <AppText style={{ color: "white" }}>
                      {hour.temp}°F - {hour.weather}
                    </AppText>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                      }}
                    >
                      {getOutfitForHour(parseInt(hour.time)).map(
                        (icon, idx) => (
                          <Image
                            key={idx}
                            source={icon}
                            style={{ height: 80, width: 80, margin: 5, resizeMode: 'contain' }}
                          />
                        )
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.fitcastDescription}>
                <AppText style={styles.fitcastDescriptionText} type="italic">
                  {fitcastDescription}
                </AppText>
              </View>
              <View style={{ paddingBottom: 50 }}>
                <AppText
                  type="defaultSemiBold"
                  style={{ marginVertical: 20, marginLeft: 10, color: "white" }}
                >
                  Next 3 Days
                </AppText>
                {dailyForecast.map((day, index) => (
                  <View key={index} style={styles.dayDescription}>
                    <AppText style={{ color: "white" }}>{day.date}</AppText>
                    <AppText style={{ color: "white" }}>
                      {day.temp}°F - {day.weather}
                    </AppText>
                    <View
                      style={{ flexDirection: "row", justifyContent: "center" }}
                    >
                      {getOutfitForWeather(day.weather, day.temp).map(
                        (icon, idx) => (
                          <Image
                            key={idx}
                            source={icon}
                            style={{ height: 40, width: 40, margin: 10 }}
                          />
                        )
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

export default Timeline;

import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  iconGroup: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    height: 80,
    width: 100,
    margin: 10,
  },
  timeLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: width * 0.9,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  timeLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  fitcastDescriptionText: {
    color: "white",
    marginBottom: 10,
  },
  fitcastDescription: {
    width: (5 * width) / 6,
    height: 120,
    backgroundColor: "#0353A4",
    padding: 15,
    margin: 20,
    borderRadius: 15,
    alignSelf: "center",
  },
  dayDescription: {
    width: width * 0.9,
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    alignSelf: "center",
  },
});
