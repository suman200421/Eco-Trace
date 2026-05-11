import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from "expo-router";
import { View } from 'react-native';
import { colors } from '../../lib/colors';

export default function RootLayout() {
    return (
        <Tabs
            screenOptions={{
                headerTitleAlign: "center",
                headerStyle: { backgroundColor: colors.bg },
                headerTitleStyle: { color: colors.text },
                tabBarStyle: {
                    backgroundColor: colors.bg,
                    borderTopColor: colors.border,
                },
                headerStatusBarHeight: 14,
                tabBarItemStyle: { paddingBottom: 10 },
                tabBarActiveTintColor: "#c2ca29",
                tabBarInactiveTintColor: "#000000",

                //to remove the header use this
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome5 name="home" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="stats"
                options={{
                    title: "Stats",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="stats-chart" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="start"
                options={{
                    title: "",
                    tabBarIcon: ({ focused }) => (
                        <View
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: colors.accent,
                                alignItems: "center",
                                justifyContent: "center",
                                marginTop: 8,
                            }}
                        >
                            <Ionicons
                                name="add"
                                size={30}
                                color="#FFFFFF"
                            />
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="notifications"
                options={{
                    title: "Notifications",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="notifications-active" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="user" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
