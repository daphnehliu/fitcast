import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname(); // gets current route/path
  // navigate only if the user is NOT already on that screen
  const goToScreen = (screen) => {
    if (pathname !== screen) {
      router.push(screen);
    }
  };
  
  return (
    <View style={styles.navBar}>
      <TouchableOpacity style={styles.navItem} onPress={() => goToScreen("/")}>
        <Ionicons
          name={pathname === "/" ? "home" : "home-outline"}
          size={24}
          color={pathname === "/" ? "#023E7D" : "#0353A4"}
        />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => goToScreen("/timeline")}
      >
        <Ionicons
          name={pathname === "/timeline" ? "time" : "time-outline"}
          size={24}
          color={pathname === "/timeline" ? "#023E7D" : "#0353A4"}
        />
        <Text style={styles.navText}>Timeline</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => goToScreen("/packing/packing")}
      >
        <MaterialCommunityIcons
          name={
            pathname === "/packing/packing"
              ? "bag-personal"
              : "bag-personal-outline"
          }
          size={24}
          color={pathname === "/packing/packing" ? "#023E7D" : "#0353A4"}
        />
        <Text style={styles.navText}>Packing</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => goToScreen("/profile")}
      >
        <Ionicons
          name={
            pathname === "/profile" ? "person-circle" : "person-circle-outline"
          }
          size={24}
          color={pathname === "/profile" ? "#023E7D" : "#0353A4"}
        />
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
