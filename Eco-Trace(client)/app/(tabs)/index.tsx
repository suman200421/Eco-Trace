import { Text, View } from "react-native";
import { colors } from "../../lib/colors";

//Home Tab
export default function Home() {
    return (
        <View
            style={{alignItems:"center"}}
        >
            <Text
            style={{fontSize:40,
                fontWeight:700,
                color:colors.text,
            }}>
                Home
            </Text>
        </View>
    );
}