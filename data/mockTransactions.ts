export interface DashboardTransaction {
    id: number;
    iconName: string; // Ionicons name
    title: string;
    description: string;
    amount: string;
    type: "income" | "expense";
}

export const dashboardTransactions: DashboardTransaction[] = [
    {
        id: 1,
        iconName: "arrow-down-outline",
        title: "María González",
        description: "Transferencia recibida • Hoy",
        amount: "+ $ 25.000,00",
        type: "income",
    },
    {
        id: 2,
        iconName: "arrow-up-outline",
        title: "Carlos Rodríguez",
        description: "Transferencia enviada • Hoy",
        amount: "- $ 15.490,00",
        type: "expense",
    },
    {
        id: 3,
        iconName: "arrow-down-outline",
        title: "Juan Pérez",
        description: "Transferencia recibida • Ayer",
        amount: "+ $ 50.000,00",
        type: "income",
    },
    {
        id: 4,
        iconName: "arrow-up-outline",
        title: "Ana Martínez",
        description: "Transferencia enviada • 20 Oct",
        amount: "- $ 8.200,00",
        type: "expense",
    },
];
