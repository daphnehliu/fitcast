import { Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View>
      <Text>FitCast</Text>
      <Text>Palo Alto</Text>
      <Text>72</Text>
      <Text>Clear</Text>
      <Text>High: 75 | Low: 70</Text>
      <View style={styles.box}/>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#B9D6F2',
    height: 100, 
    width: 100,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});