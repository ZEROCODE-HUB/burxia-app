import React from 'react';
import {
    Modal as RNModal,
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    Animated,
    Dimensions,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius } from '../../theme';

interface ModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    anchor?: 'bottom' | 'center';
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const Modal: React.FC<ModalProps> = ({
    visible,
    onClose,
    children,
    anchor = 'center',
}) => {
    const { colors } = useTheme();
    const [fadeAnim] = React.useState(new Animated.Value(0));
    const [isActuallyVisible, setIsActuallyVisible] = React.useState(visible);

    React.useEffect(() => {
        if (visible) {
            setIsActuallyVisible(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setIsActuallyVisible(false);
            });
        }
    }, [visible]);

    return (
        <RNModal
            visible={isActuallyVisible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <Animated.View
                        style={[
                            styles.backdrop,
                            {
                                opacity: fadeAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 0.5],
                                }),
                                backgroundColor: colors.background,
                            },
                        ]}
                    />
                </TouchableWithoutFeedback>

                <View
                    style={[
                        styles.contentContainer,
                        anchor === 'bottom' ? styles.anchorBottom : styles.anchorCenter,
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.card,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                                transform: [
                                    {
                                        translateY: fadeAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [anchor === 'bottom' ? 100 : 20, 0],
                                        }),
                                    },
                                    {
                                        scale: fadeAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [anchor === 'bottom' ? 1 : 0.95, 1],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        {children}
                    </Animated.View>
                </View>
            </View>
        </RNModal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    contentContainer: {
        width: '100%',
        padding: spacing.lg,
        alignItems: 'center',
    },
    anchorCenter: {
        justifyContent: 'center',
    },
    anchorBottom: {
        justifyContent: 'flex-end',
        marginTop: 'auto',
    },
    card: {
        width: '100%',
        // El Modal nativo ocupa toda la ventana; en web (y tablets) el card
        // se acota para no estirarse y quedar centrado, del ancho del marco.
        maxWidth: 440,
        alignSelf: 'center',
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        padding: spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
});
