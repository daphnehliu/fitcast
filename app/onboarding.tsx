import React, { useState } from "react";
import { AppText } from "@/components/AppText";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
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
  const [step, setStep] = useState(1);
  const [coldTolerance, setColdTolerance] = useState<number | null>(null);
  const [excludedItems, setExcludedItems] = useState<string[]>([]);
  const [prefersLayers, setPrefersLayers] = useState<boolean | null>(null);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const toggleExcludedItem = (item: string) => {
    setExcludedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleFinish = () => {
    onFinish({
      coldTolerance,
      excludedItems,
      prefersLayers,
    });
  };

  return (
    <LinearGradient
      colors={["#4D92D9", "#B0E7F0"]}
      style={styles.gradientContainer}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
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
                <AppText style={styles.optionText}>
                  {option.label} {coldTolerance === option.value ? "✅" : ""}
                </AppText>
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

        {step === 2 && (
          <View style={styles.stepContainer}>
            <AppText style={styles.title}>
              Select any clothing items you don't wear
            </AppText>
            <FlatList
              data={[
                "Jacket",
                "Sweater",
                "Hoodie",
                "Jeans",
                "Shorts",
                "T-Shirt",
                "Gloves",
                "Scarf",
                "Boots",
              ]}
              keyExtractor={(item) => item}
              scrollEnabled={false} // <-- Disable internal scrolling
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => toggleExcludedItem(item)}>
                  <AppText
                    style={[
                      styles.optionButton,
                      excludedItems.includes(item) && styles.selectedOption,
                    ]}
                  >
                    {item} {excludedItems.includes(item) ? "🚫" : ""}
                  </AppText>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.navButton} onPress={handleNext}>
              <AppText style={styles.navButtonText}>Next</AppText>
            </TouchableOpacity>
          </View>
        )}

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
              <AppText style={styles.optionText}>
                Yes {prefersLayers === true ? "✅" : ""}
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                prefersLayers === false && styles.selectedOption,
              ]}
              onPress={() => setPrefersLayers(false)}
            >
              <AppText style={styles.optionText}>
                No {prefersLayers === false ? "✅" : ""}
              </AppText>
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
    justifyContent: "center", // Center vertically
    alignItems: "center",
    padding: 20,
  },
  stepContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
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
    backgroundColor: "#FEEA7B",
    borderColor: "#FBCB0A",
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
});
