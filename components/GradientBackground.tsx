import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';  // ✅ Correct for Expo

interface GradientBackgroundProps {
    colors?: [string, string, ...string[]]; // At least 2 colors required
    locations?: [number, number, ...number[]]; // At least 2 locations required
  style?: ViewStyle; // height, width, padding
  // controls direction: x = 0 left 1 right, y = 0 top 1 bottom
  start?: { x: number; y: number }; 
  end?: { x: number; y: number };
  children?: React.ReactNode; // Content inside the gradient
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({
    colors = ["#4DC8E7", "#B0E7F0", "#FAFCA9"], // Default gradient colors
    locations, // Optional color stop positions
    style,
    start = { x: 0, y: 0 }, // Default: top-left
    end = { x: 0, y: 1 }, // Default: bottom-right
    children,
  }) => {
    return (
      <LinearGradient colors={colors} locations={locations} start={start} end={end} style={[styles.gradient, style]}>
        {children}
      </LinearGradient>
    );
  };
  
  const styles = StyleSheet.create({
    gradient: {
      flex: 1, // Takes full space
    },
  });

export default GradientBackground;
