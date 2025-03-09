import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import GradientBackground from "@/components/GradientBackground";
import { AppText } from "@/components/AppText";
import { useTimeline } from "@/context/TimelineContext";

const { width } = Dimensions.get("window");
const OPENAI_API_KEY =
  "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";
function Timeline() {
  const [gradientColors, setGradientColors] = useState([
    "rgba(255, 183, 77, 0.8)",
    "rgba(255, 244, 214, 0.9)",
    "#4D92D9",
  ]);
  const scrollViewRef = useRef(null);
  const {
    weatherData,
    dailyForecast,
    location,
    loading,
    fitcastDescription,
    fitcastLabel,
  } = useTimeline();

  const API_KEY = "f076a815a1cbbdb3f228968604fdcc7a";
  const CITY = "Palo Alto";

  const jacket = require("../assets/images/jacket.png");
  const pants = require("../assets/images/pants.png");
  const shirt = require("../assets/images/t-shirt.png");
  const umbrella = require("../assets/images/umbrella.png");

  // hardcoded for now; integrate with user's recommendations/prefs later
  const getOutfitForWeather = (weather, temp) => {
    if (weather.includes("Rain")) return [jacket, pants, umbrella];
    if (temp < 50) return [jacket, pants];
    if (temp >= 50 && temp < 70) return [shirt, pants];
    return [shirt];
  };

  return (
    <GradientBackground
      colors={gradientColors}
      style={{ flex: 1, justifyContent: "center" }}
    >
      <View style={{ flex: 1, marginTop: 50 }}>
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
              }}
            >
              {/* ignore country */}
              {location.split(",")[0]} Timeline
            </AppText>

            <AppText
              type="defaultSemiBold"
              style={{ marginBottom: 10, marginLeft: 10 }}
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
                  <AppText>{hour.time}:00</AppText>
                  <AppText>
                    {hour.temp}°F - {hour.weather}
                  </AppText>
                  <View
                    style={{ flexDirection: "row", justifyContent: "center" }}
                  >
                    {getOutfitForWeather(hour.weather, hour.temp).map(
                      (icon, idx) => (
                        <Image
                          key={idx}
                          source={icon}
                          style={{ height: 80, width: 80, margin: 5 }}
                        />
                      )
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
            <View
              style={{
                width: (4 * width) / 5,
                height: 120,
                backgroundColor: "#0353A4",
                padding: 15,
                margin: 15,
                borderRadius: 15,
                alignSelf: "center",
              }}
            >
              <AppText style={styles.fitcastDescriptionText} type="italic">
                {fitcastLabel}
              </AppText>
              <AppText
                style={{ color: "white", marginLeft: 8, marginRight: 10 }}
                type="caption"
              >
                {fitcastDescription}
              </AppText>
            </View>

            <AppText
              type="defaultSemiBold"
              style={{ marginVertical: 20, marginLeft: 10 }}
            >
              Next 3 Days
            </AppText>
            <ScrollView
              contentContainerStyle={{
                alignItems: "center",
              }}
            >
              {dailyForecast.map((day, index) => (
                <View
                  key={index}
                  style={{
                    width: width * 0.9,
                    backgroundColor: "rgba(255,255,255,0.3)",
                    padding: 15,
                    marginBottom: 10,
                    borderRadius: 10,
                  }}
                >
                  <AppText>{day.date}</AppText>
                  <AppText>
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
            </ScrollView>
          </>
        )}
      </View>
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
});
