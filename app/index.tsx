import { Text, View, StyleSheet, Image, Button } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppText } from "@/components/AppText";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";

export default function Index() {
  const router = useRouter();
  const [weather, setWeather] = useState<any>(null);
  const [isNight, setIsNight] = useState(false);
  const [weatherDesc, setWeatherDesc] = useState("");

  const jacket = require("../assets/images/jacket.png");
  const pants = require("../assets/images/pants.png");
  const fitcast = require("../assets/images/fitcastWhite.png");

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
        setWeatherDesc(
          (data.weather[0].description as string)
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchWeather();
  }, []);

  if (!weather) return <Text>Loading...</Text>;

  const currentTemp = Math.round(weather.main.temp);
  const tempHigh = Math.round(weather.main.temp_max);
  const tempLow = Math.round(weather.main.temp_min);

  const getGradientColors = (): [string, string, ...string[]] => {
    if (!weatherDesc) return ["#4DC8E7", "#B0E7F0"];

    if (weatherDesc.includes("clear")) {
      return isNight ? ["#0B1A42", "#2E4B7A"] : ["#4D92D9", "#B0E7F0"];
    } else if (weatherDesc.includes("cloud")) {
      return isNight ? ["#2F3E46", "#4B6584"] : ["#B0B0B0", "#90A4AE"];
    } else if (weatherDesc.includes("rain") || weatherDesc.includes("snow")) {
      return isNight ? ["#1B262C", "#0F4C75"] : ["#A0ADB9", "#697582"];
    } else if (weatherDesc.includes("thunderstorm")) {
      return ["#1F1C2C", "#928DAB"];
    } else if (isNight) {
      return ["#0B1A42", "#2E4B7A"];
    }

    return ["#4DC8E7", "#B0E7F0"];
  };

  return (
    <LinearGradient colors={getGradientColors()} style={styles.gradient}>
      <View style={styles.content}>
        <View style={styles.header}>
          <AppText type="title" style={[styles.headertext]}>
            Your
          </AppText>
          <Image source={fitcast} style={styles.image} />
        </View>

        <View style={styles.weatherBox}>
          <AppText style={styles.locationText}>Palo Alto, CA</AppText>
          <AppText style={styles.tempText}>{currentTemp}º</AppText>
          <AppText style={{ color: "white" }}>{weatherDesc}</AppText>
          <AppText style={{ color: "white" }}>
            High: {tempHigh}º | Low: {tempLow}º
          </AppText>
        </View>

        <View style={styles.fitcastBox}>
          <View style={styles.fitcastBoxLight}>
            <View style={styles.fitcastLabel}>
              <View>
                <AppText style={styles.weatherDetailsText}>
                  Now: dress light
                </AppText>
                <Image source={jacket} style={styles.image} />
                <Image source={pants} style={styles.image} />
              </View>

              <View>
                <AppText style={styles.weatherDetailsText}>
                  Later: layer up
                </AppText>
                <Image source={jacket} style={styles.image} />
                <Image source={pants} style={styles.image} />
              </View>
            </View>
          </View>

          <View
            style={[
              styles.fitcastDescription,
              { backgroundColor: isNight ? "#1E1E1E" : "#0353A4" },
            ]}
          >
            <AppText style={styles.fitcastDescriptionText} type="italic">
              Dress light, but pack warm clothes for later.
            </AppText>
            <AppText
              style={{ color: "white", marginLeft: 8, marginRight: 10 }}
              type="caption"
            >
              You typically feel hot in these conditions. Later, it will cool
              down and rain.
            </AppText>
          </View>
          <Button
            title="View Timeline"
            onPress={() => router.push("/timeline")}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 20,
    gap: 10,
  },
  image: {
    width: 150,
    height: 50,
    resizeMode: "contain",
  },
  headertext: {
    marginBottom: -10,
    color: "white",
  },
  weatherBox: {
    alignItems: "center",
    padding: 20,
  },
  locationText: {
    fontSize: 24,
    color: "white",
  },
  tempText: {
    fontSize: 100,
    color: "white",
  },
  weatherDetailsText: {
    padding: 10,
    color: "white",
  },
  fitcastBox: {
    height: 300,
    width: 375,
    alignItems: "center",
    margin: 14,
    flex: 3,
  },
  fitcastBoxLight: {
    height: 200,
    width: "95%",
    backgroundColor: "rgba(185, 214, 242, 0.5)",
    alignItems: "center",
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
  },
  fitcastLabel: {
    flexDirection: "row",
  },
  fitcastDescription: {
    backgroundColor: "#0353A4",
    color: "white",
    borderRadius: 10,
    padding: 16,
    height: 120,
    width: "95%",
  },
  fitcastDescriptionText: {
    color: "white",
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
});
