import { Text, View, StyleSheet, Image, Button } from "react-native";
import fitcast from "../assets/images/fitcast.png";
import { AppText } from "@/components/AppText";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <View>
      <View style={styles.header}>
        <AppText style={styles.headertext} type="title">
          Your
        </AppText>
        <Image source={fitcast} style={styles.image} />
      </View>

      <View style={styles.weatherBox}>
        <Text style={styles.locationText}>Palo Alto, CA</Text>
        <Text style={styles.tempText}>72º</Text>
        <Text style={styles.weatherDetailsText}>Clear</Text>
        <Text>High: 75 | Low: 70</Text>
      </View>
      <View style={styles.fitcastBox}>
        <View style={styles.fitcastBoxLight}>
          <View style={styles.fitcastLabel}>
            <Text style={styles.weatherDetailsText}>Now: dress light</Text>
            <Text style={styles.weatherDetailsText}>Later: layer up</Text>
          </View>

          <View>
            <Text style={styles.weatherDetailsText}>images</Text>
          </View>
        </View>

        <View style={styles.fitcastDescription}>
          <Text style={styles.fitcastDescriptionText}>
            Dress light but layer up for later
          </Text>
        </View>
        <Button
          title="View Timeline"
          onPress={() => router.push("/timeline")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: 150,
    height: 50,
    resizeMode: "contain",
  },
  headertext: {
    paddingTop: 25,
    paddingRight: 6,
    color: "#0353A4",
    fontSize: 37,
    height: 50,
    textAlign: "center",
    alignItems: "center",
  },
  weatherBox: {
    alignItems: "center",
    padding: 50,
  },
  locationText: {
    fontSize: 25,
  },
  tempText: {
    fontSize: 100,
  },
  weatherDetailsText: {
    fontSize: 20,
    flex: 1,
  },
  fitcastBox: {
    height: 150,
    width: 375,
    alignItems: "center",
    margin: 14,
  },
  fitcastBoxLight: {
    backgroundColor: "#B9D6F2",
    alignItems: "center",
    borderRadius: 15,
  },
  fitcastLabel: {
    flexDirection: "row",
  },
  fitcastDescription: {
    backgroundColor: "#0353A4",
    color: "white",
    height: 30,
    width: 375,
    borderRadius: 10,
  },
  fitcastDescriptionText: {
    color: "white",
    margin: 1,
  },
});
