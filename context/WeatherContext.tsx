import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";

const OPENAI_API_KEY =
  "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";
interface WeatherContextType {
  weather: any;
  isNight: boolean;
  weatherDesc: string;
  gradientColors: string[];
  fitcastDescription: string;
  fitcastLabel: string;
}

export const WeatherContext = createContext<WeatherContextType | undefined>(
  undefined
);

const topChoices = ["shirt", "light jacket", "thick jacket"];
const bottomChoices = ["shorts", "pants"];
const accessories = ["umbrella"];

export const WeatherProvider = ({ children }: { children: ReactNode }) => {
  const [weather, setWeather] = useState<any>(null);
  const [isNight, setIsNight] = useState(false);
  const [weatherDesc, setWeatherDesc] = useState("");
  const [fitcastDescription, setFitcastDescription] = useState("Loading...");
  const [fitcastLabel, setFitcastLabel] = useState("Loading...");

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

        const label = await getFitcastLabel(
          formattedDesc,
          data.main.temp,
          data.main.temp_max,
          data.main.temp_min
        );
        const descr = await getFitcastDescription(
          formattedDesc,
          data.main.temp,
          data.main.temp_max,
          data.main.temp_min,
          label
        );
        setFitcastLabel(label);
        setFitcastDescription(descr);
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
  ): Promise<string> => {
    try {
      const tempDetails = `The current weather is described as "${description}". The temperature is ${temp}ºF, with a high of ${high}ºF and a low of ${low}ºF. `;
      const directions =
        "Provide a short clothing recommendation for the weather including one element from" +
        topChoices +
        "one element from " +
        bottomChoices +
        " and any elements from " +
        accessories +
        " if needed. Don't give reasoning and dont add any stylistic elements. Finish your thought in 15 or less tokens using a full sentence with proper grammar. Don't mention accessories unless they are needed";
      const examples =
        'Something like "Dress light with a shirt and shorts" or "Bundle up with a big jacket and long pants and carry an umbrella" is great. Use 10 or less tokens, proper grammar, and finish your thought';
      const prompt = directions + tempDetails;

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
            max_tokens: 15,
          }),
        }
      );

      const data = await response.json();
      const fitcastLabel = data.choices[0].message.content.trim();
      console.log(
        "Successfully recieved fitcastLabel prompt response: ",
        fitcastLabel
      );
      return fitcastLabel;
    } catch (error) {
      console.error("Error fetching OpenAI response:", error);
      return "Unable to generate fitcast advice.";
    }
  };

  const getFitcastDescription = async (
    description: string,
    temp: number,
    high: number,
    low: number,
    fitcast: string
  ): Promise<string> => {
    if (fitcast != "Unable to generate fitcast advice.") {
      try {
        const prompt = `Explain briefly why "${fitcast}" is a good recommendation for the current weather, which is described as "${description}". The temperature is ${temp}ºF, with 
        a high of ${high}ºF and a low of ${low}ºF. A response like "You typically feel hot in these conditions. Later, it will cool
                down and rain." or "It's colder today than it is yesterday, layer up a bit." is great. Use less than 25 tokens and don't apologize for errors. 
                Remove quotation marks from your reponses. Feel free to add extra details about how thick the clothing item should be. Use proper grammar and full sentences`;

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
    }
  };

  return (
    <WeatherContext.Provider
      value={{
        weather,
        isNight,
        weatherDesc,
        fitcastDescription,
        fitcastLabel,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = (): WeatherContextType => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error("useWeather must be used within a WeatherProvider");
  }
  return context;
};
