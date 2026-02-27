import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../context/ThemeContext';
import { getInitials } from '../../utils/formatters';

interface AvatarProps {
    name?: string;
    image?: string;
    size?: number;
    style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
    name = "User",
    image,
    size = 40,
    style
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const initials = getInitials(name);

    return (
        <View
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2
                },
                style
            ]}
        >
            {image ? (
                <Image
                    source={{ uri: image }}
                    style={{ width: size, height: size, borderRadius: size / 2 }}
                    contentFit="cover"
                    transition={200}
                />
            ) : (
                <Text style={[styles.text, { fontSize: size * 0.4 }]}>
                    {initials}
                </Text>
            )}
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        backgroundColor: colors.muted,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border, // Using theme border color instead of hardcoded blue
        overflow: 'hidden',
    },
    text: {
        color: colors.foreground,
        fontWeight: '600',
    },
});

