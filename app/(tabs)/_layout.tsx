import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { shadows } from "../../theme";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OtcTabBarButton } from "../../components/layout/TabBarButtons";
import { useTheme } from "../../context/ThemeContext";
import { useIsDesktop } from "../../hooks/useIsDesktop";

export default function TabsLayout() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets(); // Obtener insets seguros
  // En escritorio (Nivel B) la navegación la maneja el DesktopSidebar del
  // WebFrame, así que ocultamos la tab-bar inferior.
  const isDesktop = useIsDesktop();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: isDesktop ? { display: "none" } : {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: (Platform.OS === "ios" ? 60 : 60) + insets.bottom, // Altura base + inset
          paddingBottom: insets.bottom || 8, // Padding inferior dinámico
          paddingTop: 8,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          shadowColor: isDark ? "#000" : colors.primary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
          marginTop: 2,
        },
      }}
      backBehavior="history"
    >
      {/* 1. Inicio */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 2. Transferir */}
      <Tabs.Screen
        name="transfer"
        options={{
          title: "Transferir",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "swap-horizontal" : "swap-horizontal-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 3. OTC — Comprar/Vender USDT (Botón Central) */}
      <Tabs.Screen
        name="otc"
        options={{
          title: "",
          tabBarButton: (props) => (
            <OtcTabBarButton
              {...props}
              onPress={() => props.onPress?.(undefined as any)}
            />
          ),
        }}
      />

      {/* 4. Movimientos */}
      <Tabs.Screen
        name="movements"
        options={{
          title: "Movimientos",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "receipt" : "receipt-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 5. Estadísticas */}
      <Tabs.Screen
        name="statistics"
        options={{
          href: null,
        }}
      />

      {/* 6. Perfil */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Ocultamos las rutas que no queremos en el TabBar */}
      <Tabs.Screen
        name="menu"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="api-config"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="share-cvu"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="settings"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="change-pin"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="deposit"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="withdraw"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="requests"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="qr"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
    </Tabs>
  );
}

