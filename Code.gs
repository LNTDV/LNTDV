const SHEET_NAME = 'Ordini';
const OWNER_EMAIL = 'info.lanostraterradavicino@gmail.com';

function doPost(e) {
  try {
    const payload = JSON.parse(e.parameter.payload || '{}');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    ensureHeader_(sheet);

    const items = payload.items || [];
    const itemText = items.map((x, i) => `${i + 1}. ${x.title} — ${x.format} — €${x.price}`).join('\n');

    sheet.appendRow([
      new Date(),
      payload.orderId || '',
      payload.customer?.name || '',
      payload.customer?.street || '',
      payload.customer?.zip || '',
      payload.customer?.city || '',
      payload.customer?.email || '',
      itemText,
      payload.total || 0,
      payload.customer?.note || '',
      payload.pickup || '',
      'RICHIESTA RICEVUTA'
    ]);

    const customerEmail = payload.customer?.email || '';
    const subject = `Conferma richiesta ordine ${payload.orderId || ''} — La nostra terra da vicino`;
    const body = `Gentile ${payload.customer?.name || 'cliente'},\n\nabbiamo ricevuto la tua richiesta d'ordine.\n\nID ordine: ${payload.orderId || ''}\n\n${itemText}\n\nTotale richiesto: €${payload.total || 0}\n\nRitiro: ${payload.pickup || 'Milano'}\n\nQuesta email conferma la ricezione della richiesta. Ti contatteremo per la conferma definitiva e per organizzare il ritiro.\n\nEdvinas Dragoni\nLa nostra terra da vicino`;

    if (customerEmail) MailApp.sendEmail(customerEmail, subject, body);
    MailApp.sendEmail(OWNER_EMAIL, `Nuovo ordine ${payload.orderId || ''}`, body);

    return ContentService.createTextOutput(JSON.stringify({ok:true, orderId:payload.orderId}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false, error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Data','ID ordine','Nome','Via','CAP','Città','Email cliente','Ordine','Totale','Note','Ritiro','Stato']);
    sheet.setFrozenRows(1);
  }
}