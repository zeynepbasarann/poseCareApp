import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

let isCapturing = false;

export default function ExerciseCameraScreen() {
    const { exercise, target } = useLocalSearchParams(); // squat / bridge
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView | null>(null);
    const [facing, setFacing] = useState<CameraType>('front');
    const [status, setStatus] = useState<string | null>(null);
    const [angle, setAngle] = useState<number | null>(null);
    const [counts, setCounts] = useState({ correct: 0, incorrect: 0 });
    const targetCount = parseInt(target as string, 10) || 10;
    const router = useRouter();
    const toggleCamera = () => {
        setFacing(prev => (prev === 'front' ? 'back' : 'front'));
    };

    const captureAndSendFrame = async () => {
        if (!cameraRef.current || isCapturing) return;
        isCapturing = true;

        try {
            const photo = await cameraRef.current.takePictureAsync({
                base64: true,
                quality: 0.5,
            });

            if (!photo.base64) return;

            const res = await fetch('http://192.168.1.105:5001/pose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: photo.base64,
                    exercise: exercise || 'squat',
                }),
            });

            if (!res.ok) return;

            const data = await res.json() as {
                angle?: number;
                status?: string;
                correct: number;
                incorrect: number;
            };

            if (typeof data.angle === 'number') setAngle(data.angle);
            if (typeof data.status === 'string') setStatus(data.status);
            setCounts({ correct: data.correct, incorrect: data.incorrect });
        } catch (err) {
            console.error('Sunucu hatası:', err);
        } finally {
            isCapturing = false;
        }
    };
    useEffect(() => {
        fetch('http://192.168.1.105:5001/reset_session', {
            method: 'POST',
        })
            .then(() => {
                setCounts({ correct: 0, incorrect: 0 });
                setAngle(null);
                setStatus(null);
            })
            .catch(console.error);
    }, []);
    useEffect(() => {
        const interval = setInterval(() => {
            captureAndSendFrame();
        }, 700); // her 0,7 saniyede bir

        if (counts.correct >= targetCount) {
            router.replace({
                pathname: "/completed",
                params: {
                    correct: counts.correct.toString(),
                    incorrect: counts.incorrect.toString(),
                    move: exercise as string,
                },
            });
        }
    }, [counts.correct]);

    if (!permission?.granted) {
        return (
            <View style={styles.centered}>
                <Text style={{ color: "#fff" }}>Kamera izni gerekiyor</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.button}>
                    <Text style={styles.buttonText}>İzin Ver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: "Pose Care",
                    contentStyle: { backgroundColor: "#000" },
                }}
            />
            <View style={styles.container}>
                <CameraView
                    ref={cameraRef}
                    style={styles.cameraFrame}
                    facing={facing}
                />

                <View style={styles.overlayTop}>
                    <Text style={styles.statusText}>Egzersiz: {exercise}</Text>
                    <Text style={styles.statusText}> {status}</Text>
                    {typeof angle === 'number' && (
                        <Text style={styles.statusText}>Açı: {angle.toFixed(2)}°</Text>
                    )}
                    <Text style={styles.countText}>
                        ✅  Doğru: {counts.correct}   ❌ Yanlış: {counts.incorrect}
                    </Text>
                </View>


                <View style={styles.overlayBottom}>
                    <TouchableOpacity onPress={toggleCamera} style={styles.button}>
                        <Text style={styles.buttonText}>Kamerayı Çevir</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}

export const options = {
    title: "Egzersiz",
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    camera: { flex: 1 },
    overlayTop: {
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    overlayBottom: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#A8B545',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 10,
    },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    statusText: { fontSize: 16, fontWeight: '600', color: '#fff' },
    countText: { fontSize: 18, marginTop: 6, color: '#fff' },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraFrame: {
        ...StyleSheet.absoluteFillObject,

    }

});