import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { AppText } from "@/components/AppText";

const { width, height } = Dimensions.get("window");

// Hardcoded packing list with item counts and icons
const packingItems = [
  {
    icon: require("../../assets/images/jacket.png"),
    label: "Jacket",
    count: 2,
  },
  { icon: require("../../assets/images/pants.png"), label: "Pants", count: 3 },
  {
    icon: require("../../assets/images/t-shirt.png"),
    label: "T-Shirts",
    count: 4,
  },
  {
    icon: require("../../assets/images/umbrella.png"),
    label: "Umbrella",
    count: 1,
  },
];

// Timeline slider outfits for different times of the day
const timelineOutfits = [
  { time: "9AM", outfit: ["t-shirt", "pants"] },
  { time: "12PM", outfit: ["jacket", "pants", "umbrella"] },
  { time: "6PM", outfit: ["jacket", "pants"] },
];

// Image map for outfit icons (for dynamic image resolution)
const outfitIcons: { [key: string]: any } = {
  "t-shirt": require("../../assets/images/t-shirt.png"),
  pants: require("../../assets/images/pants.png"),
  jacket: require("../../assets/images/jacket.png"),
  umbrella: require("../../assets/images/umbrella.png"),
};

export default function Results() {
  const [sliderValue, setSliderValue] = useState(0);

  // Get outfit for current slider position
  const currentOutfit =
    timelineOutfits[Math.round(sliderValue * (timelineOutfits.length - 1))];

  return (
    <LinearGradient colors={["#4DC8E7", "#B0E7F0"]} style={styles.gradient}>
      <View style={styles.container}>
        {/* Packing List Section */}
        <View style={styles.packingList}>
          <AppText type="title" style={styles.header}>
            Packing List
          </AppText>
          <FlatList
            data={packingItems}
            numColumns={2}
            keyExtractor={(item) => item.label}
            renderItem={({ item }) => (
              <View style={styles.packingItem}>
                <Image source={item.icon} style={styles.icon} />
                <Text style={styles.packingText}>
                  {item.label} x{item.count}
                </Text>
              </View>
            )}
          />
        </View>

        {/* Fitcast Section */}
        <View style={styles.fitcast}>
          <Image
            source={require("../../assets/images/stormi.png")}
            style={styles.stormiAvatar}
          />
          <AppText style={styles.fitcastText}>
            Fitcast: "Layer Up – It’s Cold Later!"
          </AppText>
        </View>

        {/* Slider Timeline Section */}
        <View style={styles.timeline}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            step={1 / (timelineOutfits.length - 1)}
            value={sliderValue}
            onValueChange={(value) => setSliderValue(value)}
          />
          <View style={styles.timeLabels}>
            {timelineOutfits.map((slot, index) => (
              <Text key={index} style={styles.timeLabel}>
                {slot.time}
              </Text>
            ))}
          </View>

          {/* Outfit Icons based on slider time */}
          <View style={styles.outfitDisplay}>
            {currentOutfit.outfit.map((item, index) => (
              <Image
                key={index}
                source={outfitIcons[item]}
                style={styles.outfitIcon}
              />
            ))}
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, padding: 20 },

  // Packing List Styles
  packingList: { alignItems: "center", marginBottom: 20 },
  header: { fontSize: 24, color: "white", marginBottom: 10 },
  packingItem: { alignItems: "center", margin: 10, flex: 1 },
  icon: { width: 50, height: 50, resizeMode: "contain" },
  packingText: { color: "white", fontSize: 16, marginTop: 5 },

  // Fitcast Section
  fitcast: { alignItems: "center", marginBottom: 20 },
  stormiAvatar: { width: 100, height: 100, resizeMode: "contain" },
  fitcastText: {
    fontSize: 18,
    color: "white",
    marginTop: 10,
    textAlign: "center",
  },

  // Timeline & Slider
  timeline: { alignItems: "center", marginTop: 10 },
  slider: { width: width * 0.8, height: 40 },
  timeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 10,
  },
  timeLabel: { color: "white", fontSize: 14 },
  outfitDisplay: { flexDirection: "row", marginTop: 10 },
  outfitIcon: { width: 40, height: 40, margin: 5, resizeMode: "contain" },
});
