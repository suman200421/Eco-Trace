import { StyleSheet, Text, View } from "react-native";

//Start Button
export default function Start() {
    return (
        <View style={styles.container}>
            <Text
            style={{fontSize:40,
                fontWeight:700
            }}>
                Start
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
