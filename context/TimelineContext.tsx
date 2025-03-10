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
  fitcastForecast: string;
  fitcastDescription: string;
}
const API_KEY = "f076a815a1cbbdb3f228968604fdcc7a";
const CITY = "Palo Alto";
const topChoices = ["shirt", "light jacket", "thick jacket"];
const bottomChoices = ["shorts", "pants"];
const accessories = ["umbrella"];

export const TimelineContext = createContext<TimelineContextType | undefined>(
  undefined
);

export const TimelineProvider = ({ children }: { children: ReactNode }) => {
  const [weatherData, setWeatherData] = useState([]);
  const [dailyForecast, setDailyForecast] = useState([]);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [fitcastDescription, setFitcastDescription] = useState("Loading...");
  const [fitcastForecast, setFitcastForecast] = useState("Loading...");

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
        const fitcastHourly = await getFitcastForecast(
          formatForecast(hourlyForecast)
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
  }, []);

  const getFitcastForecast = async (
    hourlyForecast: string
  ): Promise<string> => {
    try {
      const directions =
        `For each of the four forecasts in "${hourlyForecast}", select one clothing suggestion from` +
        topChoices +
        "one element from " +
        bottomChoices +
        " and any elements from " +
        accessories +
        ` if needed. Try to make the suggestions match the weather for that hourly forecast. Format the response simply as new lines mapping the time to the the suggested clothing items. `;

      const examples = "For example, '- 2:00: Shirt, light jacket, pants'";
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

      const data = await response.json();
      const fitcastForecast = data.choices[0].message.content.trim();
      console.log(
        "Successfully recieved fitcastForecast prompt response: ",
        fitcastForecast
      );
      return fitcastForecast;
    } catch (error) {
      console.error("Error fetching OpenAI response:", error);
      return "Unable to generate fitcast forecast.";
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
