/** LNTDV — EMAIL CHECK COMPATIBILE 24/09/2026
 * La gestione pagamento/token è centralizzata nel deploy canonico.
 */
const LNTDV_OWNER_EMAIL = 'info.lanostraterradavicino@gmail.com';
const LNTDV_COPYSHOP_EMAIL = 'tps.samuele@gmail.com';
const LNTDV_PAYMENT_COLUMN = 20;
const LNTDV_TOKEN_COLUMN = 16;
const LNTDV_TOKEN_SHARED_AT_COLUMN = 25;
const LNTDV_TOKEN_STATUS_COLUMN = 26;

function lntdvInstallAll() {
  if (typeof lntdvInstallFinal24092026 !== 'function') throw new Error('Manca LNTDV-DEPLOY-24-09-2026.gs.');
  return lntdvInstallFinal24092026();
}

function lntdvFinalConfigurationCheck() {
  if (typeof lntdvHealthFinal24092026 !== 'function') throw new Error('Manca LNTDV-DEPLOY-24-09-2026.gs.');
  return lntdvHealthFinal24092026();
}

function lntdvVerifyEmailConfiguration() {
  return lntdvFinalConfigurationCheck();
}

function lntdvSendTestEmailToOwner() {
  if (typeof lntdvSendTestEmailFinal24092026 !== 'function') throw new Error('Manca LNTDV-DEPLOY-24-09-2026.gs.');
  return lntdvSendTestEmailFinal24092026();
}
