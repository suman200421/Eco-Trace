import { StyleSheet, Text, View } from "react-native";

//Notification Tab
export default function Notification() {
    return (
        <View style={styles.container}>
            <Text
            style={{fontSize:40,
                fontWeight:700
            }}>
                Notification
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        paddingTop: 22,
    },
});
