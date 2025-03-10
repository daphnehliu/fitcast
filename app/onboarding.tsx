import React, { useState } from "react";
import { AppText } from "@/components/AppText";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export const unstable_settings = {
  layout: "none",
};

type OnboardingProps = {
  onFinish: (prefs: {
    coldTolerance: number | null;
    excludedItems: string[];
    prefersLayers: boolean | null;
  }) => void;
};

export default function Onboarding({ onFinish }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [coldTolerance, setColdTolerance] = useState<number | null>(null);
  const [prefersLayers, setPrefersLayers] = useState<boolean | null>(null);

  // Define the clothing options and images.
  const clothingOptions = ["Jacket", "T‑Shirt", "Shorts", "Pants"];
  const clothingImages: { [key: string]: any } = {
    Jacket: require("../assets/images/jacket.png"),
    "T‑Shirt": require("../assets/images/t-shirt.png"),
    Shorts: require("../assets/images/shorts.png"),
    Pants: require("../assets/images/pants.png"),
  };

  // All clothing items are auto‑selected by default.
  const [selectedClothes, setSelectedClothes] = useState<string[]>([...clothingOptions]);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const toggleClothing = (item: string) => {
    setSelectedClothes((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleFinish = () => {
    const computedExcludedItems = clothingOptions.filter(
      (item) => !selectedClothes.includes(item)
    );
    onFinish({
      coldTolerance,
      excludedItems: computedExcludedItems,
      prefersLayers,
    });
  };

  return (
    <LinearGradient
      colors={["#4D92D9", "#B0E7F0"]}
      style={styles.gradientContainer}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Step 0: Welcome */}
        {step === 0 && (
          <View style={styles.stepContainer}>
            <Image
              source={require("../assets/images/fitcastWhite.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <AppText style={[styles.title, { fontFamily: "Roboto-Bold" }]}>
              Welcome to FitCast!
            </AppText>
            <AppText style={styles.blurb}>
              FitCast gives you personalized outfit recommendations based on the weather. Answer a few quick questions and let us tell you what to wear!
            </AppText>
            <TouchableOpacity style={styles.navButton} onPress={handleNext}>
              <AppText style={styles.navButtonText}>Get Started</AppText>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 1: Cold tolerance */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <AppText style={styles.title}>
              How well do you tolerate cold weather?
            </AppText>
            {[
              { label: "I feel cold easily", value: -1 },
              { label: "Neutral", value: 0 },
              { label: "I don’t feel cold easily", value: 1 },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  coldTolerance === option.value && styles.selectedOption,
                ]}
                onPress={() => setColdTolerance(option.value)}
              >
                <AppText style={styles.optionText}>{option.label}</AppText>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.navButton,
                coldTolerance === null && styles.disabledButton,
              ]}
              onPress={handleNext}
              disabled={coldTolerance === null}
            >
              <AppText style={styles.navButtonText}>Next</AppText>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Clothing selection */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <AppText style={styles.title}>
              Select all clothing items that you wear
            </AppText>
            <View style={styles.clothingContainer}>
              {clothingOptions.map((item) => (
                <View key={item} style={styles.clothingItemContainer}>
                  <TouchableOpacity
                    onPress={() => toggleClothing(item)}
                    style={[
                      styles.clothingItem,
                      selectedClothes.includes(item) && styles.selectedOption,
                    ]}
                  >
                    <Image
                      source={clothingImages[item]}
                      style={styles.clothingImage}
                      resizeMode="contain"
                    />
                    {selectedClothes.includes(item) && (
                      <View style={styles.checkMarkContainer}>
                        <AppText style={styles.checkMark}>✓</AppText>
                      </View>
                    )}
                  </TouchableOpacity>
                  <AppText style={styles.clothingLabel}>{item}</AppText>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.navButton} onPress={handleNext}>
              <AppText style={styles.navButtonText}>Next</AppText>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Layering preference */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <AppText style={styles.title}>
              Do you prefer layering clothes?
            </AppText>
            <TouchableOpacity
              style={[
                styles.optionButton,
                prefersLayers === true && styles.selectedOption,
              ]}
              onPress={() => setPrefersLayers(true)}
            >
              <AppText style={styles.optionText}>Yes</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                prefersLayers === false && styles.selectedOption,
              ]}
              onPress={() => setPrefersLayers(false)}
            >
              <AppText style={styles.optionText}>No</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.navButton,
                prefersLayers === null && styles.disabledButton,
              ]}
              onPress={handleFinish}
              disabled={prefersLayers === null}
            >
              <AppText style={styles.navButtonText}>Finish</AppText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  stepContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 27,
    // Use a bold font variant if needed. Adjust "Roboto-Bold" to match your setup.
    // fontWeight may not work if your font doesn't support it.
    fontFamily: "Roboto-Bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#FFF",
  },
  blurb: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    color: "#FFF",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    color: "#FFF",
  },
  optionButton: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#FFF",
    borderRadius: 8,
    width: 250,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  selectedOption: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 2,
    borderColor: "#B0E7F0",
  },
  optionText: {
    fontSize: 18,
    color: "#333",
  },
  navButton: {
    backgroundColor: "#0353A4",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#888",
  },
  navButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  clothingContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  clothingItemContainer: {
    alignItems: "center",
    margin: 10,
  },
  clothingItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
    borderColor: "#FFF",
  },
  clothingImage: {
    width: 70,
    height: 70,
  },
  clothingLabel: {
    marginTop: 5,
    fontSize: 14,
    color: "#FFF",
    textAlign: "center",
  },
  checkMarkContainer: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4A90E2",
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "bold",
  },
});
