import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    visible: boolean;
    message: string;
    type?: ToastType;
    onHide?: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
    visible,
    message,
    type = 'info',
    onHide,
    duration = 3000,
}) => {
    const insets = useSafeAreaInsets();
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    speed: 20,
                    bounciness: 5,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            const timer = setTimeout(() => {
                hide();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            hide();
        }
    }, [visible]);

    const hide = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (onHide && visible) {
                onHide();
            }
        });
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return colors.success;
            case 'error':
                return colors.destructive;
            case 'info':
            default:
                return colors.primary;
        }
    };

    const getIcon = (): keyof typeof Ionicons.glyphMap => {
        switch (type) {
            case 'success':
                return 'checkmark-circle';
            case 'error':
                return 'alert-circle';
            case 'info':
            default:
                return 'information-circle';
        }
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    top: insets.top + spacing.sm,
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <View style={[styles.content, { backgroundColor: getBackgroundColor() }]}>
                <Ionicons name={getIcon()} size={24} color="white" />
                <Text style={styles.message}>{message}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: spacing.lg,
        right: spacing.lg,
        zIndex: 9999,
        alignItems: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        gap: spacing.sm,
        width: '100%',
    },
    message: {
        color: 'white',
        fontSize: typography.sizes.sm,
        fontWeight: '600',
        flex: 1,
    },
});
