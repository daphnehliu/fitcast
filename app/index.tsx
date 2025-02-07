import { Text, View, StyleSheet, Image, Button } from "react-native";
import fitcast from "../assets/images/fitcast.png";
import pants from "../assets/images/pants.png";
import jacket from "../assets/images/jacket.png";
import { AppText } from "@/components/AppText";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";

export default function Index() {
  const router = useRouter();
  const [weather, setWeather] = useState<any>(null);

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

  return (
    <View>
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
          <Text>
            You typically feel hot in these conditions. Later, it will cool down
            and rain.
          </Text>
        </View>
        <Button
          title="View Timeline"
          onPress={() => router.push("/timeline")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
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
    textAlign: "center",
    alignItems: "center",
  },
  weatherBox: {
    alignItems: "center",
    padding: 50,
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
    height: 150,
    width: 375,
    alignItems: "center",
    margin: 14,
  },
  fitcastBoxLight: {
    width: 375,
    backgroundColor: "#B9D6F2",
    alignItems: "center",
    borderRadius: 15,
    paddingBottom: 10,
  },
  fitcastLabel: {
    flexDirection: "row",
  },
  fitcastDescription: {
    backgroundColor: "#0353A4",
    color: "white",
    height: 70,
    width: 375,
    borderRadius: 10,
    padding: 10,
  },
  fitcastDescriptionText: {
    color: "white",
    margin: 1,
    textAlign: "center",
  },
});
