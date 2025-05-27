import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';

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

        if (total > 0) {
            const acc = (correctCount / total) * 100;
            setAccuracy(Number(acc.toFixed(1)));
        }

        if (wrong_angles && typeof wrong_angles === 'string' && wrong_angles !== "[]") {
            try {
                const angles = JSON.parse(wrong_angles) as number[];
                if (!Array.isArray(angles) || angles.length === 0) return;

                const newFeedback: string[] = [];
                let lowCount = 0;
                let deepCount = 0;

                angles.forEach((angle, index) => {
                    if (move === 'squat') {
                        if (angle < 60) {
                            newFeedback.push(`#${index + 1} tekrar: Daha fazla çömelmelisiniz (açı: ${angle.toFixed(1)}°).`);
                            lowCount++;
                        } else if (angle > 120) {
                            newFeedback.push(`#${index + 1} tekrar: Fazla çömeldiniz (açı: ${angle.toFixed(1)}°).`);
                            deepCount++;
                        } else {
                            newFeedback.push(`#${index + 1} tekrar: Uygun aralık dışı (açı: ${angle.toFixed(1)}°).`);
                        }
                    } else if (move === 'bridge') {
                        if (angle < 20) {
                            newFeedback.push(`#${index + 1} tekrar: Kalçanızı yeterince kaldırmadınız (açı: ${angle.toFixed(1)}°).`);
                        } else if (angle > 60) {
                            newFeedback.push(`#${index + 1} tekrar: Fazla zorladınız (açı: ${angle.toFixed(1)}°).`);
                        } else {
                            newFeedback.push(`#${index + 1} tekrar: Aralık dışı pozisyon (açı: ${angle.toFixed(1)}°).`);
                        }
                    }
                });

                if (move === 'squat') {
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
    }, []);

    return (
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    resultText: {
        fontSize: 18,
        marginVertical: 4,
    },
    sectionTitle: {
        fontSize: 20,
        marginTop: 20,
        fontWeight: 'bold',
    },
    feedbackContainer: {
        maxHeight: 200,
        marginVertical: 10,
    },
    feedbackItem: {
        fontSize: 16,
        marginBottom: 6,
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
    },
    adviceText: {
        fontSize: 16,
    },
    button: {
        marginTop: 30,
        backgroundColor: '#007bff',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
