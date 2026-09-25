/**
 * LNTDV — DEPLOY CANONICO GOOGLE APPS SCRIPT
 * Versione: 24/09/2026
 *
 * UNICO gestore del pagamento:
 * Ordini!T = TRUE
 *   -> una sola email al cliente
 *   -> Ordini!Y = data/ora invio
 *   -> Ordini!Z = INVIATO
 *
 * Prima di usare questo file: eseguire UNA VOLTA
 * lntdvInstallFinal24092026()
 *
 * Il sistema elimina automaticamente tutti i trigger legacy relativi
 * alla conferma pagamento/token e installa un solo trigger.
 */

const LNTDV_FINAL_2026_OWNER = 'info.lanostraterradavicino@gmail.com';
const LNTDV_FINAL_2026_SITE = 'https://lntdv.it/';
const LNTDV_FINAL_2026_SHEET = 'Ordini';
const LNTDV_FINAL_2026_PAYMENT_COL = 20; // T
const LNTDV_FINAL_2026_TOKEN_COL = 16; // P
const LNTDV_FINAL_2026_SHARED_AT_COL = 25; // Y
const LNTDV_FINAL_2026_STATUS_COL = 26; // Z
const LNTDV_FINAL_2026_HANDLER = 'lntdvPaymentFinal24092026_';

function lntdvInstallFinal24092026() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Apri il progetto Apps Script collegato al foglio Ordini.');

  const sheet = ss.getSheetByName(LNTDV_FINAL_2026_SHEET);
  if (!sheet) throw new Error('Foglio Ordini non trovato.');

  if (sheet.getMaxColumns() < LNTDV_FINAL_2026_STATUS_COL) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), LNTDV_FINAL_2026_STATUS_COL - sheet.getMaxColumns());
  }

  sheet.getRange(1, LNTDV_FINAL_2026_PAYMENT_COL).setValue('Pagamento confermato');
  sheet.getRange(1, LNTDV_FINAL_2026_SHARED_AT_COL).setValue('Token condiviso il');
  sheet.getRange(1, LNTDV_FINAL_2026_STATUS_COL).setValue('Stato invio token');
  sheet.getRange(1, LNTDV_FINAL_2026_SHARED_AT_COL, Math.max(sheet.getLastRow(), 1), 1)
    .setNumberFormat('dd/MM/yyyy HH:mm:ss');

  const obsolete = [
    'onOrderCheckboxEdit_',
    'lntdvPaymentConfirmationOnEdit_',
    'lntdvPayment24092026_',
    'lntdv24PaymentOnEdit_',
    'lntdvPaymentFinal24092026_'
  ];

  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (obsolete.indexOf(trigger.getHandlerFunction()) !== -1) {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger(LNTDV_FINAL_2026_HANDLER)
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  SpreadsheetApp.flush();
  return lntdvHealthFinal24092026();
}

