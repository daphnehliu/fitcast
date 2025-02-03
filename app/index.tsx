import { Text, View, StyleSheet, Image } from "react-native";
import fitcast from '../assets/images/fitcast.png'
import { AppText } from '@/components/AppText';

export default function Index() {
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