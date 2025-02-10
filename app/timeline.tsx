import React, { useRef, useState } from "react";
import { View, Text, Image, Dimensions, ScrollView } from "react-native";
import Slider from "@react-native-community/slider";
import GradientBackground from "@/components/GradientBackground";

const { width, height } = Dimensions.get("window");

function Timeline() {
  const [sliderValue, setSliderValue] = useState(0); // Tracks slider position
  const timelineHeight = height * 0.95;

  const stormi = require("../assets/images/stormi.png");
  const stump = require("../assets/images/stump.png");
  const jacket = require("../assets/images/jacket.png");
  const pants = require("../assets/images/pants.png");
  const shirt = require("../assets/images/t-shirt.png");
  const umbrella = require("../assets/images/umbrella.png");

  return (
    <GradientBackground
      colors={["rgba(255, 222, 47, 0.26)", "#B0E7F0", "rgba(39, 91, 224, 0.3)"]}
      locations={[0.05, 0.3, 0.8]}
    >
      <View style={styles.fit}>
        <Image source={stump} style={styles.stump} />
        <Image source={stormi} style={styles.stormi} />
      </View>
      <View style={styles.timeline}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#808080"
          vertical={true}
        />
        {[
          { time: "9AM", top: 0.11 },
          { time: "12PM", top: 0.41 },
          { time: "9PM", top: 0.71 },
        ].map((label, index) => (
          <View
            key={index}
            style={[styles.timeLabels, { top: timelineHeight * label.top }]}
          >
            <Text style={styles.timeLabel}>{label.time}</Text>
          </View>
        ))}
        {[
          { icons: [shirt, pants], top: 0.1 },
          { icons: [jacket, pants, umbrella], top: 0.4 },
          { icons: [jacket, pants, umbrella], top: 0.7 },
        ].map((group, index) => (
          <View
            key={index}
            style={[styles.iconContainer, { top: timelineHeight * group.top }]}
          >
            {group.icons.map((icon, idx) => (
              <Image key={idx} source={icon} style={styles.icon} />
            ))}
          </View>
        ))}
      </View>
    </GradientBackground>
  );
}

import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  fit: {
    flex: 1,
    alignItems: "center", // Centers images horizontally
  },
  stormi: {
    height: "48%", // Set custom height
    resizeMode: "contain", // Ensures the image fits inside dimensions without cropping
    position: "absolute", // Allows manual positioning
    bottom: 280, // Moves it down from the top
    left: 40, // Moves it slightly to the right
  },
  stump: {
    height: "50%",
    resizeMode: "contain",
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  timeline: {
    width: "50%", // 50% of screen width
    height: "95%", // Full screen height
    backgroundColor: "rgba(255, 255, 255, 0.5)", // Optional background for visibility
    position: "absolute",
    right: 0, // Align to the right
    top: 0, // Align to the top
    margin: 15,
    borderRadius: 25,
    justifyContent: "center", // Center the slider within the View
    alignItems: "center", // Center the slider within the View
  },
  slider: {
    marginTop: 0,
    width: height * 0.8 * (1 / 0.75),
    height: 20,
    marginLeft: 100,
    transform: [{ rotate: "90deg" }, { scaleX: 0.75 }, { scaleY: 0.75 }],
  },
  timeLabels: {
    position: "absolute",
    width: "100%",
    alignItems: "flex-end",
    paddingRight: 8, // Adjust right padding
  },
  timeLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  iconContainer: {
    flexDirection: "row", // Align icons horizontally
    alignItems: "center",
    position: "absolute", // Allows manual positioning of icons
    left: "2%",
  },
  icon: {
    height: 38,
    width: 41,
    margin: 2,
  },
});

export default Timeline;
