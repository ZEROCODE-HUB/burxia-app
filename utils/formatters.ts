/**
 * Formatea un número como moneda argentina
 * @param value - Valor numérico a formatear
 * @param options - Opciones de formateo
 */
export const formatCurrency = (
    value: number,
    options: { compact?: boolean; showSign?: boolean; decimals?: boolean } = {}
): string => {
    const { compact = false, showSign = false, decimals = true } = options;

    const sign = showSign && value > 0 ? "+" : "";

    if (compact) {
        if (Math.abs(value) >= 1000000) {
            return `${sign}$ ${(value / 1000000).toFixed(2).replace(".", ",")}M`;
        }
        if (Math.abs(value) >= 1000) {
            return `${sign}$ ${(value / 1000).toFixed(1).replace(".", ",")}K`;
        }
    }

    const formatted = new Intl.NumberFormat("es-AR", {
        minimumFractionDigits: decimals ? 2 : 0,
        maximumFractionDigits: decimals ? 2 : 0,
    }).format(value);

    return `${sign}$ ${formatted}`;
};

/**
 * Formatea un saldo con 2 decimales siempre (estándar es-AR)
 */
export const formatBalance = (value: number): string => {
    return `$ ${new Intl.NumberFormat("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)}`;
};

/**
 * Oculta un valor sensible reemplazándolo con bullets
 */
export const maskValue = (value: string, visibleChars: number = 0): string => {
    if (visibleChars === 0) {
        return "••••••";
    }
    const visible = value.slice(-visibleChars);
    const masked = "•".repeat(Math.max(0, value.length - visibleChars));
    return masked + visible;
};

/**
 * Obtiene las iniciales de un nombre
 */
export const getInitials = (name: string): string => {
    const parts = name.split(/[\s.-]+/).filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

/**
 * Parsea un string de moneda formato AR ("1.234,56") a number
 */
export const parseAmount = (amountStr: string): number => {
    if (!amountStr) return 0;
    // Remover puntos de miles y reemplazar coma por punto decimal
    const clean = amountStr.replace(/\./g, "").replace(",", ".");
    return parseFloat(clean) || 0;
};
