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
  setWeather: React.Dispatch<React.SetStateAction<any>>;
  isNight: boolean;
  setIsNight: React.Dispatch<React.SetStateAction<boolean>>;
  weatherDesc: string;
  setWeatherDesc: React.Dispatch<React.SetStateAction<string>>;
  gradientColors: string[];
  setGradientColors: React.Dispatch<React.SetStateAction<string[]>>;
  fitcastDescription: string;
  setFitcastDescription: React.Dispatch<React.SetStateAction<string>>;
  fitcastLabel: string;
  setFitcastLabel: React.Dispatch<React.SetStateAction<string>>;
}

export const WeatherContext = createContext<WeatherContextType | undefined>(
  undefined
);

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
          weather.main.temp,
          weather.main.temp_max,
          weather.main.temp_min
        );
        setFitcastLabel(label);
        const descr = await getFitcastDescription(
          formattedDesc,
          weather.main.temp,
          weather.main.temp_max,
          weather.main.temp_min,
          label
        );
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
      const prompt = `The current weather is described as "${description}". The temperature is ${temp}ºF, with 
      a high of ${high}ºF and a low of ${low}ºF. Provide a short clothing recommendation including specific 
      pieces of clothing to prepare for the weather. Don't give any reasoning and don't add any stylistic elements.
      Something like "Dress light with a short sleeve shirt and pants" or "Bundle up with a big jacket" is great. 
      Use 10 or less tokens, proper grammar, and finish your thought`;

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
        setWeather,
        isNight,
        setIsNight,
        weatherDesc,
        setWeatherDesc,
        fitcastDescription,
        setFitcastDescription,
        fitcastLabel,
        setFitcastLabel,
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
