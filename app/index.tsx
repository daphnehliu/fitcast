import { Text, View, StyleSheet, Image, Button } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import fitcast from "../assets/images/fitcast.png";
import pants from "../assets/images/pants.png";
import jacket from "../assets/images/jacket.png";
import { AppText } from "@/components/AppText";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";

export default function Index() {
  const router = useRouter();
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = "f076a815a1cbbdb3f228968604fdcc7a";
        const response = await fetch(
          `http://api.openweathermap.org/data/2.5/weather?q=Palo%20Alto&appid=${apiKey}&units=imperial`
        );
        const data = await response.json();
        setWeather(data);
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
  const weatherDesc = weather.weather[0].description;

  const getGradientColors = () => {
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 18;

    if (!weather || !weather.weather) return ["#4DC8E7", "#B0E7F0"];

    const weatherDesc = weather.weather[0].description.toLowerCase();

    if (weatherDesc.includes("clear")) {
      return isNight ? ["#0B1A42", "#2E4B7A"] : ["#4DC8E7", "#B0E7F0"];
    } else if (weatherDesc.includes("cloud")) {
      return isNight ? ["#2F3E46", "#4B6584"] : ["#BCCCDC", "#90A4AE"];
    } else if (weatherDesc.includes("rain")) {
      return isNight ? ["#1B262C", "#0F4C75"] : ["#5D737E", "#7DA3A1"];
    } else if (weatherDesc.includes("thunderstorm")) {
      return ["#1F1C2C", "#928DAB"];
    } else if (weatherDesc.includes("snow")) {
      return ["#E0EAF3", "#B0C4DE"];
    } else if (hour >= 5 && hour <= 7) {
      return ["#FF9A8B", "#FF6A88", "#FF99AC"];
    } else if (hour >= 18 && hour <= 20) {
      return ["#FDB813", "#FD5E53"];
    }

    return ["#4DC8E7", "#B0E7F0"];
  };

  return (
    <LinearGradient colors={getGradientColors()} style={styles.gradient}>
      <View style={styles.content}>
        <View style={styles.header}>
          <AppText style={styles.headertext} type="title">
            Your
          </AppText>
          <Image source={fitcast} style={styles.image} />
        </View>

        <View style={styles.weatherBox}>
          <Text style={styles.locationText}>Palo Alto, CA</Text>
          <Text style={styles.tempText}>{currentTemp}º</Text>
          <Text>{weatherDesc}</Text>
          <Text>
            High: {tempHigh}º | Low: {tempLow}º
          </Text>
        </View>

        <View style={styles.fitcastBox}>
          <View style={styles.fitcastBoxLight}>
            <View style={styles.fitcastLabel}>
              <View>
                <Text style={styles.weatherDetailsText}>Now: dress light</Text>
                <Image source={jacket} style={styles.image} />
                <Image source={pants} style={styles.image} />
              </View>

              <View>
                <Text style={styles.weatherDetailsText}>Later: layer up</Text>
                <Image source={jacket} style={styles.image} />
                <Image source={pants} style={styles.image} />
              </View>
            </View>
          </View>

          <View style={styles.fitcastDescription}>
            <Text style={styles.fitcastDescriptionText}>
              Dress light, but pack warm clothes for later.
            </Text>
            <Text style={{color: 'white'}}>
              You typically feel hot in these conditions. Later, it will cool
              down and rain.
            </Text>
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
    justifyContent: "center",
    // alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 20,
    flex: 0.2,
  },
  image: {
    width: 150,
    height: 50,
    resizeMode: "contain",
  },
  headertext: {
    paddingTop: 25,
    paddingRight: 6,
    color: "#0353A4",
    fontSize: 37,
    height: 50,
    // textAlign: "center",
    // alignItems: "center",
  },
  weatherBox: {
    alignItems: "center",
    paddingBottom: 20,
  },
  locationText: {
    fontSize: 25,
  },
  tempText: {
    fontSize: 100,
  },
  weatherDetailsText: {
    fontSize: 20,
    padding: 10,
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
    width: '95%',
    backgroundColor: "#B9D6F2",
    alignItems: "center",
    borderRadius: 15,
    paddingBottom: 10,
    marginBottom: 10,
  },
  fitcastLabel: {
    flexDirection: "row",
  },
  fitcastDescription: {
    backgroundColor: "#0353A4",
    color: "white",
    borderRadius: 10,
    padding: 10,
    height: 150,
    width: '95%',

  },
  fitcastDescriptionText: {
    color: "white",
    marginBottom: 10,
    fontStyle: 'italic',
    textAlign: "center",
  },
});

// perfect zone at each time of year