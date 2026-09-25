/**
 * LNTDV — INSTALLER DEFINITIVO 24/09/2026
 *
 * Da copiare nel progetto Google Apps Script "LNTDV - Inoltro Ordini".
 * Non dipende da funzioni esterne del repository per il sistema pagamento/token.
 *
 * Avvio UNA SOLA VOLTA:
 *   lntdvInstall24092026()
 * poi:
 *   lntdvHealth24092026()
 *
 * Flusso:
 *   Ordini!T = Pagamento confermato
 *   -> invio cliente di ID ordine + TOKEN + link tracking
 *   -> Ordini!Y = data/ora invio
 *   -> Ordini!Z = INVIATO
 *
 * Il sistema non invia il token alla creazione dell'ordine.
 */

const LNTDV24_OWNER = 'info.lanostraterradavicino@gmail.com';
const LNTDV24_SITE = 'https://lntdv.it/';
const LNTDV24_SHEET = 'Ordini';
const LNTDV24_PAYMENT_COL = 20; // T
const LNTDV24_TOKEN_COL = 16; // P
const LNTDV24_SHARED_AT_COL = 25; // Y
const LNTDV24_STATUS_COL = 26; // Z
const LNTDV24_HANDLER = 'lntdvPayment24092026_';

function lntdvInstall24092026() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(LNTDV24_SHEET);
  if (!sheet) throw new Error('Foglio Ordini non trovato.');

  // Prepara le colonne di controllo senza cancellare dati esistenti.
  sheet.getRange(1, LNTDV24_SHARED_AT_COL).setValue('Token condiviso il');
  sheet.getRange(1, LNTDV24_STATUS_COL).setValue('Stato invio token');

  // Elimina solo i vecchi trigger relativi alla conferma pagamento/token.
  const legacyHandlers = [
    'onOrderCheckboxEdit_',
    'lntdvPaymentConfirmationOnEdit_',
    'installPaymentTokenConfirmation',
    LNTDV24_HANDLER
  ];
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (legacyHandlers.indexOf(trigger.getHandlerFunction()) !== -1) {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger(LNTDV24_HANDLER)
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  SpreadsheetApp.getActive().toast(
    'LNTDV: trigger pagamento/token installato.',
    'LNTDV',
    5
  );

  return lntdvHealth24092026();
}

function lntdvPayment24092026_(e) {
  try {
    if (!e || !e.range) return;
    const range = e.range;
    const sheet = range.getSheet();
    if (sheet.getName() !== LNTDV24_SHEET) return;
    if (range.getColumn() !== LNTDV24_PAYMENT_COL) return;
    if (range.getRow() < 2) return;
    if (String(e.value).toUpperCase() !== 'TRUE') return;

    const row = range.getRow();
    const statusCell = sheet.getRange(row, LNTDV24_STATUS_COL);
    const currentStatus = String(statusCell.getValue() || '').trim().toUpperCase();
    if (currentStatus === 'INVIATO') return;

    const email = String(sheet.getRange(row, 7).getValue() || '').trim();
    const orderId = String(sheet.getRange(row, 2).getValue() || '').trim();
    const token = String(sheet.getRange(row, LNTDV24_TOKEN_COL).getValue() || '').trim();

    if (!email) throw new Error('Email cliente mancante.');
    if (!orderId) throw new Error('ID ordine mancante.');
    if (!token) throw new Error('Token tracking mancante.');

    const trackingUrl = LNTDV24_SITE + '?ordine=' + encodeURIComponent(orderId) + '&token=' + encodeURIComponent(token);
    const customerName = String(sheet.getRange(row, 3).getValue() || '').trim();

    const subject = 'Pagamento confermato — ordine ' + orderId;
    const body = [
      'Gentile ' + (customerName || 'cliente') + ',',
      '',
      'il pagamento del tuo ordine è stato confermato.',
      '',
      'ID ORDINE: ' + orderId,
      'TOKEN: ' + token,
      '',
      'LINK TRACCIAMENTO:',
      trackingUrl,
      '',
      'Conserva ID ordine e token per controllare lo stato della richiesta.',
      '',
      'La Nostra Terra da Vicino',
      'Edvinas Dragoni'
    ].join('\n');

    MailApp.sendEmail({
      to: email,
      subject: subject,
      body: body,
      name: 'La Nostra Terra da Vicino'
    });

    sheet.getRange(row, LNTDV24_SHARED_AT_COL).setValue(new Date());
    sheet.getRange(row, LNTDV24_STATUS_COL).setValue('INVIATO');
  } catch (err) {
    try {
      e.range.getSheet().getRange(e.range.getRow(), LNTDV24_STATUS_COL)
        .setValue('ERRORE: ' + String(err.message || err).slice(0, 180));
    } catch (_) {}
    console.error(err);
  }
}

function lntdvHealth24092026() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(LNTDV24_SHEET);
  if (!sheet) throw new Error('Foglio Ordini non trovato.');

  const handlers = ScriptApp.getProjectTriggers().map(function(t) {
    return t.getHandlerFunction();
  });

  const result = {
    ok: handlers.indexOf(LNTDV24_HANDLER) !== -1 &&
        handlers.indexOf('onOrderCheckboxEdit_') === -1 &&
        handlers.indexOf('lntdvPaymentConfirmationOnEdit_') === -1,
    email: LNTDV24_OWNER,
    sheet: LNTDV24_SHEET,
    paymentColumn: LNTDV24_PAYMENT_COL,
    tokenColumn: LNTDV24_TOKEN_COL,
    sharedAtColumn: LNTDV24_SHARED_AT_COL,
    statusColumn: LNTDV24_STATUS_COL,
    triggerInstalled: handlers.indexOf(LNTDV24_HANDLER) !== -1,
    legacyTriggerPresent: handlers.indexOf('onOrderCheckboxEdit_') !== -1,
    previousTokenTriggerPresent: handlers.indexOf('lntdvPaymentConfirmationOnEdit_') !== -1
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}

function lntdvSendTestEmail24092026() {
  MailApp.sendEmail({
    to: LNTDV24_OWNER,
    subject: 'LNTDV — test autorizzazione email 24/09/2026',
    body: 'Test riuscito. Apps Script è autorizzato a inviare email per LNTDV.',
    name: 'La Nostra Terra da Vicino'
  });
}
