// Stub web de OneSignal.
//
// `react-native-onesignal` es un módulo nativo sin implementación web, y su
// import al tope rompe el bundle del navegador. Metro resuelve este archivo
// `.web.ts` automáticamente en web y el `.ts` original en iOS/Android, así que
// el build nativo no se toca. En web las notificaciones push simplemente no
// existen; la app corre igual.

class OneSignalServiceWeb {
  initialize() {
    // No-op en web.
  }

  async loginUser(_userId: string) {
    // No-op en web.
  }

  async logoutUser() {
    // No-op en web.
  }

  async getPushSubscriptionState() {
    return { optedIn: false, id: null, token: null };
  }
}

export const oneSignalService = new OneSignalServiceWeb();
