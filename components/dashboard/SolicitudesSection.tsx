import React, { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useFocusEffect, router } from "expo-router";

import { spacing, typography } from "../../theme";
import { useTheme } from "../../context/ThemeContext";
import { SolicitudRow } from "../funding/SolicitudRow";
import { getMySolicitudes, enCurso, SolicitudItem } from "../../services/solicitudes.service";

/**
 * Sección "Solicitudes" del inicio: muestra las solicitudes EN CURSO (pendientes
 * o rechazadas) de fondeo y OTC. Si no hay ninguna, no renderiza nada.
 */
export function SolicitudesSection() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [items, setItems] = useState<SolicitudItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getMySolicitudes()
        .then((all) => {
          // En curso, pero SIN las que ya son un movimiento (pendientes con
          // transacción, p.ej. un retiro con retención). Así no se duplican con
          // "Últimos Movimientos". Las rechazadas (reversed) sí se muestran.
          if (alive) setItems(enCurso(all).filter((s) => s.status === "rejected" || !s.transactionId));
        })
        .catch(() => {});
      return () => { alive = false; };
    }, [])
  );

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Solicitudes</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/movements")}>
          <Text style={styles.link}>Ver todas</Text>
        </TouchableOpacity>
      </View>
      <View style={{ gap: spacing.sm }}>
        {items.slice(0, 3).map((s) => (
          <SolicitudRow key={s.id} item={s} />
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
    title: { fontSize: typography.sizes.lg, fontWeight: "700", color: colors.foreground },
    link: { fontSize: typography.sizes.sm, fontWeight: "600", color: colors.accent },
  });
