/**
 * LNTDV — CONFIGURAZIONE EMAIL APPS SCRIPT
 * Account/progetto Google previsto:
 * info.lanostraterradavicino@gmail.com
 *
 * Questo file NON sostituisce Code.gs.
 * Serve per verificare che il progetto Apps Script utilizzi gli indirizzi corretti
 * e che il trigger definitivo per il pagamento sia installato.
 */

const LNTDV_OWNER_EMAIL = 'info.lanostraterradavicino@gmail.com';
const LNTDV_COPYSHOP_EMAIL = 'tps.samuele@gmail.com';
const LNTDV_PAYMENT_COLUMN = 20;
const LNTDV_TOKEN_COLUMN = 16;
const LNTDV_TOKEN_SHARED_AT_COLUMN = 25;
const LNTDV_TOKEN_STATUS_COLUMN = 26;

function lntdvVerifyEmailConfiguration() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Ordini');
  if (!sheet) throw new Error('Foglio Ordini non trovato.');

  const triggers = ScriptApp.getProjectTriggers().map(function(t) {
    return t.getHandlerFunction();
  });

  const result = {
    ok: true,
    ownerEmail: LNTDV_OWNER_EMAIL,
    copyshopEmail: LNTDV_COPYSHOP_EMAIL,
    paymentColumn: LNTDV_PAYMENT_COLUMN,
    tokenColumn: LNTDV_TOKEN_COLUMN,
    tokenSharedAtColumn: LNTDV_TOKEN_SHARED_AT_COLUMN,
    tokenStatusColumn: LNTDV_TOKEN_STATUS_COLUMN,
    paymentTriggerInstalled: triggers.indexOf('lntdvPaymentConfirmationOnEdit_') !== -1,
    legacyPaymentTriggerInstalled: triggers.indexOf('onOrderCheckboxEdit_') !== -1
  };

  result.ok = result.paymentTriggerInstalled && !result.legacyPaymentTriggerInstalled;
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function lntdvSendTestEmailToOwner() {
  MailApp.sendEmail({
    to: LNTDV_OWNER_EMAIL,
    subject: 'LNTDV — test configurazione email',
    body: 'Test configurazione Apps Script LNTDV riuscito.\n\nDestinatario amministrativo: ' + LNTDV_OWNER_EMAIL + '\nCopisteria: ' + LNTDV_COPYSHOP_EMAIL
  });
}
