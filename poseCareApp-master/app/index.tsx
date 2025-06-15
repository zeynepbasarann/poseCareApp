import { Stack } from 'expo-router';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: "Ana Sayfa",
                    headerStyle: { backgroundColor: "#000" },
                    headerTintColor: "#fff",
                    contentStyle: { backgroundColor: "#000" },
                }}
            />
            <View style={styles.container}>
                <Image
                    source={require("../assets/images/4882107.jpg")}
                    style={styles.image}
                />
                <Text style={styles.title}>Hoş geldin</Text>

                <Link href="/selectMove" asChild>
                    <Pressable style={styles.button}>
                        <Text style={styles.buttonText}>Başla</Text>
                    </Pressable>
                </Link>

                {/* Yeni butonlar */}
                <View style={styles.iconRow}>
                    <Link href={"/calendar" as any} asChild>
                        <Pressable style={styles.iconButton}>
                            <Ionicons name="calendar-outline" size={24} color="#000" />
                        </Pressable>
                    </Link>
                    <Link href="/report" asChild>
                        <Pressable style={styles.iconButton}>
                            <Ionicons name="stats-chart-outline" size={24} color="#000" />
                        </Pressable>
                    </Link>
                </View>

            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    image: {
        width: 300,
        height: 400,
        borderRadius: 20,
    },
    title: {
        fontSize: 42,
        fontWeight: "bold",
        marginVertical: 20,
        color: "#fff",
    },
    button: {
        backgroundColor: "#B0FF35",
        padding: 12,
        borderRadius: 10,
        width: 200,
        marginBottom: 16,
    },
    buttonText: {
        fontWeight: "bold",
        fontSize: 24,
        textAlign: "center",
        color: "black",
    },
    iconRow: {
        flexDirection: "row",
    },
    iconButton: {
        backgroundColor: "#B0FF35",
        padding: 10,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 10,
    },
});
