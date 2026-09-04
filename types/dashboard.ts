/**
 * Forma de una fila del listado del dashboard. Vivía en data/mockTransactions.ts
 * junto a datos de ejemplo; los datos se eliminaron (el dashboard usa datos
 * reales vía hooks) y el tipo quedó acá.
 */
export interface DashboardTransaction {
  id: number;
  iconName: string; // nombre del ícono de Ionicons
  title: string;
  description: string;
  amount: string;
  type: "income" | "expense";
}
