/**
 * LNTDV — INSTALLAZIONE DEFINITIVA
 *
 * Eseguire UNA SOLA VOLTA: lntdvFinalSetup()
 *
 * Fa pulizia dei vecchi trigger e installa il flusso definitivo:
 * Pagamento confermato (col. 20) -> email cliente con ID + token + tracking.
 */
function lntdvFinalSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Ordini') || ss.insertSheet('Ordini');

  // 1) Elimina TUTTI i trigger legacy che possono inviare la conferma pagamento.
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    const fn = trigger.getHandlerFunction();
    if (fn === 'onOrderCheckboxEdit_' || fn === 'lntdvPaymentConfirmationOnEdit_') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // 2) Garantisce le colonne usate dal nuovo sistema.
  if (sheet.getMaxColumns() < 26) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), 26 - sheet.getMaxColumns());
  }
  sheet.getRange(1, 20).setValue('Pagamento confermato');
  sheet.getRange(1, 25).setValue('Token condiviso il');
  sheet.getRange(1, 26).setValue('Stato invio token');
  sheet.getRange(1, 25, Math.max(sheet.getLastRow(), 1), 1)
    .setNumberFormat('dd/MM/yyyy HH:mm:ss');

  // 3) Un solo trigger installabile per la conferma pagamento.
  ScriptApp.newTrigger('lntdvPaymentConfirmationOnEdit_')
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  // 4) Mantiene attivi i trigger già previsti dal sistema copisteria.
  if (typeof ensureCopyshopReplyTrigger_ === 'function') {
    ensureCopyshopReplyTrigger_();
  }
  if (typeof ensureFinalCopyshopTrigger_ === 'function') {
    ensureFinalCopyshopTrigger_();
  }

  SpreadsheetApp.flush();
  SpreadsheetApp.getUi().alert(
    'LNTDV — INSTALLAZIONE COMPLETATA',
    'Trigger legacy rimossi.\n\nIl sistema ora usa esclusivamente la spunta "Pagamento confermato" per inviare al cliente ID ordine, TOKEN e link di tracciamento.\n\nNon viene reinviata la mail se il token è già stato condiviso.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function lntdvFinalHealthCheck() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Ordini');
  if (!sheet) throw new Error('Foglio Ordini non trovato.');

  const handlers = ScriptApp.getProjectTriggers().map(function(t) {
    return t.getHandlerFunction();
  });

  const oldTrigger = handlers.indexOf('onOrderCheckboxEdit_') !== -1;
  const newTrigger = handlers.indexOf('lntdvPaymentConfirmationOnEdit_') !== -1;
  const result = {
    ok: !oldTrigger && newTrigger,
    paymentColumn: 20,
    tokenColumn: 16,
    tokenSharedAtColumn: 25,
    tokenStatusColumn: 26,
    oldTriggerPresent: oldTrigger,
    newTriggerPresent: newTrigger
  };

  Logger.log(JSON.stringify(result, null, 2));
  return result;
}
