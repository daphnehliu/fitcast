import { Text, View, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppText } from "@/components/AppText";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { useWeather } from "@/context/WeatherContext";

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

export default function Home({ session }: { session: Session }) {
  const router = useRouter();
  const { weather, isNight, weatherDesc, fitcastDescription, fitcastLabel } =
    useWeather();
  const [gradientColors, setGradientColors] = useState<
    [string, string, ...string[]]
  >(["#4DC8E7", "#B0E7F0"]);

  const userId = session.user?.id;
  const username = session?.user?.user_metadata?.display_name || "No Name";

  useEffect(() => {
    setGradientColors(getGradientColors(weatherDesc, isNight));
  }, [weatherDesc, isNight]);

  const placeholder = require("../assets/images/Rectangle 46.png"); // remove this eventually
  const fitcast = require("../assets/images/fitcastWhite.png");

  const topChoices = ["shirt", "light jacket", "thick jacket"];
  const topMap = {
    shirt: require("../assets/images/t-shirt.png"),
    "light jacket": require("../assets/images/light-jacket.png"),
    "heavy jacket": require("../assets/images/jacket.png"),
  };
  const bottomChoices = ["shorts", "pants"];
  const bottomMap = {
    shorts: require("../assets/images/shorts.png"),
    pants: require("../assets/images/pants.png"),
  };
  const accessories = ["umbrella"];

  function extractClothingItems(fitcastLabel: string) {
    const selectedTop =
      topChoices.find((item) => fitcastLabel.includes(item)) || null;
    const selectedBottom =
      bottomChoices.find((item) => fitcastLabel.includes(item)) || null;
    const selectedAccessory =
      accessories.find((item) => fitcastLabel.includes(item)) || null;

    return {
      top: selectedTop,
      bottom: selectedBottom,
      accessory: selectedAccessory,
    };
  }

  const { top, bottom, accessory } = extractClothingItems(fitcastLabel);

  if (!weather) return <Text>Loading...</Text>;

  const currentTemp = Math.round(weather.main.temp);
  const tempHigh = Math.round(weather.main.temp_max);
  const tempLow = Math.round(weather.main.temp_min);

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <View style={styles.content}>
        <View style={styles.header}>
          <AppText type="title" style={styles.headertext}>
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

        <View style={styles.fitcastSection}>
          <View style={styles.fitcastBoxLight}>
            <View style={styles.fitcastLabel}>
              <View>
                <AppText style={styles.weatherDetailsText}>Now:</AppText>
                <Image source={topMap[top]} style={styles.image} />
                <Image source={bottomMap[bottom]} style={styles.image} />
              </View>

              <View>
                <AppText style={styles.weatherDetailsText}>Later:</AppText>
                <Image source={placeholder} style={styles.image} />
                <Image source={placeholder} style={styles.image} />
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
              {fitcastLabel}
            </AppText>
            <AppText
              style={{ color: "white", marginLeft: 8, marginRight: 10 }}
              type="caption"
            >
              {fitcastDescription}
            </AppText>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  logoutButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 100,
  },
  content: {
    flex: 1,
    marginTop: 50,
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
    marginBottom: -9.8,
    color: "white",
  },
  userText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    fontFamily: "System",
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
  fitcastSection: {
    height: 300,
    width: 375,
    alignSelf: "center",
    alignItems: "center",
    marginTop: 10,
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
