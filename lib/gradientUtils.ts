export const getGradientColors = (
  weatherDesc: string,
  isNight: boolean
): [string, string, ...string[]] => {
  if (!weatherDesc) return ["#4DC8E7", "#B0E7F0"];
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