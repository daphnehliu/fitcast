import React, { useRef, useState } from "react";
import {
  View,
  Image,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import GradientBackground from "@/components/GradientBackground";
import { AppText } from "@/components/AppText";
import { useTimeline } from "@/context/TimelineContext";

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

  function extractClothingImages(fitcastString: string): Record<string, any> {
    return fitcastString
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("-"))
      .reduce((acc, line) => {
        const match = line.match(/-\s*(\d{1,2}):\d{2}:\s*(.+)$/);
        if (!match) return acc;

        const [, hour, clothingDesc] = match; // Extract only the hour
        const items = clothingDesc.split(", ").map((item) => item.trim()); // Extract clothing items

        // Find images for each category
        const top = items.find((item) => topMap[item]) || null;
        const bottom = items.find((item) => bottomMap[item]) || null;

        acc[hour] = [topMap[top], bottomMap[bottom]];

        return acc;
      }, {} as Record<string, any>);
  }

  // hardcoded for now; integrate with user's recommendations/prefs later
  const getOutfitForWeather = (weather, temp) => {
    if (weather.includes("Rain")) return [jacket, pants, umbrella];
    if (temp < 50) return [jacket, pants];
    if (temp >= 50 && temp < 70) return [shirt, pants];
    return [shirt];
  };

  const getOutfitForHour = (hour) => {
    const imageMap = extractClothingImages(fitcastForecast);
    console.log("time", hour);
    console.log("returns", imageMap[hour]);
    return imageMap[hour];
  };

  const convertTo12Hour = (time) => {
    let hour = parseInt(time, 10);
    let suffix = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour} ${suffix}`;
  };

  return (
    <GradientBackground
      colors={["rgba(255, 116, 47, 0.46)", "#4D92D9"]}
      locations={[0, 0.9]}
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
                      {getOutfitForHour(hour.time).map((icon, idx) => (
                        <Image
                          key={idx}
                          source={icon}
                          style={{ height: 80, width: 80, margin: 5 }}
                        />
                      ))}
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
    </GradientBackground>
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
