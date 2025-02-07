import { Text, type TextProps, StyleSheet } from "react-native";
import * as Font from "expo-font";
import { useEffect, useState } from "react";

export type AppTextProps = TextProps & {
  type?:
    | "default"
    | "title"
    | "defaultSemiBold"
    | "subtitle"
    | "link"
    | "italic"
    | "caption";
};

export function AppText({ style, type = "default", ...rest }: AppTextProps) {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        "Figtree-Regular": require("../assets/fonts/Figtree-Regular.ttf"),
        "Figtree-SemiBold": require("../assets/fonts/Figtree-SemiBold.ttf"),
        "Figtree-ExtraBold": require("../assets/fonts/Figtree-ExtraBold.ttf"),
        "Figtree-Bold": require("../assets/fonts/Figtree-Bold.ttf"),
        "Figtree-Italic": require("../assets/fonts/Figtree-Italic.ttf"),
      });
      setFontsLoaded(true);
    };

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null; // or a loading indicator
  }

  return (
    <Text
      style={[
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "italic" ? styles.italic : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    fontFamily: "Figtree-Regular",
  },
  defaultSemiBold: {
    fontSize: 16,
    fontFamily: "Figtree-SemiBold",
  },
  title: {
    fontSize: 42,
    fontFamily: "Figtree-Bold",
  },
  subtitle: {
    fontSize: 36,
    fontFamily: "Figtree-Bold",
  },
  italic: {
    fontSize: 16,
    fontFamily: "Figtree-Italic",
  },
  caption: {
    fontSize: 12,
    fontFamily: "Figtree-Regular",
  },
});