function lntdvPaymentFinal24092026_(e) {
  const lock = LockService.getScriptLock();
  try {
    if (!e || !e.range) return;
    const range = e.range;
    const sheet = range.getSheet();

    if (sheet.getName() !== LNTDV_FINAL_2026_SHEET) return;
    if (range.getNumRows() !== 1 || range.getNumColumns() !== 1) return;
    if (range.getRow() < 2 || range.getColumn() !== LNTDV_FINAL_2026_PAYMENT_COL) return;

    const checked = range.getValue() === true || String(e.value || '').toUpperCase() === 'TRUE';
    if (!checked) return;

    lock.waitLock(15000);

    const rowNumber = range.getRow();
    const sentAtCell = sheet.getRange(rowNumber, LNTDV_FINAL_2026_SHARED_AT_COL);
    const statusCell = sheet.getRange(rowNumber, LNTDV_FINAL_2026_STATUS_COL);

    // Idempotenza forte: se una conferma è già stata inviata, non inviare altro.
    if (sentAtCell.getValue() || String(statusCell.getValue() || '').toUpperCase() === 'INVIATO') return;

    const orderId = String(sheet.getRange(rowNumber, 2).getValue() || '').trim();
    const customerName = String(sheet.getRange(rowNumber, 3).getValue() || '').trim();
    const customerEmail = String(sheet.getRange(rowNumber, 7).getValue() || '').trim();
    const total = Number(sheet.getRange(rowNumber, 11).getValue() || 0).toFixed(2);
    const token = String(sheet.getRange(rowNumber, LNTDV_FINAL_2026_TOKEN_COL).getValue() || '').trim().toUpperCase();

    if (!orderId) throw new Error('ID ordine mancante.');
    if (!customerEmail) throw new Error('Email cliente mancante.');
    if (!token) throw new Error('Token tracking mancante.');

    const trackingUrl = LNTDV_FINAL_2026_SITE + '?ordine=' + encodeURIComponent(orderId) + '&token=' + encodeURIComponent(token);

    const body = [
      'Gentile ' + (customerName || 'cliente') + ',',
      '',
      'il pagamento del tuo ordine è stato verificato.',
      '',
      'DATI DEL TUO ORDINE',
      'ID ORDINE: ' + orderId,
      'TOTALE: €' + total,
      '',
      'DATI PER LA TRACCIABILITÀ',
      'TOKEN: ' + token,
      'LINK TRACCIAMENTO:',
      trackingUrl,
      '',
      'Conserva il TOKEN e l’ID ORDINE: ti serviranno per consultare lo stato della richiesta.',
      '',
      'La Nostra Terra da Vicino',
      'Edvinas Dragoni'
    ].join('\n');

    MailApp.sendEmail({
      to: customerEmail,
      subject: 'Pagamento confermato — ordine ' + orderId,
      body: body,
      name: 'La Nostra Terra da Vicino'
    });

    // Scrive lo stato SOLO dopo l'invio riuscito.
    sheet.getRange(rowNumber, 15).setValue('PAGATO');
    sentAtCell.setValue(new Date());
    statusCell.setValue('INVIATO');
    SpreadsheetApp.flush();

  } catch (err) {
    try {
      if (e && e.range) {
        e.range.getSheet().getRange(e.range.getRow(), LNTDV_FINAL_2026_STATUS_COL)
          .setValue('ERRORE: ' + String(err.message || err).slice(0, 180));
      }
    } catch (_) {}
    console.error('LNTDV payment/token error: ' + err);
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function lntdvHealthFinal24092026() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss && ss.getSheetByName(LNTDV_FINAL_2026_SHEET);
  if (!sheet) throw new Error('Foglio Ordini non trovato.');

  const handlers = ScriptApp.getProjectTriggers().map(function(t) {
    return t.getHandlerFunction();
  });

  const obsolete = [
    'onOrderCheckboxEdit_',
    'lntdvPaymentConfirmationOnEdit_',
    'lntdvPayment24092026_',
    'lntdv24PaymentOnEdit_'
  ];

  const active = handlers.filter(function(h) {
    return h === LNTDV_FINAL_2026_HANDLER;
  });

  const result = {
    ok: active.length === 1 && obsolete.every(function(h) { return handlers.indexOf(h) === -1; }),
    service: 'LNTDV Apps Script',
    version: '2026-09-24',
    email: LNTDV_FINAL_2026_OWNER,
    sheet: LNTDV_FINAL_2026_SHEET,
    paymentColumn: LNTDV_FINAL_2026_PAYMENT_COL,
    tokenColumn: LNTDV_FINAL_2026_TOKEN_COL,
    sharedAtColumn: LNTDV_FINAL_2026_SHARED_AT_COL,
    statusColumn: LNTDV_FINAL_2026_STATUS_COL,
    activeTrigger: active.length === 1,
    obsoleteTriggers: obsolete.filter(function(h) { return handlers.indexOf(h) !== -1; }),
    duplicateCanonicalTriggers: Math.max(0, active.length - 1)
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}

function lntdvSendTestEmailFinal24092026() {
  MailApp.sendEmail({
    to: LNTDV_FINAL_2026_OWNER,
    subject: 'LNTDV — test email autorizzazione 24/09/2026',
    body: 'Test riuscito: Apps Script può inviare email per LNTDV.',
    name: 'La Nostra Terra da Vicino'
  });
}
