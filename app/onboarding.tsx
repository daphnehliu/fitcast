import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

type OnboardingProps = {
  onFinish: (prefs: {
    coldTolerance: number | null;
    excludedItems: string[];
    prefersLayers: boolean | null;
  }) => void;
};

export default function Onboarding({ onFinish }: OnboardingProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [coldTolerance, setColdTolerance] = useState<number | null>(null);
  const [excludedItems, setExcludedItems] = useState<string[]>([]);
  const [prefersLayers, setPrefersLayers] = useState<boolean | null>(null);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const toggleExcludedItem = (item: string) => {
    setExcludedItems((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };

  const handleFinish = () => {
    // Pass the collected preferences up to the parent.
    onFinish({
      coldTolerance,
      excludedItems,
      prefersLayers,
    });
  };

  return (
    <View style={styles.container}>
      {/* Step 1: Cold Tolerance Selection */}
      {step === 1 && (
        <View>
          <Text style={styles.title}>How do you tolerate cold?</Text>
          {[
            { label: "I get cold easily (-1)", value: -1 },
            { label: "Neutral (0)", value: 0 },
            { label: "I don’t get cold much (1)", value: 1 },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                coldTolerance === option.value && styles.selectedOption,
              ]}
              onPress={() => setColdTolerance(option.value)}
            >
              <Text style={styles.optionText}>
                {option.label} {coldTolerance === option.value ? "✅" : ""}
              </Text>
            </TouchableOpacity>
          ))}
          <Button
            title="Next"
            onPress={handleNext}
            disabled={coldTolerance === null}
          />
        </View>
      )}

      {/* Step 2: Excluded Clothing Items Selection */}
      {step === 2 && (
        <View>
          <Text style={styles.title}>Select clothing items to exclude</Text>
          <Button title="Next" onPress={handleNext} />
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
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => toggleExcludedItem(item)}>
                <Text
                  style={[
                    styles.optionButton,
                    excludedItems.includes(item) && styles.selectedOption,
                  ]}
                >
                  {item} {excludedItems.includes(item) ? "🚫" : ""}
                </Text>
              </TouchableOpacity>
            )}
          />
          
        </View>
      )}

      {/* Step 3: Layering Preference */}
      {step === 3 && (
        <View>
          <Text style={styles.title}>
            Do you prefer layering clothes?
          </Text>
          <TouchableOpacity
            style={[
              styles.optionButton,
              prefersLayers === true && styles.selectedOption,
            ]}
            onPress={() => setPrefersLayers(true)}
          >
            <Text style={styles.optionText}>
              Yes {prefersLayers === true ? "✅" : ""}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton,
              prefersLayers === false && styles.selectedOption,
            ]}
            onPress={() => setPrefersLayers(false)}
          >
            <Text style={styles.optionText}>
              No {prefersLayers === false ? "✅" : ""}
            </Text>
          </TouchableOpacity>
          <Button
            title="Finish"
            onPress={handleFinish}
            disabled={prefersLayers === null}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  optionButton: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    width: 250,
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#add8e6",
  },
  optionText: {
    fontSize: 18,
  },
});
