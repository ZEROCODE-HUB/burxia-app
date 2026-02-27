import React from 'react';
import { View, StyleSheet } from 'react-native';
import { QuickActionButton } from './QuickActionButton';
import { router } from 'expo-router';
import { spacing } from '../../theme';

const actions = [
    { icon: 'paper-plane-outline', label: 'Transferir', path: '/(tabs)/transfer', isPrimary: false },
    { icon: 'bar-chart-outline', label: 'Estadísticas', path: '/(tabs)/statistics', isPrimary: false },
    { icon: 'share-social-outline', label: 'Compartir CVU', path: '/(tabs)/share-cvu', isPrimary: false },
] as const;

export const QuickActions = () => {
    return (
        <View style={styles.container}>
            {actions.map((action, index) => (
                <QuickActionButton
                    key={index}
                    icon={action.icon as any}
                    label={action.label}
                    onPress={() => action.path ? router.push(action.path) : null}
                    isPrimary={action.isPrimary}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Distribute evenly
        paddingHorizontal: spacing.lg,
        marginTop: spacing.md,
    },
});
