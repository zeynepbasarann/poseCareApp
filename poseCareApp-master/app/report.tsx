import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

type Log = {
    date: string;
    move: string;
    correct: number;
    incorrect: number;
    accuracy: number;
};

export default function ReportScreen() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [selectedMove, setSelectedMove] = useState<'squat' | 'bridge'>('squat');

    useEffect(() => {
        fetch("http://192.168.1.101:5001/get_logs")
            .then(res => res.json())
            .then(data => {
                console.log("Log data:", data);
                setLogs(data);
            })
            .catch(console.error);
    }, []);

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return isNaN(d.getTime()) ? "Geçersiz Tarih" : d.toLocaleDateString("tr-TR", {
            day: 'numeric', month: 'short'
        });
    };

    const filteredLogs = logs.filter(log => log.move === selectedMove);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>📊 Egzersiz Raporu</Text>

            {/* Butonlar */}
            <View style={styles.buttonGroup}>
                <TouchableOpacity
                    style={[styles.toggleButton, selectedMove === 'squat' && styles.activeButton]}
                    onPress={() => setSelectedMove('squat')}
                >
                    <Text style={styles.buttonText}>Squat</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, selectedMove === 'bridge' && styles.activeButton]}
                    onPress={() => setSelectedMove('bridge')}
                >
                    <Text style={styles.buttonText}>Bridge</Text>
                </TouchableOpacity>
            </View>

            {filteredLogs.length > 0 ? (
                <>
                    <LineChart
                        data={{
                            labels: filteredLogs.map(log => formatDate(log.date)),
                            datasets: [{ data: filteredLogs.map(log => log.accuracy) }],
                        }}
                        width={Dimensions.get("window").width - 40}
                        height={220}
                        yAxisSuffix="%"
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                    />

                    {/* İlgili logları listele */}
                    {filteredLogs.map((log, i) => (
                        <View key={i} style={styles.card}>
                            <Text style={styles.text}>📅 {formatDate(log.date)}</Text>
                            <Text style={styles.text}>✅ Doğru: {log.correct} | ❌ Yanlış: {log.incorrect}</Text>
                            <Text style={styles.text}>🎯 Doğruluk: {log.accuracy.toFixed(2)}%</Text>
                        </View>
                    ))}
                </>
            ) : (
                <Text style={styles.text}>Bu egzersiz için kayıt yok.</Text>
            )}
        </ScrollView>
    );
}

const chartConfig = {
    backgroundColor: "#1a1a1a",
    backgroundGradientFrom: "#1a1a1a",
    backgroundGradientTo: "#1a1a1a",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(176, 255, 53, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#B0FF35"
    },
    fromZero: true,
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#000" },
    title: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 20 },
    chart: { marginBottom: 20, borderRadius: 16 },
    card: {
        backgroundColor: "#1a1a1a",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
    },
    text: { color: "#fff", fontSize: 16 },
    buttonGroup: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 15,
    },
    toggleButton: {
        backgroundColor: "#333",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    activeButton: {
        backgroundColor: "#B0FF35",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});
