import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";

const OPENAI_API_KEY =
  "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";
interface TimelineContextType {
  weatherData: any;
  dailyForecast: string[];
  location: string;
  loading: boolean;
  fitcastForecast: string;
  fitcastDescription: string;
}
const API_KEY = "f076a815a1cbbdb3f228968604fdcc7a";
const CITY = "Palo Alto";
const accessories = ["umbrella"];

const itemTopChoices = {
  "T‑Shirt": "shirt",
  "Light Jacket": "light jacket",
  "Heavy Jacket": "thick jacket"
}
const itemBottomChoices = {
  "Shorts": "shorts",
  "Pants": "pants"
}

export const TimelineContext = createContext<TimelineContextType | undefined>(
  undefined
);

export const TimelineProvider = ({ children, session }: { children: ReactNode; session: Session }) => {
  const [weatherData, setWeatherData] = useState([]);
  const [dailyForecast, setDailyForecast] = useState([]);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [fitcastDescription, setFitcastDescription] = useState("Loading...");
  const [fitcastForecast, setFitcastForecast] = useState("Loading...");

  useEffect(() => {
    const fetchWeather = async () => {
      try {
         // fetch preferences and location
         const [{ data: profileData, error: profileError }, { data: preferencesData, error: preferencesError }] = await Promise.all([
          supabase.from("profiles").select("username, avatar_url, location").eq("id", session.user.id).single(),
          supabase.from("initial_preferences").select("cold_tolerance, prefers_layers, items").eq("user_id", session.user.id).limit(1),
        ]);

        // get items from preferences data
        const items = preferencesData?.[0]?.items || [];
        console.log("timeline Items:", items);

        // get location from profile data, if not found, use Palo Alto
        const location = profileData?.location || CITY;

        const response = await fetch(
          // api call is different from home; uses forecast not weather for 3 day forecast
          `http://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${API_KEY}&units=imperial`
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
          .slice(0, 3)
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

        // alter topChoices and bottomChoices based on preferences of items
        let userTopChoices = items
          .filter((item: string) => item in itemTopChoices)
          .map((item: string) => itemTopChoices[item as keyof typeof itemTopChoices]);
        
        let userBottomChoices = items
          .filter((item: string) => item in itemBottomChoices)
          .map((item: string) => itemBottomChoices[item as keyof typeof itemBottomChoices]);
        
        console.log("timeline userTopChoices:", userTopChoices);
        console.log("timeline userBottomChoices:", userBottomChoices);
        // If no valid choices found, use defaults
        if (userTopChoices.length === 0) userTopChoices = ["shirt"];
        if (userBottomChoices.length === 0) userBottomChoices = ["pants"];

        console.log("timeline userTopChoices after filtering:", userTopChoices);
        console.log("timeline userBottomChoices after filtering:", userBottomChoices);
  
        const fitcastHourly = await getFitcastForecast(
          formatForecast(hourlyForecast),
          userTopChoices,
          userBottomChoices
        );
        setFitcastForecast(fitcastHourly);
        const descr = await getFitcastDescription(fitcastHourly);
        setFitcastDescription(descr);
      } catch (error) {
        console.error("Error fetching weather:", error);
        setLoading(false);
      }
    };

    fetchWeather();
  }, [session]);

  const getFitcastForecast = async (
    hourlyForecast: string,
    topChoices: string[],
    bottomChoices: string[]
  ): Promise<string> => {
    const makeApiCall = async (): Promise<string> => {
      try {
        const directions =
          `For each of the four forecasts in "${hourlyForecast}", select one clothing suggestion from` +
          topChoices +
          "one element from " +
          bottomChoices +
          " and any elements from " +
          accessories +
          ` if needed. Only suggest clothing items that are listed above. You must select one top and one bottom. Try to make the suggestions match the weather for that hourly forecast. Format the response simply as new lines mapping the time to the the suggested clothing items. If a jacket is suggested, no need to also list shirt.`;

        const examples = "For example, '- 2:00: light jacket, shorts'";
        const prompt = directions + examples;

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
              max_tokens: 100,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        const fitcastForecast = data.choices[0].message.content.trim();
        console.log("timeline fitcastForecast:", fitcastForecast);
        return fitcastForecast;
      } catch (error) {
        console.error("Error fetching OpenAI response:", error);
        throw error; // Rethrow the error to handle it in the retry logic
      }
    };

    try {
      // First attempt
      return await makeApiCall();
    } catch (error) {
      console.log("Retrying OpenAI API call...");
      // Retry once
      return await makeApiCall();
    }
  };

  const getFitcastDescription = async (
    fitcastForecast: string
  ): Promise<string> => {
    try {
      const instruction = `Provide a short summary of "${fitcastForecast}" in paragraph style in under 30 words. 
      Indicate times where the clothing suggestion changes. Point out specific weather conditions to explain the changes. 
      Convert the 24 hour time to 12 hour times with am/pm. `;
      const example =
        "A good response would be like 'Wear a light jacket until 8pm, but switch to a thick jacket since it gets chilly' or 'Dress light with a shirt for now but prepare for rain at 3pm.'";
      const prompt = instruction + example;
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
            max_tokens: 50,
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

  return (
    <TimelineContext.Provider
      value={{
        weatherData,
        dailyForecast,
        location,
        loading,
        fitcastForecast,
        fitcastDescription,
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimeline = (): TimelineContextType => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error("useTimeline must be used within a TimelineProvider");
  }
  return context;
};
