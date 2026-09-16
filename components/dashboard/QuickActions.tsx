import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { QuickActionButton } from './QuickActionButton';
import { router } from 'expo-router';
import { spacing } from '../../theme';

const actions = [
    { icon: 'arrow-down-outline', label: 'Depositar', path: '/(tabs)/deposit', isPrimary: true },
    { icon: 'arrow-up-outline', label: 'Retirar', path: '/(tabs)/withdraw', isPrimary: false },
    { icon: 'swap-vertical-outline', label: 'Comprar/Vender', path: '/(tabs)/otc', isPrimary: false },
    { icon: 'paper-plane-outline', label: 'Transferir', path: '/(tabs)/transfer', isPrimary: false },
    { icon: 'bar-chart-outline', label: 'Estadísticas', path: '/(tabs)/statistics', isPrimary: false },
] as const;

export const QuickActions = () => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.content}
            style={styles.container}
        >
            {actions.map((action, index) => (
                <QuickActionButton
                    key={index}
                    icon={action.icon as any}
                    label={action.label}
                    onPress={() => action.path ? router.push(action.path) : null}
                    isPrimary={action.isPrimary}
                />
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: spacing.md,
    },
    content: {
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
});
