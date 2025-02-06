import React from 'react';
import { View, Text, TextInput, Button, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientBackground from '@/components/GradientBackground';
import stormi from '../assets/images/stormi.png';
import stump from '../assets/images/stump.png';

const { width } = Dimensions.get('window'); // Get screen width

// Define your LoginScreen component
function Timeline() {
    return (
        <GradientBackground colors={["#4DC8E7", "#B0E7F0", "#FAFCA9"]} locations={[.17, 0.65, .99]}>
            <View style={styles.fit}>
                <Image source={stump} style={styles.stump}/>
                <Image source={stormi} style={styles.stormi}/>
            </View>
            <View style={styles.timeline}>

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
        height: '95%',     // Full screen height
        backgroundColor: 'rgba(255, 255, 255, 0.5)', // Optional background for visibility
        position: 'absolute',
        right: 0,   // Stick to the left
        top: 0,    // Align with top
        margin: 15,
        borderRadius: 25
    }
});


export default Timeline;