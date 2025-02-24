import React, { useRef, useState, useEffect } from "react";
import { View, Text, Image, Dimensions, ScrollView } from "react-native";
import Slider from "@react-native-community/slider";
import GradientBackground from "@/components/GradientBackground";
import { AppText } from "@/components/AppText";

const { width, height } = Dimensions.get("window");

function Timeline() {
  const [sliderValue, setSliderValue] = useState(0);
  const [gradientColors, setGradientColors] = useState([
    "rgba(255, 222, 47, 0.26)",
    "#B0E7F0",
    "rgba(39, 91, 224, 0.3)",
  ]);
  const scrollViewRef = useRef(null);
  const groupCount = 3;
  const timelineWidth = width * groupCount;

  const jacket = require("../assets/images/jacket.png");
  const pants = require("../assets/images/pants.png");
  const shirt = require("../assets/images/t-shirt.png");
  const umbrella = require("../assets/images/umbrella.png");

  const iconGroups = [
    { icons: [shirt, pants] },
    { icons: [jacket, pants, umbrella] },
    { icons: [jacket, pants, umbrella] },
  ];

  useEffect(() => {
    const groupIndex = Math.round(sliderValue * (groupCount - 1));
    const scrollX = groupIndex * width;

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: scrollX, animated: true });
    }

    if (groupIndex === 0) {
      setGradientColors([
        "rgba(255, 183, 77, 0.8)",
        "rgba(255, 244, 214, 0.9)",
        "#4D92D9",
      ]);
    } else if (groupIndex === 1) {
      setGradientColors(["#4D92D9", "#4D92D9", "#4D92D9"]);
    } else {
      setGradientColors(["#4D92D9", "rgba(250, 159, 22, 0.8)", "#0B1A4"]);
    }
  }, [sliderValue]);

  return (
    <GradientBackground
      colors={gradientColors}
      locations={[0.05, 0.5, 0.95]}
      style={{ display: "flex", justifyContent: "center" }}
    >
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60%",
        }}
      >
        <ScrollView
          style={styles.outfitContainer}
          ref={scrollViewRef}
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ width: timelineWidth }}
        >
          {iconGroups.map((group, index) => (
            <View
              key={index}
              style={[styles.iconGroup, { width, justifyContent: "center" }]}
            >
              {group.icons.map((icon, idx) => (
                <Image key={idx} source={icon} style={styles.icon} />
              ))}
            </View>
          ))}
        </ScrollView>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          step={1 / (groupCount - 1)}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#808080"
          value={sliderValue}
          onValueChange={setSliderValue}
        />
        <View style={styles.timeLabelsContainer}>
          <AppText style={styles.timeLabel}>9 AM</AppText>
          <AppText style={styles.timeLabel}>12 PM</AppText>
          <AppText style={styles.timeLabel}>9 PM</AppText>
        </View>
      </View>
    </GradientBackground>
  );
}

import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  outfitContainer: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 25,
    padding: 10,
  },
  slider: {
    width: width * 0.9,
    height: 20,
    marginTop: 20,
  },
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
});

export default Timeline;
