import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, borderRadius } from '../../theme';
import { getInitials } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

interface ProfileHeroProps {
    name: string;
    subtitle?: string;
    isVerified?: boolean;
    avatarUrl?: string | null;
    onCameraPress?: () => void;
    isUploading?: boolean;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({
    name,
    subtitle = "Emprendedor Verificado",
    isVerified = false,
    avatarUrl,
    onCameraPress,
    isUploading = false
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.container}>
            {/* Avatar + Camera Button */}
            <View style={styles.avatarWrapper}>
                <View style={styles.avatarContainer}>
                    {avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                    ) : (
                        <Text style={styles.initials}>{getInitials(name)}</Text>
                    )}
                    {isUploading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="small" color={colors.accentForeground} />
                        </View>
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.cameraButton, isUploading && styles.cameraButtonDisabled]}
                    onPress={onCameraPress}
                    disabled={isUploading}
                >
                    <Ionicons name="camera" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Name + Verified Badge */}
            <View style={styles.info}>
                <View style={styles.nameRow}>
                    <Text style={styles.name}>{name}</Text>
                    {isVerified && (
                        <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                    )}
                </View>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: spacing.lg,
    },
    avatarContainer: {
        width: 128,
        height: 128,
        borderRadius: borderRadius.full,
        backgroundColor: colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: colors.card,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
        overflow: "hidden"
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        fontSize: 48,
        fontWeight: '700',
        color: colors.accentForeground,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.accent,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: colors.card,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cameraButtonDisabled: {
        opacity: 0.7,
    },
    info: {
        alignItems: 'center',
        gap: 4,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    name: {
        fontSize: typography.sizes['2xl'],
        fontWeight: '700',
        color: colors.foreground,
    },
    subtitle: {
        fontSize: typography.sizes.sm,
        color: colors.mutedForeground,
        fontWeight: '500',
    },
});
