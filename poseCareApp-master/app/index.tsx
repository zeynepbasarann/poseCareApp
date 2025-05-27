import { Link, Stack } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";



export default function Index() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Ana Sayfa",
          contentStyle: { backgroundColor: "#000" },
        }}
      />
      <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Image
          source={require("../assets/images/4882107.jpg")}
          style={{ width: 300, height: 400, borderRadius: 20 }}
        />
        <Text style={{ fontSize: 42, fontWeight: "bold", marginVertical: 20, color: "#fff" }}>
          Hoş geldin
        </Text>
        <Link href="/selectMove" asChild>
                  <Pressable style={{ backgroundColor: "#B0FF35", padding: 12, borderRadius: 10, width: 200 }}>
            <Text style={{ fontWeight: "bold", fontSize: 24, textAlign: "center", color: 'black' }}>Başla</Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}
