import React, { useRef, useState } from "react";
import { View, Text, Image, Dimensions, ScrollView} from 'react-native';
import Slider from '@react-native-community/slider';
import GradientBackground from '@/components/GradientBackground';
import stormi from '../assets/images/stormi.png';
import stump from '../assets/images/stump.png';

const { width, height } = Dimensions.get("window");

function Timeline() {
        const [sliderValue, setSliderValue] = useState(0); // Tracks slider position

    return (
        <GradientBackground colors={["#4DC8E7", "#B0E7F0", "#FAFCA9"]} locations={[.17, 0.65, .99]}>
            <View style={styles.fit}>
                <Image source={stump} style={styles.stump}/>
                <Image source={stormi} style={styles.stormi}/>
            </View>
             {/* Scrollable Timeline */}
             <View style={styles.timeline}>
             <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#808080"
                vertical = {true}
                />
            </View>
        </GradientBackground>
    );
}

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    fit: {
        flex: 1, 
        alignItems: 'center',       // Centers images horizontally
    },
    stormi: {
        height: 180,  // Set custom height
        resizeMode: 'contain',  // Ensures the image fits inside dimensions without cropping
        position: 'absolute',   // Allows manual positioning
        bottom: 280,     // Moves it down from the top
        left: 40,    // Moves it slightly to the right
    },
    stump: {
        height: '50%',
        resizeMode: 'contain',
        position: 'absolute',
        bottom: 0, 
        left: 0, 
    },
    timeline: {
        width: '50%', // 50% of screen width
        height: '95%', // Full screen height
        backgroundColor: 'rgba(255, 255, 255, 0.5)', // Optional background for visibility
        position: 'absolute',
        right: 0, // Align to the right
        top: 0, // Align to the top
        margin: 15,
        borderRadius: 25,
        justifyContent: 'center', // Center the slider within the View
        alignItems: 'center', // Center the slider within the View
    },
    slider: {
        marginTop: 0,
        width: height * 0.8 * (1/0.75), 
        height: 20, 
        marginLeft: 100,
        transform:[{rotate: "90deg"}, { scaleX: 0.75 }, { scaleY: 0.75 }]


    }
});


export default Timeline;