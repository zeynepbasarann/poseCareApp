import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CompletedScreen() {
    const { correct, incorrect, move, wrong_angles } = useLocalSearchParams();
    const router = useRouter();
    const [feedback, setFeedback] = useState<string[]>([]);
    const [advice, setAdvice] = useState<string | null>(null);
    const [accuracy, setAccuracy] = useState<number | null>(null);

    useEffect(() => {
        const correctCount = parseInt(correct as string) || 0;
        const incorrectCount = parseInt(incorrect as string) || 0;
        const total = correctCount + incorrectCount;

        const movement = (move as string)?.toLowerCase();

        if (total > 0) {
            const acc = (correctCount / total) * 100;
            const calculatedAccuracy = Number(acc.toFixed(1));
            setAccuracy(calculatedAccuracy);

            const logExercise = async () => {
                try {
                    await fetch("http://192.168.1.101:5001/log_exercise", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            date: new Date().toISOString(),
                            move: movement,
                            correct: correctCount,
                            incorrect: incorrectCount,
                            accuracy: calculatedAccuracy,
                        }),
                    });
                } catch (err) {
                    console.error("Egzersiz kaydı gönderilemedi:", err);
                }
            };

            logExercise();
        }

        if (wrong_angles && typeof wrong_angles === 'string' && wrong_angles !== "[]") {
            try {
                const angles = JSON.parse(wrong_angles) as number[];
                if (!Array.isArray(angles) || angles.length === 0) return;

                const newFeedback: string[] = [];
                let lowCount = 0;
                let deepCount = 0;

                angles.forEach((angle, index) => {
                    if (movement === 'squat') {
                        if (angle < 60) {
                            newFeedback.push(`#${index + 1} tekrar: Daha fazla çömelmelisiniz (açı: ${angle.toFixed(1)}°).`);
                            lowCount++;
                        } else if (angle > 120) {
                            newFeedback.push(`#${index + 1} tekrar: Fazla çömeldiniz (açı: ${angle.toFixed(1)}°).`);
                            deepCount++;
                        } else {
                            newFeedback.push(`#${index + 1} tekrar: Hedef açı aralığında değil (açı: ${angle.toFixed(1)}°).`);
                        }
                    } else if (movement === 'bridge') {
                        if (angle < 20) {
                            newFeedback.push(`#${index + 1} tekrar: Kalçanızı yeterince kaldırmadınız (açı: ${angle.toFixed(1)}°).`);
                        } else if (angle > 60) {
                            newFeedback.push(`#${index + 1} tekrar: Fazla zorladınız (açı: ${angle.toFixed(1)}°).`);
                        } else {
                            newFeedback.push(`#${index + 1} tekrar: Hedef açı aralığında değil (açı: ${angle.toFixed(1)}°).`);
                        }
                    }
                });

                if (movement === 'squat') {
                    if (lowCount > deepCount) {
                        setAdvice("Genellikle yeterince çömelmemişsiniz. Dizlerinizi biraz daha bükmeye ve kalçanızı daha fazla aşağıya indirmeye çalışın.");
                    } else if (deepCount > lowCount) {
                        setAdvice("Çok fazla çömelmişsiniz. Dengenizi ve diz sağlığınızı korumak için biraz daha kontrollü alçalmaya dikkat edin.");
                    } else {
                        setAdvice("Squat formunuzda dengesizlikler var. Ayna karşısında çalışarak formunuzu gözlemlemeyi deneyin.");
                    }
                }

                setFeedback(newFeedback);
            } catch (error) {
                console.warn("wrong_angles değeri çözümlenemedi:", error);
            }
        }

    }, [move, correct, incorrect, wrong_angles]);

    return (
        <>
            <Stack.Screen
                options={{
                    title: "Egzersiz Sonucu",
                    headerStyle: { backgroundColor: "#000" },
                    headerTintColor: "#fff",
                    contentStyle: { backgroundColor: "#000" },
                }}
            />
            <View style={styles.container}>
                <Text style={styles.title}>Egzersiz Tamamlandı 🎉</Text>
                <Text style={styles.resultText}>🏋️ Hareket: {move}</Text>
                <Text style={styles.resultText}>✅ Doğru Tekrar: {correct}</Text>
                <Text style={styles.resultText}>❌ Hatalı Tekrar: {incorrect}</Text>
                {accuracy !== null && (
                    <Text style={styles.resultText}>🎯 Doğruluk Oranı: {accuracy}%</Text>
                )}

                <Text style={styles.sectionTitle}>📝 Geri Bildirim:</Text>
                {feedback.length > 0 ? (
                    <ScrollView style={styles.feedbackContainer}>
                        {feedback.map((item, idx) => (
                            <Text key={idx} style={styles.feedbackItem}>• {item}</Text>
                        ))}
                    </ScrollView>
                ) : (
                    <Text style={styles.feedbackItem}>Tebrikler! Tüm hareketler doğru görünüyor. 🎯</Text>
                )}

                {advice && (
                    <View style={styles.adviceBox}>
                        <Text style={styles.adviceTitle}>Genel Öneri 💡</Text>
                        <Text style={styles.adviceText}>{advice}</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.button} onPress={() => router.replace("/")}>
                    <Text style={styles.buttonText}>Ana Sayfaya Dön</Text>
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#000',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: 'white',
    },
    resultText: {
        fontSize: 18,
        marginVertical: 4,
        color: 'white',
    },
    sectionTitle: {
        fontSize: 20,
        marginTop: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    feedbackContainer: {
        maxHeight: 200,
        marginVertical: 10,
    },
    feedbackItem: {
        fontSize: 16,
        marginBottom: 6,
        color: 'white',
    },
    adviceBox: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f0f8ff',
        borderRadius: 8,
    },
    adviceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 6,
        color: 'black',
    },
    adviceText: {
        fontSize: 16,
        color: 'black',
    },
    button: {
        marginTop: 30,
        backgroundColor: '#B0FF35',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
