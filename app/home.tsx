import { Text, View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppText } from "@/components/AppText";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { useWeather } from "@/context/WeatherContext";
import { useTimeline } from "@/context/TimelineContext";
import { supabase } from "../lib/supabase";
import { getGradientColors } from "@/lib/gradientUtils";

export default function Home({ session }: { session: Session }) {
  const router = useRouter();
  const { weather, isNight, weatherDesc, fitcastDescription, fitcastLabel } =
    useWeather();
  const { fitcastForecast } = useTimeline();
  const gradientColors = getGradientColors(weatherDesc, isNight);
  const [now, setNow] = useState<Record<string, any>>({});
  const [later, setLater] = useState<Record<string, any>>({});
  const [laterTime, setLaterTime] = useState<number>();
  const [location, setLocation] = useState<string>("Palo Alto");
  const userId = session.user?.id;
  const username = session?.user?.user_metadata?.display_name || "No Name";

  useEffect(() => {
    const fetchLocation = async () => {
      // get user id
      const userId = session.user?.id;
      // get location from profiles table
      const { data: locationData } = await supabase.from("profiles").select("location").eq("id", userId).single();
      setLocation(locationData?.location || "Palo Alto");
      console.log("Location:", locationData?.location);
    };

    fetchLocation();
  }, [session]);

  const yourFitcast = require("../assets/images/your-fitcast-white.png");

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

  // Button click handler to navigate to Timeline screen
  const handleViewTimeline = () => {
    router.push("/timeline"); // Navigating to timeline.tsx
  };

  function extractClothingItems(fitcastLabel: string) {
    console.log("fitcastLabel:", fitcastLabel);
    if (fitcastLabel === "Unable to generate fitcast advice." || fitcastLabel === undefined) {
      return {
        top: null,
        bottom: null,
        accessory: null,
      };
    }
    const selectedTop =
      topChoices.find((item) => fitcastLabel.includes(item)) || null;
    const selectedBottom =
      bottomChoices.find((item) => fitcastLabel.includes(item)) || null;
    const selectedAccessory =
      accessories.find((item) => fitcastLabel.includes(item)) || null;
    
    console.log("Selected Top:", selectedTop);
    console.log("Selected Bottom:", selectedBottom);
    console.log("Selected Accessory:", selectedAccessory);

    return {
      top: selectedTop,
      bottom: selectedBottom,
      accessory: selectedAccessory,
    };
  }

  const convertTo12Hour = (time) => {
    let hour = parseInt(time, 10);
    let suffix = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour} ${suffix}`;
  };

  useEffect(() => {
    console.log("fitcastLabel:", fitcastLabel);
    console.log("fitcastForecast:", fitcastForecast);
    if (fitcastForecast === "Loading..." ||
      fitcastLabel === "Unable to generate fitcast advice." || 
      fitcastLabel === undefined) 
      return;

    const now = extractClothingItems(fitcastLabel);
    setNow(now);

    const later = extractClothingItems(fitcastForecast.split("-")[3]);
    setLater(later);

    const time = convertTo12Hour(
      fitcastForecast.split("-")[3].split(":")[0] +
        ":" +
        fitcastForecast.split(":")[1]
    );
    setLaterTime(time);
  }, [fitcastForecast, fitcastLabel]);

  if (!weather) return <Text>Loading...</Text>;

  const currentTemp = Math.round(weather.main.temp);
  const tempHigh = Math.round(weather.main.temp_max);
  const tempLow = Math.round(weather.main.temp_min);

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image source={yourFitcast} style={styles.fitcastImage} />
        </View>

        <View style={styles.weatherBox}>
          <AppText style={styles.locationText}>{location}</AppText>
          <AppText style={styles.tempText}>{currentTemp}º</AppText>
          <AppText style={{ color: "white" }}>{weatherDesc}</AppText>
          <AppText style={{ color: "white" }}>
            High: {tempHigh}º | Low: {tempLow}º
          </AppText>
        </View>

        <View style={styles.fitcastSection}>
          <View style={styles.fitcastBoxLight}>
            <View style={styles.fitcastLabel}>
              <View style = {{width: "50%"}}>
                <AppText style={styles.weatherDetailsText}>Now:</AppText>
                <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'center', width: '100%',}}> 
                  <View>
                    <Image source={topMap[now["top"]]} style={styles.image} />
                    <Image
                      source={bottomMap[now["bottom"]]}
                      style={styles.image}
                    />
                  </View>
                  <View style={{alignItems: "center", justifyContent: "center"}}>
                  { now["accessory"] && (<Image source={accessoryMap[now["accessory"]]} style={[styles.image]} />)}
                  </View> 
                </View>
              </View>

              <View style = {{width: "50%"}}>
                <AppText style={styles.weatherDetailsText}>Later: {laterTime}</AppText>
                <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'center', width: '100%',}}> 
                  <View>
                    <Image source={topMap[later["top"]]} style={styles.image} />
                    <Image
                      source={bottomMap[later["bottom"]]}
                      style={styles.image}
                    />
                  </View>
                  <View style={{alignItems: "center", justifyContent: "center"}}>
                  { later["accessory"] && (<Image source={accessoryMap[later["accessory"]]} style={[styles.image]} />)}
                  </View> 
                </View>
              </View>
            </View>
              {/* Text button that says 'View Timeline >', underlined and clickable */}
              <TouchableOpacity onPress={handleViewTimeline}>
                <AppText style={styles.weatherTimelineButton}>View Full Timeline ></AppText>
              </TouchableOpacity>
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
  fitcastImage: {
    width: 300,
    height: 50,
    resizeMode: "contain",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
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
    alignSelf: "center",
    padding: 20,
    gap: 10,
  },
  image: {
    width: 50,
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
  weatherTimelineButton: {
    textDecorationLine: 'underline', // Underline the text
    color: 'white', // Blue color for the button text
    marginTop: 10, // Space between the content and the button
    fontSize: 16, // Font size
    fontWeight: 'bold', // Optional: makes the button bold
  },
});
