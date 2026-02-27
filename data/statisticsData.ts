
// Mock logic without external date libraries for reliability

const MS_PER_HOUR = 3600 * 1000;
const MS_PER_DAY = 24 * 3600 * 1000;

function formatHour(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:00`;
}

function formatDate(date: Date): string {
    const day = date.getDate();
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const month = months[date.getMonth()];
    return `${day} ${month}`;
}

export const generateChartData = (startDate: Date, endDate: Date) => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / MS_PER_DAY);

    let pointsCount = 0;
    let intervalMs = 0;
    let isHourly = false;

    if (diffDays <= 1) {
        pointsCount = 6; // Every 4 hours approx
        intervalMs = 4 * MS_PER_HOUR;
        isHourly = true;
    } else if (diffDays <= 14) {
        pointsCount = diffDays;
        intervalMs = MS_PER_DAY;
    } else {
        pointsCount = 6; // Weekly points aprox
        intervalMs = Math.floor(diffTime / 6);
    }

    const data = [];
    for (let i = 0; i <= pointsCount; i++) {
        const pointDate = new Date(startDate.getTime() + (i * intervalMs));
        if (pointDate > endDate && i > 0) break; // Don't overshoot too much

        const seed = pointDate.getTime();
        const baseValue = 150000 + (seed % 100000);
        // Simple variation
        const variation = Math.sin(i * 0.5) * 80000 + Math.cos(i * 0.3) * 50000;
        const value = Math.max(50000, baseValue + variation);

        data.push({
            label: isHourly ? formatHour(pointDate) : formatDate(pointDate),
            value: Math.round(value),
            fullDate: pointDate
        });
    }

    return data;
};

// Generate summary data based on range
export const generateSummaryData = (range: string) => {
    const multipliers: Record<string, number> = {
        "1d": 0.1,
        "7d": 0.5,
        "1m": 1,
    };

    const actualMult = multipliers[range] || 1;
    const baseIncome = 1250000 * actualMult;
    const baseExpenses = 840500 * actualMult;

    return {
        income: baseIncome,
        expenses: baseExpenses,
        balance: baseIncome - baseExpenses,
    };
};
