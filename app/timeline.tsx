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

const { width } = Dimensions.get("window");
const OPENAI_API_KEY = "";

function Timeline() {
  const [weatherData, setWeatherData] = useState([]);
  const [dailyForecast, setDailyForecast] = useState([]);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [gradientColors, setGradientColors] = useState([
    "rgba(255, 183, 77, 0.8)",
    "rgba(255, 244, 214, 0.9)",
    "#4D92D9",
  ]);
  const scrollViewRef = useRef(null);
  const [fitcastDescription, setFitcastDescription] = useState("Loading...");
  const [fitcastLabel, setFitcastLabel] = useState("Loading...");

  const API_KEY = "f076a815a1cbbdb3f228968604fdcc7a";
  const CITY = "Palo Alto";

  const jacket = require("../assets/images/jacket.png");
  const pants = require("../assets/images/pants.png");
  const shirt = require("../assets/images/t-shirt.png");
  const umbrella = require("../assets/images/umbrella.png");

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          // api call is different from home; uses forecast not weather for 3 day forecast
          `http://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${API_KEY}&units=imperial`
        );
        const data = await response.json();
        setLocation(`${data.city.name}, ${data.city.country}`);

        // hourly forecast for the next 12 hours
        const hourlyForecast = data.list.slice(0, 5).map((hour) => ({
          temp: hour.main.temp,
          weather: hour.weather[0].main,
          time: new Date(hour.dt * 1000).getHours(),
        }));

        // 3 day forecast
        const dailyForecastData = data.list
          .filter((item) => item.dt_txt.includes("12:00:00")) // set for 12 PM each day
          .slice(1, 4)
          .map((day) => ({
            date: day.dt_txt.split(" ")[0],
            temp: day.main.temp,
            weather: day.weather[0].main,
          }));

        setWeatherData(hourlyForecast);
        setDailyForecast(dailyForecastData);
        setLoading(false);
        const formatForecast = (
          hourlyForecast: { temp: number; time: number; weather: string }[]
        ): string => {
          return hourlyForecast
            .map(
              ({ temp, time, weather }) =>
                `${time}:00 - ${weather} with a temperature of ${temp.toFixed(
                  1
                )}°F`
            )
            .join("\n");
        };
        const descr = await getFitcastDescription(
          formatForecast(hourlyForecast)
        );
        setFitcastDescription(descr);
        const label = await getFitcastLabel(descr);
        setFitcastLabel(label);
      } catch (error) {
        console.error("Error fetching weather:", error);
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  // hardcoded for now; integrate with user's recommendations/prefs later
  const getOutfitForWeather = (weather, temp) => {
    if (weather.includes("Rain")) return [jacket, pants, umbrella];
    if (temp < 50) return [jacket, pants];
    if (temp >= 50 && temp < 70) return [shirt, pants];
    return [shirt];
  };

  const getFitcastDescription = async (
    hourlyForecast: string
  ): Promise<string> => {
    console.log("make sure this", hourlyForecast);
    try {
      const prompt = `From "${hourlyForecast}", give an explanation for what clothes to wear. Point out changes throughout
      the day that might require an outfit switch, and directly address the specific weather/temperature that drives this suggetion.
      Make direct reference to exact time points. be detailed about the clothing items. Speak as if you're directly instructing someone and use full and proper grammar. 
      Reply in under 25 tokens`;

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
      const fitcastDescription = data.choices[0].message.content.trim();
      console.log(
        "Successfully recieved fitcastDescription prompt response: ",
        fitcastDescription
      );
      return fitcastDescription;
    } catch (error) {
      console.error("Error fetching OpenAI response:", error);
      return "Unable to generate fitcast description.";
    }
  };

  const getFitcastLabel = async (description: string): Promise<string> => {
    if (description != "Unable to generate fitcast advice.") {
      try {
        const prompt = `Summarize "${description}" in less than 12 tokens. Ensure chronology and finish your thought`;

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
              max_tokens: 12,
            }),
          }
        );

        const data = await response.json();
        const fitcastDescription = data.choices[0].message.content.trim();
        console.log(
          "Successfully recieved fitcastDescription prompt response: ",
          fitcastDescription
        );
        return fitcastDescription;
      } catch (error) {
        console.error("Error fetching OpenAI response:", error);
        return "Unable to generate fitcast description.";
      }
    }
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
