import React, { useEffect, useRef, ReactNode } from 'react';
import { View, PanResponder, AppState, AppStateStatus } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { AlertDialog } from './ui';
import { useState } from 'react';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos en milisegundos

interface InactivityWrapperProps {
  children: ReactNode;
}

export function InactivityWrapper({ children }: InactivityWrapperProps) {
  const { isAuthenticated, logout } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const lastActiveTimestamp = useRef<number>(Date.now());
  const [showTimeoutAlert, setShowTimeoutAlert] = useState(false);

  const startTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    lastActiveTimestamp.current = Date.now();
    timerRef.current = setTimeout(handleInactivity, INACTIVITY_TIMEOUT);
  };

  const handleInactivity = () => {
    if (isAuthenticated) {
      console.log('Cerrando sesión por inactividad');
      logout();
      setShowTimeoutAlert(true);
    }
  };

  const recordInteraction = () => {
    if (isAuthenticated) {
      startTimer();
    }
  };

  // Observador del estado de la app (segundo plano / primer plano)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App está retornando al primer plano
        const timeElapsed = Date.now() - lastActiveTimestamp.current;
        if (timeElapsed >= INACTIVITY_TIMEOUT && isAuthenticated) {
          handleInactivity();
        } else {
          startTimer();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App se va a segundo plano
        if (timerRef.current) clearTimeout(timerRef.current);
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, logout]);

  // Manejo del ciclo de vida del temporizador cuando cambia isAuthenticated
  useEffect(() => {
    if (isAuthenticated) {
      startTimer();
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAuthenticated]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        recordInteraction();
        return false; // Permite que otros elementos interactúen
      },
      onMoveShouldSetPanResponderCapture: () => {
        recordInteraction();
        return false;
      },
      // También podríamos escuchar onPanResponderRelease si es necesario
    })
  ).current;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
      
      <AlertDialog
        visible={showTimeoutAlert}
        title="Sesión expirada"
        description="Por tu seguridad, hemos cerrado tu sesión debido a inactividad (5 minutos)."
        confirmLabel="Entendido"
        icon="time-outline"
        onConfirm={() => setShowTimeoutAlert(false)}
        onClose={() => setShowTimeoutAlert(false)}
      />
    </View>
  );
}
