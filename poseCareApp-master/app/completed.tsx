import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function CompletedScreen() {
    const { correct, incorrect, move } = useLocalSearchParams();
    const router = useRouter();

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000", padding: 24 }}>
            <Text style={{ color: "#B0FF35", fontSize: 26, marginBottom: 10 }}>Egzersiz Tamamlandı 🎉</Text>
            <Text style={{ color: "#fff", fontSize: 18, marginBottom: 20 }}>{move} Egzersizi Sonuçları:</Text>

            <Text style={{ color: "#fff", fontSize: 18 }}>✅ Doğru: {correct}</Text>
            <Text style={{ color: "#fff", fontSize: 18, marginBottom: 20 }}>❌ Yanlış: {incorrect}</Text>

            <Pressable
                onPress={() => router.replace("/")}
                style={{
                    backgroundColor: "#B0FF35",
                    padding: 16,
                    borderRadius: 12,
                }}
            >
                <Text style={{ color: "#000", fontSize: 18 }}>Ana Sayfa</Text>
            </Pressable>
        </View>
    );
}
