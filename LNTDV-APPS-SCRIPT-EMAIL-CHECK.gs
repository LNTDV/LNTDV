/**
 * LNTDV — CONFIGURAZIONE DEFINITIVA EMAIL + TOKEN
 *
 * Progetto Google Apps Script:
 * info.lanostraterradavicino@gmail.com
 *
 * Questo file va aggiunto al progetto Apps Script "LNTDV - Inoltro Ordini".
 * Non sostituisce Code.gs o PaymentTokenConfirmation.gs.
 *
 * AVVIO UNA SOLA VOLTA:
 * 1) eseguire lntdvInstallAll()
 * 2) concedere le autorizzazioni richieste da Google
 * 3) eseguire lntdvFinalConfigurationCheck()
 */

const LNTDV_OWNER_EMAIL = 'info.lanostraterradavicino@gmail.com';
const LNTDV_COPYSHOP_EMAIL = 'tps.samuele@gmail.com';
const LNTDV_PAYMENT_COLUMN = 20;
const LNTDV_TOKEN_COLUMN = 16;
const LNTDV_TOKEN_SHARED_AT_COLUMN = 25;
const LNTDV_TOKEN_STATUS_COLUMN = 26;

/**
 * Installazione unica del sistema definitivo.
 * Richiede che PaymentTokenConfirmation.gs sia presente nello stesso progetto.
 */
function lntdvInstallAll() {
  if (typeof installPaymentTokenConfirmation !== 'function') {
    throw new Error(
      'PaymentTokenConfirmation.gs non è presente nel progetto. ' +
      'Aggiungilo prima di eseguire lntdvInstallAll().'
    );
  }

  installPaymentTokenConfirmation();

  // Mantiene, se presenti, i trigger già previsti dal sistema copisteria.
  if (typeof ensureCopyshopReplyTrigger_ === 'function') {
    ensureCopyshopReplyTrigger_();
  }
  if (typeof ensureFinalCopyshopTrigger_ === 'function') {
    ensureFinalCopyshopTrigger_();
  }

  SpreadsheetApp.getActive().toast(
    'LNTDV: configurazione email + token completata.',
    'LNTDV',
    5
  );
}

/**
 * Controllo finale non invasivo.
 */
function lntdvFinalConfigurationCheck() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Ordini');
  if (!sheet) throw new Error('Foglio Ordini non trovato.');

  const handlers = ScriptApp.getProjectTriggers().map(function(t) {
    return t.getHandlerFunction();
  });

  const paymentTrigger = handlers.indexOf('lntdvPaymentConfirmationOnEdit_') !== -1;
  const legacyTrigger = handlers.indexOf('onOrderCheckboxEdit_') !== -1;

  const result = {
    ok: paymentTrigger && !legacyTrigger,
    ownerEmail: LNTDV_OWNER_EMAIL,
    copyshopEmail: LNTDV_COPYSHOP_EMAIL,
    sheet: sheet.getName(),
    paymentColumn: LNTDV_PAYMENT_COLUMN,
    tokenColumn: LNTDV_TOKEN_COLUMN,
    tokenSharedAtColumn: LNTDV_TOKEN_SHARED_AT_COLUMN,
    tokenStatusColumn: LNTDV_TOKEN_STATUS_COLUMN,
    paymentTriggerInstalled: paymentTrigger,
    legacyPaymentTriggerInstalled: legacyTrigger,
    tokenSystemPresent: typeof lntdvPaymentConfirmationOnEdit_ === 'function',
    installFunctionPresent: typeof installPaymentTokenConfirmation === 'function'
  };

  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * Verifica soltanto la configurazione email e trigger.
 */
function lntdvVerifyEmailConfiguration() {
  return lntdvFinalConfigurationCheck();
}

/**
 * Test email amministrativa.
 * Da eseguire solo se vuoi verificare MailApp: invia una vera email.
 */
function lntdvSendTestEmailToOwner() {
  MailApp.sendEmail({
    to: LNTDV_OWNER_EMAIL,
    subject: 'LNTDV — test configurazione email',
    body: [
      'Test configurazione Apps Script LNTDV riuscito.',
      '',
      'Destinatario amministrativo: ' + LNTDV_OWNER_EMAIL,
      'Copisteria: ' + LNTDV_COPYSHOP_EMAIL,
      'Sistema pagamento/token: colonna ' + LNTDV_PAYMENT_COLUMN,
      'Token: colonna ' + LNTDV_TOKEN_COLUMN
    ].join('\n'),
    name: 'La Nostra Terra da Vicino'
  });
}
