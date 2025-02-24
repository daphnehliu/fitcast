import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function NavBar() {
    const router = useRouter();
  
    return (
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/timeline")}>
          <Ionicons name="time-outline" size={24} color="#0353A4" />
          <Text style={styles.navText}>Timeline</Text>
        </TouchableOpacity>
  
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/packing/packing")}>
          <MaterialCommunityIcons name="bag-personal-outline" size={24} color="#0353A4" />
          <Text style={styles.navText}>Packing</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}  onPress={() => router.push("/profile")}>
            <Ionicons name="person-circle-outline" size={24} color="#0353A4" />
            <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    );
}

const styles = StyleSheet.create({
    navBar: {
      flexDirection: "row",
      justifyContent: "space-around",
      backgroundColor: "white",
      paddingVertical: 10,
      position: "absolute",
      bottom: 0,
      width: "100%",
      borderTopWidth: 1,
      borderTopColor: "#D3D3D3",
    },
    navItem: {
      alignItems: "center",
    },
    navText: {
      fontSize: 12,
      color: "#0353A4",
    },
});
