import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme';

interface PinIndicatorProps {
    filled: boolean;
}

export const PinIndicator: React.FC<PinIndicatorProps> = ({ filled }) => {
    const scaleValue = React.useRef(new Animated.Value(filled ? 1 : 0.6)).current;

    React.useEffect(() => {
        Animated.spring(scaleValue, {
            toValue: filled ? 1 : 0.6,
            useNativeDriver: true,
            friction: 5,
        }).start();
    }, [filled]);

    return (
        <View style={styles.indicatorContainer}>
            <Animated.View
                style={[
                    styles.indicator,
                    filled ? styles.indicatorFilled : undefined,
                    {
                        transform: [{ scale: scaleValue }],
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    indicatorContainer: {
        height: 16,
        width: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    indicator: {
        height: 16,
        width: 16,
        borderRadius: 8,
        backgroundColor: colors.muted,
    },
    indicatorFilled: {
        backgroundColor: colors.accent,
    },
});
