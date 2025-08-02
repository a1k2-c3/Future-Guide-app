// components/Technologiespage.js
import { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Animated,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import Icons from 'react-native-vector-icons/Fontisto';
import Colors from '../../constants/Colors';
import { useLogin } from '../../Login_id_passing';
import axios from 'axios';
// import { useNavigation } from '@react-navigation/native';
import { set } from 'lodash';
export default function TechnologiesScreen({ navigation }) {
    const fadeAnim = useRef([]).current;
    const translateAnim = useRef([]).current;
    const [technologies, settechnologies] = useState([]);
    const { loginId } = useLogin();
    useEffect(() => {
        const animations = technologies.map((_, index) =>
            Animated.parallel([
                Animated.timing(fadeAnim[index], {
                    toValue: 1,
                    duration: 500,
                    delay: index * 100,
                    useNativeDriver: true,
                }),
                Animated.timing(translateAnim[index], {
                    toValue: 0,
                    duration: 500,
                    delay: index * 100,
                    useNativeDriver: true,
                }),
            ])
        );
        Animated.stagger(100, animations).start();
    }, []);

    useEffect(() => {
        // console.log("Login ID:", loginId.profile_id);
        refresh();
    }, []);

    function refresh() {
        axios.get(`https://futureguide-backend.onrender.com/api/roadmaps/profile/${loginId.profile_id}`)
            .then((res) => {
                // console.log("Fetched Roadmaps:", res.data);
                const roadmaps = res.data.map((tech) => ({
                    ...tech,
                    name: tech.title?.trim() || "Untitled Roadmap",
                    icon: tech.icon || "react", // fallback if backend doesn’t send icon
                    key: tech.profileId
                }));

                // Initialize animation refs
                roadmaps.forEach((_, i) => {
                    fadeAnim[i] = new Animated.Value(0);
                    translateAnim[i] = new Animated.Value(50);
                });

                settechnologies(roadmaps);
                const animations = roadmaps.map((_, index) =>
                    Animated.parallel([
                        Animated.timing(fadeAnim[index], {
                            toValue: 1,
                            duration: 500,
                            delay: index * 100,
                            useNativeDriver: true,
                        }),
                        Animated.timing(translateAnim[index], {
                            toValue: 0,
                            duration: 500,
                            delay: index * 100,
                            useNativeDriver: true,
                        }),
                    ])
                );
                Animated.stagger(100, animations).start();
            })
            .catch(err => {
                console.error("Failed to fetch roadmaps:", err);
            });
    }
    const handleRoadmapPress = (techKey) => {
        // Navigate to loader first, then to RoadmapTimeline
        navigation.navigate('RoadmapLoader', {
            targetScreen: 'RoadmapTimeline',
            targetParams: { roadmapData: techKey }
        });
    };

    return (
        <View style={styles.container}>
            {/* Header with title and add button */}
            <View style={styles.headerRow}>
                <Text style={styles.header}>Top Technologies</Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    <TouchableOpacity onPress={() => { refresh()}}>
                        <Icons name="spinner-refresh" size={28} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('RoadmapForm')}>
                        <Icon name="plus-circle" size={28} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollWrap}>
                {technologies.map((tech, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => handleRoadmapPress(tech)}
                    >
                        <Animated.View
                            style={[styles.card, {
                                opacity: fadeAnim[index],
                                transform: [{ translateY: translateAnim[index] }],
                            }]}
                        >
                            <View style={styles.cardRow}>
                                <IconOrFA name="code-tags" />
                                <View style={{ flex: 1 }}>
                                    {/* <Text style={styles.cardPercent}>{index * 5 + 20}%</Text> */}
                                    <Text style={styles.cardTitle}>{tech.name}</Text>
                                    <Text style={styles.cardSubtext}>AI powered Roadmap curated for you</Text>
                                </View>
                            </View>
                        </Animated.View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

function IconOrFA({ name }) {
    if (name === 'aws') {
        return <FAIcon name="aws" size={48} color={Colors.aws || Colors.primaryDark} style={styles.imageIcon} />;
    }
    if (name === 'react') {
        return <Icon name="react" size={48} color={Colors.react || Colors.primary} style={styles.imageIcon} />;
    }
    if (name === 'flutter') {
        return <FAIcon name="bolt" size={48} color={Colors.flutter || Colors.primaryDark} style={styles.imageIcon} />;
    }
    return <Icon name={name} size={48} color={Colors.primaryDark} style={styles.imageIcon} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollWrap: {
        padding: 16,
        paddingBottom: 32,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 8,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textDark,
    },
    card: {
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        padding: 16,
        marginBottom: 18,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    imageIcon: {
        width: 60,
        height: 60,
        marginRight: 10,
    },
    cardPercent: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.textDark,
    },
    cardSubtext: {
        fontSize: 14,
        color: Colors.textMedium,
        marginTop: 2,
    },
});
