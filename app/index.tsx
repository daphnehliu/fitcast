import { Text, View, StyleSheet, Image, Button} from "react-native";
import fitcast from '../assets/images/fitcast.png'
import { AppText } from '@/components/AppText';
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <View>
      <View>
        <AppText style={styles.headertext} type='title'>Your</AppText>
        <Image source={fitcast} style={styles.image}/>
      </View>

      <Text>Palo Alto</Text>
      <Text>72</Text>
      <Text>Clear</Text>
      <Text>High: 75 | Low: 70</Text>
      <View style={styles.box}/>
      <Button title="View Timeline" onPress={() => router.push("/timeline")} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#B9D6F2',
    height: 100, 
    width: 100,
  },
  image: {
    width: 150, 
    height: 150, 
    resizeMode: "contain",
  },
  headertext: {
    color: '#0353A4',
  }
});