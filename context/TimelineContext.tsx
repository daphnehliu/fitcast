import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";

const OPENAI_API_KEY =
  "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";
interface TimelineContextType {
  weatherData: any;
  dailyForecast: string[];
  location: string;
  loading: boolean;
  fitcastDescription: string;
  fitcastLabel: string;
}
const API_KEY = "f076a815a1cbbdb3f228968604fdcc7a";
const CITY = "Palo Alto";

export const TimelineContext = createContext<TimelineContextType | undefined>(
  undefined
);

export const TimelineProvider = ({ children }: { children: ReactNode }) => {
  const [weatherData, setWeatherData] = useState([]);
  const [dailyForecast, setDailyForecast] = useState([]);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [fitcastDescription, setFitcastDescription] = useState("Loading...");
  const [fitcastLabel, setFitcastLabel] = useState("Loading...");

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
        const descr = await getFitcastDescription(
          formatForecast(hourlyForecast)
        );
        const label = await getFitcastLabel(descr);
        setFitcastLabel(label);
        setFitcastDescription(descr);
      } catch (error) {
        console.error("Error fetching weather:", error);
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

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
    <TimelineContext.Provider
      value={{
        weatherData,
        dailyForecast,
        location,
        loading,
        fitcastDescription,
        fitcastLabel,
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
