import { Text, View, StyleSheet, Image, Button } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppText } from "@/components/AppText";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import NavBar from "@/components/NavBar";
import { Session } from "@supabase/supabase-js";

const OPENAI_API_KEY = ""

const getGradientColors = (
  weatherDesc: string,
  isNight: boolean
): [string, string, ...string[]] => {
  if (!weatherDesc) return ["#4DC8E7", "#B0E7F0"];
``
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
  const [weather, setWeather] = useState<any>(null);
  const [isNight, setIsNight] = useState(false);
  const [weatherDesc, setWeatherDesc] = useState("");
  const [gradientColors, setGradientColors] = useState<
    [string, string, ...string[]]
  >(["#4DC8E7", "#B0E7F0"]);

  const [fitcastDescription, setFitcastDescription] = useState("Loading...");
  const [fitcastLabel, setFitcastLabel] = useState("Loading...");

  const userId = session.user?.id;
  const username = session?.user?.user_metadata?.display_name || "No Name";

  useEffect(() => {
    setGradientColors(getGradientColors(weatherDesc, isNight));
  }, [weatherDesc, isNight]);

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
        const formattedDesc = data.weather[0].description
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        setWeatherDesc(formattedDesc);

        getFitcastLabel(
          formattedDesc,
          data.main.temp,
          data.main.temp_max,
          data.main.temp_min
        );
        getFitcastDescription(
          formattedDesc,
          data.main.temp,
          data.main.temp_max,
          data.main.temp_min,
          fitcastLabel
        );
      } catch (error) {
        console.error("Error fetching weather: ", error);
      }
    };

    fetchWeather();
  }, []);

  const getFitcastLabel = async (
    description: string,
    temp: number,
    high: number,
    low: number
  ) => {
    try {
      const prompt = `The current weather is described as "${description}". The temperature is ${temp}ºF, with 
      a high of ${high}ºF and a low of ${low}ºF. Provide a short clothing recommendation including specific 
      pieces of clothing to prepare for the weather. Don't give any reasoning and don't add any stylistic elements.
      Something like "Dress light with a short sleeve shirt and pants" or "Bundle up with a big jacket" ia great. Use 10 or less tokens.`;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are a weather fashion assistant.",
              },
              { role: "user", content: prompt },
            ],
            max_tokens: 10,
          }),
        }
      );

      const data = await response.json();
      console.log(data);
      setFitcastLabel(data.choices[0].message.content.trim());
      console.log(fitcastLabel);
    } catch (error) {
      console.error("Error fetching OpenAI response:", error);
      setFitcastLabel("Unable to generate fitcast advice.");
    }
  };

  const getFitcastDescription = async (
    description: string,
    temp: number,
    high: number,
    low: number,
    fitcast: string
  ) => {
    try {
      const prompt = `Explain briefly why you said to "${fitcast}$. The current weather is described as "${description}". The temperature is ${temp}ºF, with 
      a high of ${high}ºF and a low of ${low}ºF. A response like "You typically feel hot in these conditions. Later, it will cool
              down and rain." or "It's colder today than it is yesterday is great. Use less than 25 tokens. Don't apologize if there are any errors"`;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are a weather fashion assistant.",
              },
              { role: "user", content: prompt },
            ],
            max_tokens: 25,
          }),
        }
      );

      const data = await response.json();
      console.log(data);
      setFitcastDescription(data.choices[0].message.content.trim());
      console.log(fitcastDescription);
    } catch (error) {
      console.error("Error fetching OpenAI response:", error);
      setFitcastDescription("Unable to generate fitcast advice.");
    }
  };

  if (!weather) return <Text>Loading...</Text>;

  const currentTemp = Math.round(weather.main.temp);
  const tempHigh = Math.round(weather.main.temp_max);
  const tempLow = Math.round(weather.main.temp_min);

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
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
              {fitcastLabel}
            </AppText>
            <AppText
              style={{ color: "white", marginLeft: 8, marginRight: 10 }}
              type="caption"
            >
              {fitcastDescription}
            </AppText>
          </View>
          <Button
            title="View Timeline"
            onPress={() => router.push("/timeline")}
          />
          <Button
            title="View Packing"
            onPress={() => router.push("/packing/packing")}
          />
          <Button
            title="View Profile"
            onPress={() => router.push("/profile")}
          />
        </View>
      </View>
      <NavBar handleLogout={handleLogout} />
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
