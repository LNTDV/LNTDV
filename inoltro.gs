/************************************************************
 * LNTDV — inoltro.gs
 * Web App Google Apps Script per ricevere gli ordini LNTDV.
 ************************************************************/

const CONFIG = {
  SHEET_NAME: 'lntdv-ordini',
  NOTIFY_EMAIL: 'info.lanostraterradavicino@gmail.com',
  HEADER: [
    'DATA','ID ORDINE','STATO ORDINE','STATO PAGAMENTO','CLIENTE',
    'EMAIL CLIENTE','TELEFONO','INDIRIZZO','CAP','CITTÀ','CONSEGNA',
    'TOTALE','SUBTOTALE','COSTO CONSEGNA','FOTO / FORMATO / QTA',
    'TOKEN TRACKING','NOTE'
  ]
};

function doGet() {
  return jsonResponse_({
    ok: true,
    service: 'LNTDV inoltro ordini',
    status: 'online',
    time: new Date().toISOString()
  });
}

function doPost(e) {
  try {
    if (!e || !e.parameter || !e.parameter.payload) {
      throw new Error('Payload ordine mancante');
    }

    const payload = JSON.parse(e.parameter.payload);
    if (!payload.orderId) throw new Error('ID ordine mancante');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      throw new Error('Il progetto Apps Script deve essere collegato al documento lntdv-ordini.');
    }

    let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(CONFIG.SHEET_NAME);

    ensureHeader_(sheet);

    if (orderExists_(sheet, String(payload.orderId))) {
      return jsonResponse_({ok:true, duplicate:true, orderId:payload.orderId});
    }

    const customer = payload.customer || {};
    const items = Array.isArray(payload.items) ? payload.items : [];

    const itemText = items.map(function(item) {
      return [
        item.title || '',
        item.format || '',
        'QTA ' + (item.quantity || 1),
        '€' + Number(item.price || 0).toFixed(2)
      ].join(' | ');
    }).join('\n');

    const row = [
      new Date(),
      payload.orderId || '',
      payload.orderStatus || 'ORDINE RICEVUTO',
      payload.paymentStatus || 'IN_ATTESA_DI_BONIFICO',
      customer.name || '',
      customer.email || '',
      customer.phone || '',
      customer.street || '',
      customer.zip || '',
      customer.city || '',
      payload.deliveryType || '',
      Number(payload.total || 0),
      Number(payload.subtotal || payload.baseTotal || 0),
      Number(payload.shippingFee || 0),
      itemText,
      payload.trackingToken || '',
      customer.note || ''
    ];

    // Prima riga libera in fondo: nessun intervallo 1–1999 precompilato.
    const nextRow = Math.max(sheet.getLastRow() + 1, 2);
    sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
    sheet.getRange(nextRow, 1).setNumberFormat('dd/MM/yyyy HH:mm:ss');
    sheet.getRange(nextRow, 12, 1, 3).setNumberFormat('€0.00');

    sendNotification_(payload, customer, items);

    return jsonResponse_({
      ok:true, saved:true, orderId:payload.orderId, row:nextRow
    });

  } catch (err) {
    console.error(err);
    return jsonResponse_({
      ok:false,
      error:String(err && err.message ? err.message : err)
    });
  }
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, CONFIG.HEADER.length).setValues([CONFIG.HEADER]);
    sheet.setFrozenRows(1);
  }
}

function orderExists_(sheet, orderId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  const values = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  return values.some(function(row) {
    return String(row[0] || '') === orderId;
  });
}

function sendNotification_(payload, customer, items) {
  try {
    const lines = items.map(function(item) {
      return (item.title || '') + ' — ' +
             (item.format || '') + ' — QTA ' + (item.quantity || 1);
    });

    const body =
      'NUOVO ORDINE LNTDV\n\n' +
      'ID ORDINE: ' + (payload.orderId || '') + '\n' +
      'CLIENTE: ' + (customer.name || '') + '\n' +
      'EMAIL: ' + (customer.email || '') + '\n' +
      'CONSEGNA: ' + (payload.deliveryType || '') + '\n' +
      'TOTALE: €' + Number(payload.total || 0).toFixed(2) + '\n\n' +
      'FOTO:\n' + lines.join('\n');

    MailApp.sendEmail({
      to: CONFIG.NOTIFY_EMAIL,
      subject: 'LNTDV — Nuovo ordine ' + (payload.orderId || ''),
      body: body
    });
  } catch (mailError) {
    console.error(mailError);
  }
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
