/**
 * LNTDV — IMPORT DEFINITIVO APPS SCRIPT — 24/09/2026
 *
 * Account/project target:
 * info.lanostraterradavicino@gmail.com
 *
 * Questo file è AUTOCONTENUTO per la parte pagamento/token/email.
 * Non sostituisce il Code.gs principale (doGet/doPost e copisteria).
 * Usa nomi univoci LNTDV24_ per evitare conflitti con versioni precedenti.
 *
 * AVVIO:
 * 1. aggiungere questo file al progetto "LNTDV - Inoltro Ordini"
 * 2. eseguire lntdv24Install()
 * 3. concedere le autorizzazioni Google
 * 4. eseguire lntdv24HealthCheck()
 */

const LNTDV24_OWNER_EMAIL = 'info.lanostraterradavicino@gmail.com';
const LNTDV24_COPYSHOP_EMAIL = 'tps.samuele@gmail.com';
const LNTDV24_SHEET = 'Ordini';
const LNTDV24_PAYMENT_COL = 20;
const LNTDV24_TOKEN_COL = 16;
const LNTDV24_STATUS_COL = 15;
const LNTDV24_SHARED_AT_COL = 25;
const LNTDV24_TOKEN_STATUS_COL = 26;
const LNTDV24_SITE = 'https://lntdv.it/';

function lntdv24Install() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(LNTDV24_SHEET) || ss.insertSheet(LNTDV24_SHEET);

  if (sheet.getMaxColumns() < LNTDV24_TOKEN_STATUS_COL) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), LNTDV24_TOKEN_STATUS_COL - sheet.getMaxColumns());
  }

  sheet.getRange(1, LNTDV24_PAYMENT_COL).setValue('Pagamento confermato');
  sheet.getRange(1, LNTDV24_SHARED_AT_COL).setValue('Token condiviso il');
  sheet.getRange(1, LNTDV24_TOKEN_STATUS_COL).setValue('Stato invio token');
  sheet.getRange(1, LNTDV24_SHARED_AT_COL, Math.max(sheet.getLastRow(), 1), 1)
    .setNumberFormat('dd/MM/yyyy HH:mm:ss');

  // Rimuove esclusivamente i trigger legacy della conferma pagamento.
  ScriptApp.getProjectTriggers().forEach(function(t) {
    const h = t.getHandlerFunction();
    if (h === 'onOrderCheckboxEdit_' || h === 'lntdvPaymentConfirmationOnEdit_' || h === 'lntdv24PaymentOnEdit_') {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('lntdv24PaymentOnEdit_')
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  SpreadsheetApp.getActive().toast(
    'LNTDV: installazione pagamento/token completata.',
    'LNTDV',
    5
  );
}

function lntdv24PaymentOnEdit_(e) {
  if (!e || !e.range) return;

  const range = e.range;
  const sheet = range.getSheet();
  if (sheet.getName() !== LNTDV24_SHEET) return;
  if (range.getRow() < 2 || range.getColumn() !== LNTDV24_PAYMENT_COL) return;
  if (range.getNumRows() !== 1 || range.getNumColumns() !== 1) return;

  const checked = e.value === 'TRUE' || range.getValue() === true;
  if (!checked) return;

  const rowNumber = range.getRow();
  const row = sheet.getRange(rowNumber, 1, 1, LNTDV24_TOKEN_STATUS_COL).getValues()[0];

  // Idempotenza: nessun secondo invio.
  if (row[LNTDV24_SHARED_AT_COL - 1]) return;

  const orderId = String(row[1] || '').trim();
  const customerName = String(row[2] || '').trim();
  const customerEmail = String(row[6] || '').trim();
  const token = String(row[LNTDV24_TOKEN_COL - 1] || '').trim().toUpperCase();
  const total = Number(row[10] || 0).toFixed(2);

  if (!orderId || !customerEmail || !token) {
    sheet.getRange(rowNumber, LNTDV24_TOKEN_STATUS_COL)
      .setValue('ERRORE: ID/email/token mancanti');
    return;
  }

  const trackingUrl = LNTDV24_SITE + '?ordine=' + encodeURIComponent(orderId) + '&token=' + encodeURIComponent(token);

  const body = [
    'Gentile ' + (customerName || 'cliente') + ',',
    '',
    'il pagamento del tuo ordine è stato verificato.',
    '',
    'ID ORDINE: ' + orderId,
    'TOTALE: €' + total,
    '',
    'TOKEN: ' + token,
    '',
    'LINK TRACCIAMENTO:',
    trackingUrl,
    '',
    'Conserva ID ordine e TOKEN per consultare lo stato della richiesta.',
    '',
    'La Nostra Terra da Vicino',
    'Edvinas Dragoni'
  ].join('\n');

  try {
    MailApp.sendEmail({
      to: customerEmail,
      subject: 'Pagamento confermato — ordine ' + orderId,
      body: body,
      name: 'La Nostra Terra da Vicino'
    });

    sheet.getRange(rowNumber, LNTDV24_STATUS_COL).setValue('PAGATO');
    sheet.getRange(rowNumber, LNTDV24_SHARED_AT_COL).setValue(new Date());
    sheet.getRange(rowNumber, LNTDV24_TOKEN_STATUS_COL).setValue('INVIATO');
  } catch (err) {
    sheet.getRange(rowNumber, LNTDV24_TOKEN_STATUS_COL)
      .setValue('ERRORE: ' + String(err).slice(0, 200));
    throw err;
  }
}

function lntdv24HealthCheck() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(LNTDV24_SHEET);
  if (!sheet) throw new Error('Foglio Ordini non trovato.');

  const handlers = ScriptApp.getProjectTriggers().map(function(t) {
    return t.getHandlerFunction();
  });

  const result = {
    ok: handlers.indexOf('lntdv24PaymentOnEdit_') !== -1 && handlers.indexOf('onOrderCheckboxEdit_') === -1,
    ownerEmail: LNTDV24_OWNER_EMAIL,
    copyshopEmail: LNTDV24_COPYSHOP_EMAIL,
    sheet: LNTDV24_SHEET,
    paymentColumn: LNTDV24_PAYMENT_COL,
    tokenColumn: LNTDV24_TOKEN_COL,
    sharedAtColumn: LNTDV24_SHARED_AT_COL,
    tokenStatusColumn: LNTDV24_TOKEN_STATUS_COL,
    trigger: handlers.indexOf('lntdv24PaymentOnEdit_') !== -1,
    legacyTrigger: handlers.indexOf('onOrderCheckboxEdit_') !== -1
  };

  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function lntdv24SendTestEmail() {
  MailApp.sendEmail({
    to: LNTDV24_OWNER_EMAIL,
    subject: 'LNTDV — test email configurazione',
    body: 'Test riuscito. Sistema LNTDV configurato per ' + LNTDV24_OWNER_EMAIL + '.',
    name: 'La Nostra Terra da Vicino'
  });
}
