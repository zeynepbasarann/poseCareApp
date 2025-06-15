import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    FlatList,
    Button,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EXERCISES = ["Squat", "Bridge"];

export default function CalendarScreen() {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [plans, setPlans] = useState<{ [date: string]: { name: string; reps: number; done: boolean }[] }>({});
    const [modalVisible, setModalVisible] = useState(false);
    const [chosenExercise, setChosenExercise] = useState(EXERCISES[0]);
    const [reps, setReps] = useState("");

    const STORAGE_KEY = "@exercise_plans";

    useEffect(() => {
        const loadPlans = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
                if (jsonValue != null) {
                    setPlans(JSON.parse(jsonValue));
                }
            } catch (e) {
                console.log("Veriler yüklenemedi:", e);
            }
        };
        loadPlans();
    }, []);

    useEffect(() => {
        const savePlans = async () => {
            try {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
            } catch (e) {
                console.log("Veriler kaydedilemedi:", e);
            }
        };
        savePlans();
    }, [plans]);

    const addExercise = () => {
        if (!selectedDate || !reps || isNaN(Number(reps)) || Number(reps) <= 0) {
            alert("Geçerli tekrar sayısı giriniz.");
            return;
        }

        const newEntry = { name: chosenExercise, reps: Number(reps), done: false };
        const updatedPlans = {
            ...plans,
            [selectedDate]: [...(plans[selectedDate] || []), newEntry],
        };

        setPlans(updatedPlans);
        setModalVisible(false);
        setReps("");
    };

    const toggleDone = (date: string, index: number) => {
        const updatedDay = [...(plans[date] || [])];
        updatedDay[index] = {
            ...updatedDay[index],
            done: !updatedDay[index].done,
        };

        const updated = {
            ...plans,
            [date]: updatedDay,
        };

        setPlans(updated);
    };


    const markedDates: { [date: string]: any } = {};
    Object.keys(plans).forEach((date) => {
        const doneAll = plans[date].every((e) => e.done);
        markedDates[date] = {
            selected: true,
            selectedColor: doneAll ? "green" : "red",
        };
    });

    return (
        <View style={styles.container}>
            <Calendar
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={{
                    ...markedDates,
                    ...(selectedDate
                        ? {
                            [selectedDate]: {
                                ...(markedDates[selectedDate] || {}),
                                selected: true,
                                selectedColor: "#00adf5",
                            },
                        }
                        : {}),
                }}
                theme={{
                    backgroundColor: "#000",
                    calendarBackground: "#000",
                    dayTextColor: "#fff",
                    monthTextColor: "#fff",
                    todayTextColor: "#B0FF35",
                    selectedDayTextColor: "#000",
                    arrowColor: "#B0FF35",
                    textDisabledColor: "#555",
                }}
            />

            {selectedDate && (
                <>
                    <Text style={styles.heading}>Planlanan Egzersizler ({selectedDate})</Text>
                    <FlatList
                        data={plans[selectedDate] || []}
                        keyExtractor={(item, index) => item.name + index}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                style={[styles.planItem, item.done ? styles.done : styles.notDone]}
                                onPress={() => toggleDone(selectedDate, index)}
                            >
                                <Text style={styles.exerciseText}>
                                    {item.name} - {item.reps} tekrar
                                </Text>
                                <Text>{item.done ? "✅ Yapıldı" : "❌ Yapılmadı"}</Text>
                            </TouchableOpacity>
                        )}
                    />
                    <Button title="Egzersiz Ekle" onPress={() => setModalVisible(true)} />
                </>
            )}

            <Modal visible={modalVisible} transparent animationType="slide">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.modal}>
                        <Text style={styles.modalTitle}>Yeni Egzersiz - {selectedDate}</Text>

                        <Text style={styles.label}>Egzersiz Seç:</Text>
                        {EXERCISES.map((ex) => (
                            <TouchableOpacity
                                key={ex}
                                style={[
                                    styles.exerciseOption,
                                    chosenExercise === ex && styles.selectedExercise,
                                ]}
                                onPress={() => setChosenExercise(ex)}
                            >
                                <Text>{ex}</Text>
                            </TouchableOpacity>
                        ))}

                        <Text style={styles.label}>Tekrar Sayısı:</Text>
                        <TextInput
                            keyboardType="numeric"
                            value={reps}
                            onChangeText={setReps}
                            style={styles.input}
                            placeholder="ör: 10"
                        />

                        <View style={styles.modalButtons}>
                            <Button title="İptal" color="red" onPress={() => setModalVisible(false)} />
                            <Button title="Ekle" onPress={addExercise} />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000", paddingTop: 40 },
    heading: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 10,
        textAlign: "center",
        color: "#fff",
    },
    planItem: {
        padding: 12,
        marginHorizontal: 20,
        marginVertical: 5,
        borderRadius: 10,
    },
    done: { backgroundColor: "#B0FF35" },
    notDone: { backgroundColor: "#FF6B6B" },
    exerciseText: { fontSize: 16, fontWeight: "bold" },
    modal: {
        flexGrow: 1,
        backgroundColor: "#000000dd",
        justifyContent: "center",
        padding: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#fff",
        textAlign: "center",
    },
    label: { color: "#fff", marginVertical: 5 },
    exerciseOption: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#eee",
        marginVertical: 5,
    },
    selectedExercise: {
        backgroundColor: "#B0FF35",
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 12, // yüksekliği artırdık
        marginTop: 5,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
});
