import React, { useRef, useEffect, useState } from 'react';
import { Text, View, Animated, StyleSheet, Easing, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import LottieView from 'lottie-react-native';
import LottieAnimi from './Resanime.json';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';

const BAR_WIDTH = 330;
const BAR_HEIGHT = 16;
const CHECK_SIZE = 24;
const ANIMATION_DURATION = 6000;
const messages = [
    "Insights in progress — your resume is under the spotlight.", 
    "Translating your achievements into insights — hang tight...", 
    "Great things take time — analyzing your resume for tailored insights..."
];

const ResLoader = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const fileData = route.params?.fileData;
    const animationRef = useRef(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const intervalRef = useRef(null);
    const animationLoopRef = useRef(null);
    const progress = useRef(new Animated.Value(0)).current;

    // Check animations
    const check1 = useRef(new Animated.Value(0)).current;
    const check2 = useRef(new Animated.Value(0)).current;
    const check3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!fileData) {
            Alert.alert('Error', 'No file data found');
            navigation.goBack();
            return;
        }

        // Start Lottie animation
        animationRef.current?.play();

        // Start the rotating messages
        intervalRef.current = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, 3000);

        // Start loader animation
        startLoaderAnimation();

        // Make axios call
        uploadFile();

        // Cleanup function
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (animationLoopRef.current) {
                clearTimeout(animationLoopRef.current);
            }
            progress.stopAnimation();
            check1.stopAnimation();
            check2.stopAnimation();
            check3.stopAnimation();
        };
    }, [fileData, navigation]);

    const uploadFile = async () => {
        try {
            console.log('Starting file upload...');
            
            // Create proper FormData with correct headers
            const formData = new FormData();
            formData.append('pdf', fileData._parts[0][1]); // Extract the actual file object
            
            const response = await axios.post('https://localhost:8089/upload-resume', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000, // 30 second timeout
            });

            console.log('Upload successful:', response.data);
            
            // Stop loading animations
            setIsLoading(false);
            
            // Navigate to ResumeDetail with the response data
            navigation.replace('ResumeDetail', { data: response.data });
            
        } catch (error) {
            console.error('Upload error:', error);
            setIsLoading(false);
            
            let errorMessage = 'Upload failed. Please try again.';
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timeout. Please check your connection.';
            } else if (error.response) {
                errorMessage = `Server error: ${error.response.status}`;
            } else if (error.request) {
                errorMessage = 'Network error. Please check your connection.';
            }
            
            Alert.alert('Upload Error', errorMessage, [
                {
                    text: 'Retry',
                    onPress: () => uploadFile()
                },
                {
                    text: 'Go Back',
                    onPress: () => navigation.goBack()
                }
            ]);
        }
    };

    const startLoaderAnimation = () => {
        const loopAnimation = () => {
            if (!isLoading) return;

            progress.setValue(0);
            check1.setValue(0);
            check2.setValue(0);
            check3.setValue(0);

            Animated.parallel([
                Animated.timing(progress, {
                    toValue: 1,
                    duration: ANIMATION_DURATION,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
                Animated.sequence([
                    Animated.delay(ANIMATION_DURATION * 0.29),
                    Animated.timing(check1, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: false,
                    }),
                ]),
                Animated.sequence([
                    Animated.delay(ANIMATION_DURATION * 0.59),
                    Animated.timing(check2, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: false,
                    }),
                ]),
                Animated.sequence([
                    Animated.delay(ANIMATION_DURATION * 0.89),
                    Animated.timing(check3, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: false,
                    }),
                ]),
            ]).start(() => {
                if (isLoading) {
                    animationLoopRef.current = setTimeout(loopAnimation, 100);
                }
            });
        };

        loopAnimation();
    };

    // Interpolate bar width
    const barWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, BAR_WIDTH],
    });

    // Interpolate check scale and color
    const getCheckStyle = (animValue) => ({
        transform: [
            {
                scale: animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.75, 1],
                }),
            },
        ],
        backgroundColor: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['#535353', 'rgb(0,205,0)'],
        }),
    });

    return (
        <View style={styles.resOverall}>
            <View style={styles.loader}>
                <Animated.View style={[styles.bar, { width: barWidth }]} />
                <View style={styles.checkBarContainer}>
                    <Animated.View style={[styles.check, getCheckStyle(check1)]}>
                        <CheckIcon />
                    </Animated.View>
                    <Animated.View style={[styles.check, getCheckStyle(check2)]}>
                        <CheckIcon />
                    </Animated.View>
                    <Animated.View style={[styles.check, getCheckStyle(check3)]}>
                        <CheckIcon />
                    </Animated.View>
                </View>
            </View>
            <LottieView 
                ref={animationRef} 
                source={LottieAnimi} 
                autoPlay 
                loop
                style={{ width: 320, height: 300 }} 
            />
            <View>
                <Text style={styles.loadingTextt}>
                    {messages[currentIndex]}
                </Text>
            </View>
        </View>
    );
};

const CheckIcon = () => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path
            d="m4.5 12.75 6 6 9-13.5"
            stroke="white"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
        />
    </Svg>
);

const styles = StyleSheet.create({
    resOverall: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 35,
        padding: 12,
    },
    loader: {
        backgroundColor: '#535353',
        borderRadius: BAR_HEIGHT / 2,
        height: BAR_HEIGHT,
        width: BAR_WIDTH,
        justifyContent: 'center',
        marginTop: 40,
        marginBottom: 40,
    },
    bar: {
        position: 'absolute',
        backgroundColor: 'rgb(0,205,0)',
        height: BAR_HEIGHT,
        borderRadius: BAR_HEIGHT / 2,
        left: 0,
        top: 0,
    },
    checkBarContainer: {
        position: 'absolute',
        left: 0,
        top: -CHECK_SIZE / 3,
        width: '98%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 2,
    },
    check: {
        borderRadius: CHECK_SIZE / 2,
        height: CHECK_SIZE,
        width: CHECK_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        top: 4,
        backgroundColor: '#535353',
    },
    loadingTextt: {
        fontSize: 20,
        textAlign: 'center',
        color: '#F59E0B',
        paddingHorizontal: 20,
    },
});

export default ResLoader;