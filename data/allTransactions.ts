import { DashboardTransaction } from './mockTransactions';

export interface Transaction extends DashboardTransaction {
    category: string;
    time: string;
    numericAmount: number;
    dateGroup: string;
}

// Transacciones completas para Movements
export const allTransactions: Transaction[] = [
    {
        id: 1,
        iconName: "arrow-down-outline",
        title: "María González",
        category: "Transferencia recibida",
        description: "Transferencia recibida • 14:30",
        time: "14:30",
        amount: "+ $ 25.000,00",
        numericAmount: 25000,
        type: "income",
        dateGroup: "Hoy, 24 Oct",
    },
    {
        id: 2,
        iconName: "arrow-up-outline",
        title: "Carlos Rodríguez",
        category: "Transferencia enviada",
        description: "Transferencia enviada • 11:15",
        time: "11:15",
        amount: "- $ 15.490,00",
        numericAmount: -15490,
        type: "expense",
        dateGroup: "Hoy, 24 Oct",
    },
    {
        id: 3,
        iconName: "business-outline",
        title: "Startup TechSolution",
        category: "Pago a negocio",
        description: "Pago a negocio • 09:45",
        time: "09:45",
        amount: "- $ 85.000,00",
        numericAmount: -85000,
        type: "expense",
        dateGroup: "Hoy, 24 Oct",
    },
    {
        id: 4,
        iconName: "arrow-down-outline",
        title: "Juan Pérez",
        category: "Transferencia recibida",
        description: "Transferencia recibida • 16:20",
        time: "16:20",
        amount: "+ $ 50.000,00",
        numericAmount: 50000,
        type: "income",
        dateGroup: "Ayer, 23 Oct",
    },
    {
        id: 5,
        iconName: "arrow-up-outline",
        title: "Ana Martínez",
        category: "Transferencia enviada",
        description: "Transferencia enviada • 10:00",
        time: "10:00",
        amount: "- $ 8.200,00",
        numericAmount: -8200,
        type: "expense",
        dateGroup: "Ayer, 23 Oct",
    },
    {
        id: 6,
        iconName: "arrow-down-outline",
        title: "Roberto Sánchez",
        category: "Transferencia recibida",
        description: "Transferencia recibida • 18:45",
        time: "18:45",
        amount: "+ $ 32.500,00",
        numericAmount: 32500,
        type: "income",
        dateGroup: "21 Oct",
    },
];

// Orden de fechas para agrupación
export const dateOrder = ["Hoy, 24 Oct", "Ayer, 23 Oct", "21 Oct"];
