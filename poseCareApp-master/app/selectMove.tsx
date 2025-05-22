import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export default function SelectMoveScreen() {
    const router = useRouter();
    const [selectedMove, setSelectedMove] = useState<string | null>(null);
    const [reps, setReps] = useState("");
    const isValidReps = /^\d+$/.test(reps) && parseInt(reps, 10) > 0;

    const handleSelect = (movement: string) => {
        setSelectedMove(movement);
    };

    const handleNavigate = () => {
        const isValidReps = /^\d+$/.test(reps) && parseInt(reps, 10) > 0;
        if (selectedMove && isValidReps) {
            router.push(`/detail/${selectedMove}?reps=${reps}`);
        } else {
            alert("Lütfen geçerli bir tekrar sayısı girin.");
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: "Hareket Seç",
                    contentStyle: { backgroundColor: "#000" },
                }}
            />
            <View style={{ flex: 1, backgroundColor: "#000", padding: 24 }}>
                <Text style={{ color: "#fff", fontSize: 22, marginBottom: 10 }}>Hareket Seç</Text>

                {["Squat", "Bridge"].map((movement) => (
                    <Pressable
                        key={movement}
                        style={[
                            styles.button,
                            selectedMove === movement && { backgroundColor: "#B0FF35" },
                        ]}
                        onPress={() => handleSelect(movement)}
                    >
                        <Text style={[styles.text, selectedMove === movement && { color: "#000" }]}>{movement}</Text>
                    </Pressable>
                ))}

                {selectedMove && (
                    <>
                        <Text style={{ color: "#fff", marginTop: 16 }}>Kaç tekrar yapmak istiyorsun?</Text>
                        <TextInput
                            value={reps}
                            onChangeText={setReps}
                            placeholder="Örn: 10"
                            keyboardType="numeric"
                            placeholderTextColor="#999"
                            style={{
                                borderColor: "#B0FF35",
                                borderWidth: 1,
                                padding: 10,
                                borderRadius: 10,
                                color: "#fff",
                                marginTop: 8,
                            }}
                        />

                        <Pressable
                            style={[styles.button, { marginTop: 10, backgroundColor: "#B0FF35" }]}
                            onPress={handleNavigate}
                        >
                            <Text style={{ color: "#000", fontSize: 18 }}>Devam Et</Text>
                        </Pressable>
                    </>
                )}
            </View>
        </>
    );
}

const styles = {
    button: {
        backgroundColor: "#111",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderColor: "#B0FF35",
        borderWidth: 1,
    },
    text: {
        color: "#fff",
        fontSize: 18,
    },
};
