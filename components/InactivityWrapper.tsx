import React, { useEffect, useRef, ReactNode } from 'react';
import { View, PanResponder, AppState, AppStateStatus, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { AlertDialog } from './ui';
import { useState } from 'react';

const INACTIVITY_MINUTES = 15;
const INACTIVITY_TIMEOUT = INACTIVITY_MINUTES * 60 * 1000; // ms

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

  // En WEB el PanResponder no capta el mouse/teclado/scroll, así que la app se
  // cerraba por "inactividad" aunque la estuvieras usando. Escuchamos actividad
  // real del DOM (con throttle de 10s para no reiniciar el timer en cada pixel).
  useEffect(() => {
    if (Platform.OS !== 'web' || !isAuthenticated || typeof window === 'undefined') return;
    const onActivity = () => {
      if (Date.now() - lastActiveTimestamp.current > 10000) startTimer();
    };
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel'];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true } as any));
    return () => events.forEach((e) => window.removeEventListener(e, onActivity));
  }, [isAuthenticated]);

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

  // En WEB los handlers del PanResponder (onStartShouldSetResponder, etc.) se
  // filtran al DOM y ensucian la consola con "Unknown event handler property";
  // además en web usamos listeners del DOM (arriba), así que acá NO se aplican.
  const panHandlers = Platform.OS === 'web' ? {} : panResponder.panHandlers;

  return (
    <View style={{ flex: 1 }} {...panHandlers}>
      {children}
      
      <AlertDialog
        visible={showTimeoutAlert}
        title="Sesión expirada"
        description={`Por tu seguridad, cerramos tu sesión por inactividad (${INACTIVITY_MINUTES} minutos).`}
        confirmLabel="Entendido"
        icon="time-outline"
        onConfirm={() => setShowTimeoutAlert(false)}
        onClose={() => setShowTimeoutAlert(false)}
      />
    </View>
  );
}
