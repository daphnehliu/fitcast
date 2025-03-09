import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppText } from "@/components/AppText";

const { width } = Dimensions.get("window");

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

export default function PackingPage() {
  const [destination, setDestination] = useState("Loading...");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedDestination = await AsyncStorage.getItem("destination");
        const storedStartDate = await AsyncStorage.getItem("start_date");
        const storedEndDate = await AsyncStorage.getItem("end_date");

        if (storedDestination) setDestination(storedDestination);
        if (storedStartDate)
          setStartDate(new Date(storedStartDate).toDateString());
        if (storedEndDate) setEndDate(new Date(storedEndDate).toDateString());
      } catch (error) {
        console.error("Error retrieving data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <LinearGradient colors={["#4DC8E7", "#B0E7F0"]} style={styles.gradient}>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#FFFFFF"
            style={styles.loader}
          />
        ) : (
          <>
            <View style={styles.headerContainer}>
              <AppText type="title" style={styles.header}>
                Packing for {destination}
              </AppText>
              <AppText style={styles.dateText}>
                {startDate} - {endDate}
              </AppText>
            </View>

            <AppText type="defaultSemiBold" style={styles.timelineHeader}>
              Trip Timeline
            </AppText>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.timelineContainer}
            >
              {[startDate, endDate].map((date, index) => (
                <View key={index} style={styles.timelineItem}>
                  <AppText style={styles.dateText}>{date}</AppText>
                  <Image
                    source={require("../../assets/images/jacket.png")}
                    style={styles.timelineIcon}
                  />
                  <Image
                    source={require("../../assets/images/pants.png")}
                    style={styles.timelineIcon}
                  />
                </View>
              ))}
            </ScrollView>

            <AppText type="defaultSemiBold" style={styles.packingListHeader}>
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
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1, justifyContent: "center" },
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loader: { marginTop: 50 },

  headerContainer: { marginTop: 50, alignItems: "center" },
  header: {
    fontSize: 30,
    color: "white",
    marginBottom: 5,
    textAlign: "center",
  },
  dateText: { fontSize: 18, color: "white", marginBottom: 15 },

  timelineHeader: {
    fontSize: 22,
    color: "white",
    marginBottom: 10,
    textAlign: "center",
  },
  timelineContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  timelineItem: {
    alignItems: "center",
    marginHorizontal: 15,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
  },
  timelineIcon: { width: 50, height: 50, margin: 5, resizeMode: "contain" },

  packingListHeader: {
    fontSize: 22,
    color: "white",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  packingItem: { alignItems: "center", margin: 10, flex: 1 },
  icon: { width: 60, height: 60, resizeMode: "contain" },
  packingText: { color: "white", fontSize: 18, marginTop: 5 },
});
