const SHEET_NAME = 'Ordini';
const SETTINGS_SHEET = 'Impostazioni';
const OWNER_EMAIL = 'info.lanostraterradavicino@gmail.com';

/**
 * Primo avvio: eseguire setup() una volta dal progetto Apps Script.
 * Crea le schede Ordini e Impostazioni e prepara le caselle di spunta.
 */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const orders = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  ensureHeader_(orders);
  const settings = ss.getSheetByName(SETTINGS_SHEET) || ss.insertSheet(SETTINGS_SHEET);
  ensureSettings_(settings);
  formatOrders_(orders);
  formatSettings_(settings);
}

/** Endpoint usato dal catalogo per inviare un ordine. */
function doPost(e) {
  try {
    const payload = JSON.parse((e && e.parameter && e.parameter.payload) || '{}');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    ensureHeader_(sheet);

    const cfg = getSettings_();
    const items = Array.isArray(payload.items) ? payload.items : [];
    const itemText = items.map((x, i) => `${i + 1}. ${x.title || ''} — ${x.format || ''} — €${Number(x.price || 0).toFixed(2)}`).join('\n');
    const subtotal = Number(payload.total || 0);
    const deliveryType = payload.deliveryType || payload.pickup || 'Ritiro';
    const shipping = deliveryType.toLowerCase().includes('sped') ? Number(cfg.shippingPrice || 0) : 0;
    const total = subtotal + shipping;
    const orderId = payload.orderId || ('LNTDV-' + Utilities.getUuid().slice(0, 8).toUpperCase());

    const row = sheet.getLastRow() + 1;
    sheet.appendRow([
      new Date(), orderId,
      payload.customer?.name || '', payload.customer?.street || '',
      payload.customer?.zip || '', payload.customer?.city || '',
      payload.customer?.email || '', itemText, subtotal, shipping, total,
      deliveryType, payload.customer?.note || '', false, 'NUOVO'
    ]);
    sheet.getRange(row, 14).insertCheckboxes();
    sheet.getRange(row, 14).setValue(false);

    const customerEmail = payload.customer?.email || '';
    const deliveryText = deliveryType.toLowerCase().includes('sped')
      ? `Spedizione: €${shipping.toFixed(2)}`
      : `Ritiro: ${cfg.pickupText}`;
    const body = `Gentile ${payload.customer?.name || 'cliente'},\n\nabbiamo ricevuto la tua richiesta d'ordine.\n\nID ordine: ${orderId}\n\n${itemText}\n\nSubtotale: €${subtotal.toFixed(2)}\n${deliveryText}\nTotale: €${total.toFixed(2)}\n\nQuesta email conferma la ricezione della richiesta. Ti contatteremo per la conferma definitiva e per organizzare spedizione o ritiro.\n\nEdvinas Dragoni\nLa Nostra Terra da Vicino`;

    if (customerEmail) MailApp.sendEmail(customerEmail, `Conferma richiesta ordine ${orderId} — La Nostra Terra da Vicino`, body);

    const adminUrl = ScriptApp.getService().getUrl() + '?action=order&orderId=' + encodeURIComponent(orderId) + '&key=' + encodeURIComponent(cfg.adminKey);
    MailApp.sendEmail({
      to: OWNER_EMAIL,
      subject: `Nuovo ordine ${orderId}`,
      body: body + `\n\nGESTIONE ORDINE:\n${adminUrl}`
    });

    return json_({ ok: true, orderId: orderId, subtotal: subtotal, shipping: shipping, total: total });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/**
 * GET pubblico per le impostazioni di spedizione/ritiro e GET protetto
 * per aprire la finestra separata di gestione di un singolo ordine.
 */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'config') {
    const cfg = getSettings_();
    return json_({ ok: true, shippingPrice: Number(cfg.shippingPrice || 0), pickupText: cfg.pickupText });
  }
  if (p.action === 'order') return orderWindow_(p.orderId || '', p.key || '');
  return HtmlService.createHtmlOutput('<!doctype html><html><body style="font-family:Arial;padding:30px"><h2>La Nostra Terra da Vicino</h2><p>Servizio ordini attivo.</p></body></html>');
}

