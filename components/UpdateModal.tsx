import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Linking, TouchableOpacity, Platform } from 'react-native';
import { useAppUpdate } from '../hooks/useAppUpdate';
import { colors } from '../theme';
import { Button } from './ui/Button';
import { LogoIcon } from './LogoIcon';

export const UpdateModal = () => {
  const { isUpdateAvailable, isMandatory, storeUrl, loading } = useAppUpdate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!loading && isUpdateAvailable) {
      setVisible(true);
    }
  }, [loading, isUpdateAvailable]);

  if (!visible) return null;

  const handleUpdate = () => {
    if (storeUrl) {
      Linking.openURL(storeUrl);
    } else {
        const defaultUrl = Platform.OS === 'ios' 
            ? 'https://apps.apple.com' 
            : 'https://play.google.com/store/apps';
        Linking.openURL(defaultUrl);
    }
  };

  const handleClose = () => {
    if (!isMandatory) {
      setVisible(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <LogoIcon size={60} />
          </View>
          
          <Text style={styles.title}>Nueva actualización disponible</Text>
          
          <Text style={styles.message}>
            {isMandatory 
              ? 'Existe una nueva versión obligatoria. Debes actualizar para continuar usando la aplicación.'
              : 'Hay una nueva versión disponible con mejoras y correcciones. ¿Deseas actualizar ahora?'}
          </Text>
          
          <View style={styles.buttonContainer}>
            <Button onPress={handleUpdate} style={{ width: '100%' }}>
               Actualizar ahora
            </Button>
          </View>
          
          {!isMandatory && (
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Quizás más tarde</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 12,
  },
  closeButton: {
    padding: 12,
  },
  closeText: {
    color: colors.mutedForeground,
    fontSize: 14,
    fontWeight: '600',
  },
});
