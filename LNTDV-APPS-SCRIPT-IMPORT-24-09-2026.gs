/**
 * LNTDV — IMPORT COMPATIBILE 24/09/2026
 *
 * La gestione pagamento/token è centralizzata nel deploy canonico.
 * Questo file mantiene i vecchi nomi di installazione come semplici wrapper.
 */
function lntdv24Install() {
  if (typeof lntdvInstallFinal24092026 !== 'function') throw new Error('Manca LNTDV-DEPLOY-24-09-2026.gs.');
  return lntdvInstallFinal24092026();
}

function lntdv24HealthCheck() {
  if (typeof lntdvHealthFinal24092026 !== 'function') throw new Error('Manca LNTDV-DEPLOY-24-09-2026.gs.');
  return lntdvHealthFinal24092026();
}

function lntdv24SendTestEmail() {
  if (typeof lntdvSendTestEmailFinal24092026 !== 'function') throw new Error('Manca LNTDV-DEPLOY-24-09-2026.gs.');
  return lntdvSendTestEmailFinal24092026();
}
