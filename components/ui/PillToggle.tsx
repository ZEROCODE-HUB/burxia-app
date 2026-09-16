import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

/**
 * Interruptor tipo "pill" con la marca (violeta). Reemplaza al `Switch` nativo,
 * que en web/iOS pinta el estado activo de verde y no respeta bien el color.
 */
export function PillToggle({
    value,
    onValueChange,
    disabled,
}: {
    value: boolean;
    onValueChange: (v: boolean) => void;
    disabled?: boolean;
}) {
    const { colors } = useTheme();
    return (
        <TouchableOpacity
            accessibilityRole="switch"
            accessibilityState={{ checked: value, disabled }}
            activeOpacity={0.8}
            disabled={disabled}
            onPress={() => onValueChange(!value)}
            style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                padding: 3,
                justifyContent: 'center',
                opacity: disabled ? 0.5 : 1,
                backgroundColor: value ? colors.accent : colors.border,
            }}
        >
            <View
                style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: '#FFFFFF',
                    transform: [{ translateX: value ? 20 : 0 }],
                }}
            />
        </TouchableOpacity>
    );
}
