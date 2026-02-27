import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const SCAN_SIZE = 240;

export const QRScannerOverlay = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.overlay}>
            <View style={styles.overlayTop} />
            <View style={styles.overlayCenterRow}>
                <View style={styles.overlaySide} />
                <View style={styles.scanFrame}>
                    <View style={[styles.corner, styles.tl]} />
                    <View style={[styles.corner, styles.tr]} />
                    <View style={[styles.corner, styles.bl]} />
                    <View style={[styles.corner, styles.br]} />
                    <View style={styles.laserLine} />
                </View>
                <View style={styles.overlaySide} />
            </View>
            <View style={styles.overlayBottom} />
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    overlayTop: {
        flex: 1,
        backgroundColor: colors.background + '99',
    },
    overlayCenterRow: {
        flexDirection: 'row',
        height: SCAN_SIZE,
    },
    overlaySide: {
        flex: 1,
        backgroundColor: colors.background + '99',
    },
    scanFrame: {
        width: SCAN_SIZE,
        height: SCAN_SIZE,
        backgroundColor: 'transparent',
        position: 'relative',
    },
    overlayBottom: {
        flex: 1,
        backgroundColor: colors.background + '99',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: colors.primary,
        borderWidth: 3,
    },
    tl: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 16 },
    tr: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 16 },
    bl: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 16 },
    br: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 16 },
    laserLine: {
        position: 'absolute',
        left: 20,
        right: 20,
        top: '50%',
        height: 2,
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
});
