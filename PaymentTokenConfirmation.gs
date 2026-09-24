/**
 * LNTDV — Conferma pagamento e condivisione token
 *
 * Flusso definitivo:
 * 1. L'ordine viene registrato senza inviare il token al cliente.
 * 2. L'amministratore spunta "Pagamento confermato" nella colonna 20.
 * 3. Il trigger installabile invia una sola mail al cliente con ID, token e link.
 * 4. La colonna 25 registra data/ora dell'invio per impedire duplicati.
 * 5. La colonna 26 registra l'esito dell'invio.
 *
 * Eseguire UNA VOLTA la funzione installPaymentTokenConfirmation() dopo aver
 * aggiornato il progetto Apps Script. La funzione sostituisce l'eventuale
 * vecchio trigger onOrderCheckboxEdit_ per evitare doppie email.
 */

const LNTDV_PAYMENT_CONFIRMATION_COLUMN = 20;
const LNTDV_TOKEN_SENT_AT_COLUMN = 25;
const LNTDV_TOKEN_SEND_STATUS_COLUMN = 26;

function installPaymentTokenConfirmation() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Ordini') || ss.insertSheet('Ordini');

  ensurePaymentTokenColumns_(sheet);

  // Elimina solo i vecchi trigger che gestivano la stessa spunta.
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    const handler = trigger.getHandlerFunction();
    if (handler === 'onOrderCheckboxEdit_' || handler === 'lntdvPaymentConfirmationOnEdit_') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger('lntdvPaymentConfirmationOnEdit_')
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  SpreadsheetApp.getUi().alert(
    'LNTDV',
    'Sistema conferma pagamento + token installato correttamente.\n\nLa mail con ID ordine, token e link verrà inviata solo quando spunti "Pagamento confermato".',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function ensurePaymentTokenColumns_(sheet) {
  const requiredColumns = LNTDV_TOKEN_SEND_STATUS_COLUMN;
  if (sheet.getMaxColumns() < requiredColumns) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), requiredColumns - sheet.getMaxColumns());
  }

  sheet.getRange(1, LNTDV_TOKEN_SENT_AT_COLUMN).setValue('Token condiviso il');
  sheet.getRange(1, LNTDV_TOKEN_SEND_STATUS_COLUMN).setValue('Stato invio token');
  sheet.getRange(1, LNTDV_TOKEN_SENT_AT_COLUMN, Math.max(sheet.getLastRow(), 1), 1)
    .setNumberFormat('dd/MM/yyyy HH:mm:ss');
}

function lntdvPaymentConfirmationOnEdit_(e) {
  try {
    if (!e || !e.range) return;

    const range = e.range;
    const sheet = range.getSheet();

    if (sheet.getName() !== 'Ordini') return;
    if (range.getNumRows() !== 1 || range.getNumColumns() !== 1) return;
    if (range.getRow() < 2) return;
    if (range.getColumn() !== LNTDV_PAYMENT_CONFIRMATION_COLUMN) return;

    const checked = String(e.value || '').toUpperCase() === 'TRUE' || range.getValue() === true;
    if (!checked) return;

    ensurePaymentTokenColumns_(sheet);

    const rowNumber = range.getRow();
    const row = sheet.getRange(rowNumber, 1, 1, LNTDV_TOKEN_SEND_STATUS_COLUMN).getValues()[0];

    const orderId = String(row[1] || '').trim();
    const customerName = String(row[2] || '').trim();
    const customerEmail = String(row[6] || '').trim();
    const trackingToken = String(row[15] || '').trim().toUpperCase();

    if (!orderId || !customerEmail || !trackingToken) {
      sheet.getRange(rowNumber, LNTDV_TOKEN_SEND_STATUS_COLUMN)
        .setValue('ERRORE: dati ordine/token mancanti');
      return;
    }

    // Idempotenza: se il token è già stato inviato, non inviare una seconda mail.
    const alreadySentAt = row[LNTDV_TOKEN_SENT_AT_COLUMN - 1];
    if (alreadySentAt) return;

    const siteUrl = 'https://lntdv.it/';
    const trackingUrl = siteUrl + '?ordine=' + encodeURIComponent(orderId) + '&token=' + encodeURIComponent(trackingToken);
    const total = Number(row[10] || 0).toFixed(2);

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
      'TOKEN: ' + trackingToken,
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

    // Stato e timestamp vengono scritti solo dopo l'invio riuscito.
    sheet.getRange(rowNumber, 15).setValue('PAGATO');
    sheet.getRange(rowNumber, LNTDV_TOKEN_SENT_AT_COLUMN).setValue(new Date());
    sheet.getRange(rowNumber, LNTDV_TOKEN_SEND_STATUS_COLUMN).setValue('INVIATO');

  } catch (err) {
    try {
      const sheet = e && e.range ? e.range.getSheet() : null;
      if (sheet && sheet.getName() === 'Ordini' && e.range.getRow() >= 2) {
        ensurePaymentTokenColumns_(sheet);
        sheet.getRange(e.range.getRow(), LNTDV_TOKEN_SEND_STATUS_COLUMN)
          .setValue('ERRORE: ' + String(err).slice(0, 200));
      }
    } catch (_) {}
    console.error('LNTDV payment/token confirmation error: ' + err);
  }
}

function testPaymentTokenConfirmationSetup() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ordini');
  if (!sheet) throw new Error('Foglio Ordini non trovato.');
  ensurePaymentTokenColumns_(sheet);

  const triggers = ScriptApp.getProjectTriggers().map(function(t) {
    return t.getHandlerFunction();
  });

  return {
    ok: true,
    sheet: 'Ordini',
    paymentConfirmationColumn: LNTDV_PAYMENT_CONFIRMATION_COLUMN,
    tokenColumn: 16,
    sentAtColumn: LNTDV_TOKEN_SENT_AT_COLUMN,
    statusColumn: LNTDV_TOKEN_SEND_STATUS_COLUMN,
    triggerInstalled: triggers.indexOf('lntdvPaymentConfirmationOnEdit_') !== -1,
    oldTriggerPresent: triggers.indexOf('onOrderCheckboxEdit_') !== -1
  };
}
