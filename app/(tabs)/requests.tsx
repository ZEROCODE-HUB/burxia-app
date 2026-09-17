import { Redirect } from "expo-router";

/**
 * "Mis solicitudes" se unificó dentro de Movimientos (feed único: movimientos +
 * solicitudes en curso). Esta ruta queda como redirect para no romper enlaces viejos.
 */
export default function RequestsRedirect() {
  return <Redirect href="/movements" />;
}