function orderWindow_(orderId, key) {
  const cfg = getSettings_();
  if (!orderId || key !== cfg.adminKey) return HtmlService.createHtmlOutput('<h3>Accesso non autorizzato</h3>');
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return HtmlService.createHtmlOutput('<h3>Nessun ordine disponibile</h3>');
  const values = sheet.getDataRange().getValues();
  const row = values.find(r => String(r[1]) === String(orderId));
  if (!row) return HtmlService.createHtmlOutput('<h3>Ordine non trovato</h3>');
  const received = row[13] === true;
  const status = row[14] || 'NUOVO';
  const safe = v => String(v ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gestione ${safe(orderId)}</title><style>body{font-family:Arial,sans-serif;background:#f3eadc;color:#3d281d;margin:0;padding:24px}.box{max-width:760px;margin:auto;background:#fffaf3;border:1px solid #d8c5ae;border-radius:16px;padding:24px;box-shadow:0 8px 30px #0001}h1{margin-top:0}.row{padding:9px 0;border-bottom:1px solid #eadbc9}.ok{font-size:18px;font-weight:700}button{background:#5a3b2b;color:#fff;border:0;border-radius:9px;padding:12px 18px;font-size:16px;cursor:pointer}</style></head><body><div class="box"><h1>Gestione ordine ${safe(orderId)}</h1><div class="row"><b>Cliente:</b> ${safe(row[2])}</div><div class="row"><b>Email:</b> ${safe(row[6])}</div><div class="row"><b>Ordine:</b><br>${safe(row[7]).replace(/\n/g,'<br>')}</div><div class="row"><b>Subtotale:</b> €${Number(row[8]||0).toFixed(2)}</div><div class="row"><b>Spedizione:</b> €${Number(row[9]||0).toFixed(2)}</div><div class="row"><b>Totale:</b> €${Number(row[10]||0).toFixed(2)}</div><div class="row"><b>Modalità:</b> ${safe(row[11])}</div><div class="row"><b>Note:</b> ${safe(row[12])}</div><p class="ok">${received ? '✓ ORDINE RICEVUTO' : '☐ ORDINE DA CONFERMARE'}</p><button onclick="google.script.run.withSuccessHandler(()=>location.reload()).setOrderReceived('${safe(orderId)}',true)">✓ Segna ordine ricevuto / preso in carico</button></div></body></html>`;
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function setOrderReceived(orderId, value) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Foglio Ordini non trovato');
  const values = sheet.getDataRange().getValues();
  const index = values.findIndex(r => String(r[1]) === String(orderId));
  if (index < 1) throw new Error('Ordine non trovato');
  sheet.getRange(index + 1, 14).setValue(Boolean(value));
  sheet.getRange(index + 1, 15).setValue(value ? 'RICEVUTO / PRESO IN CARICO' : 'NUOVO');
  return true;
}

function getSettings_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SETTINGS_SHEET) || ss.insertSheet(SETTINGS_SHEET);
  ensureSettings_(sh);
  const data = sh.getDataRange().getValues();
  const out = {};
  data.slice(1).forEach(r => { if (r[0]) out[String(r[0])] = r[1]; });
  return {
    shippingPrice: Number(out.shippingPrice || 0),
    pickupText: String(out.pickupText || 'Ritiro da concordare'),
    adminKey: String(out.adminKey || 'CAMBIA-QUESTA-CHIAVE')
  };
}

function ensureHeader_(sheet) {
  const headers = ['Data','ID ordine','Nome','Via','CAP','Città','Email cliente','Ordine','Subtotale','Spedizione','Totale','Modalità consegna','Note','Ricezione ordine','Stato'];
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  else if (sheet.getRange(1,1,1,headers.length).getValues()[0].length < headers.length) sheet.getRange(1,1,1,headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
}

function ensureSettings_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1,1,3,2).setValues([
      ['Parametro','Valore'],
      ['shippingPrice', 10],
      ['pickupText', 'Ritiro da concordare a Milano']
    ]);
    sheet.getRange(4,1,1,2).setValues([['adminKey','CAMBIA-QUESTA-CHIAVE']]);
    sheet.setFrozenRows(1);
  }
}

function formatOrders_(sheet) {
  sheet.getRange(1,1,1,15).setFontWeight('bold');
  sheet.autoResizeColumns(1,15);
  if (sheet.getLastRow() > 1) sheet.getRange(2,14,sheet.getLastRow()-1,1).insertCheckboxes();
}

function formatSettings_(sheet) {
  sheet.getRange(1,1,1,2).setFontWeight('bold');
  sheet.autoResizeColumns(1,2);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
