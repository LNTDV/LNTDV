const SHEET_NAME = 'Ordini';
const SETTINGS_SHEET = 'Impostazioni';
const OWNER_EMAIL = 'info.lanostraterradavicino@gmail.com';
const COPYSHOP_EMAIL = 'tps.samuele@gmail.com';
const COPYSHOP_SENT_COLUMN = 21;
const DELIVERY_DATE_COLUMN = 22;
const COPYSHOP_STATUS_COLUMN = 23;
const COPYSHOP_LAST_MESSAGE_COLUMN = 24;
const SITE_URL = 'https://lntdv.it/';
const PAYMENT_CONFIRMATION_COLUMN = 20;
const FINAL_COPYSHOP_DATE = '2026-10-15';

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const orders = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  const settings = ss.getSheetByName(SETTINGS_SHEET) || ss.insertSheet(SETTINGS_SHEET);
  ensureHeader_(orders);
  ensureSettings_(settings);
  formatOrders_(orders);
  formatSettings_(settings);
  ensureOrderEditTrigger_();
  ensureCopyshopReplyTrigger_();
}

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.parameter && e.parameter.payload) || '{}');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    ensureHeader_(sheet);
    try { ensureCopyshopReplyTrigger_(); } catch (_) {}
    const cfg = getSettings_();
    const customer = payload.customer || {};
    const items = Array.isArray(payload.items) ? payload.items : [];
    if (!items.length) throw new Error('Nessuna fotografia selezionata.');
    if (!customer.name || !customer.email) throw new Error('Nome ed email sono obbligatori.');
    const deliveryType = String(payload.deliveryType || payload.pickup || 'Ritiro');
    const photoCount = items.reduce((n, x) => n + Math.max(1, Number(x.quantity) || 1), 0);
    const shipping = photoCount > 2 ? 10 : 0;
    const subtotal = Number(payload.baseTotal ?? Math.max(0, Number(payload.total || 0) - shipping));
    const total = Number(payload.total ?? (subtotal + shipping));
    const suppliedOrderId = String(payload.orderId || '').trim();
    const orderId = /^LNTDV-[A-Z0-9-]{6,80}$/.test(suppliedOrderId) ? suppliedOrderId : ('LNTDV-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '-' + Utilities.getUuid().replace(/-/g,'').slice(0,8).toUpperCase());
    const paymentMethod = 'Bonifico bancario';
    const paymentStatus = String(payload.paymentStatus || 'IN_ATTESA_DI_PAGAMENTO').toUpperCase();
    const receivedStatus = 'RICEVUTO';
    const suppliedTrackingToken = String(payload.trackingToken || '').trim().toUpperCase();
    const trackingToken = /^[A-Z0-9]{24,80}$/.test(suppliedTrackingToken) ? suppliedTrackingToken : Utilities.getUuid().replace(/-/g,'').toUpperCase();
    const trackingUrl = SITE_URL + '?ordine=' + encodeURIComponent(orderId) + '&token=' + encodeURIComponent(trackingToken);
    const itemText = items.map((x, i) => `${i + 1}. ${x.title || 'Fotografia'} — ${x.orientation || 'Orientamento non specificato'} — ${x.format || 'Formato non specificato'} — €${Number(x.price || 0).toFixed(2)}`).join('\n');
    const existing = sheet.getDataRange().getValues().findIndex((r, i) => i > 0 && String(r[1]) === orderId);
    if (existing > 0) return json_({ok:true, orderId:orderId, trackingToken:String(sheet.getRange(existing + 1, 16).getValue() || trackingToken), paymentStatus:String(sheet.getRange(existing + 1, 15).getValue() || paymentStatus), subtotal:Number(sheet.getRange(existing + 1, 9).getValue() || subtotal), shipping:Number(sheet.getRange(existing + 1, 10).getValue() || shipping), total:Number(sheet.getRange(existing + 1, 11).getValue() || total), duplicate:true});
    const row = sheet.getLastRow() + 1;
    sheet.appendRow([new Date(), orderId, customer.name || '', customer.street || '', customer.zip || '', customer.city || '', customer.email || '', itemText, subtotal, shipping, total, deliveryType, customer.note || '', true, paymentStatus === 'PAGATO' ? 'PAGATO' : receivedStatus, trackingToken]);
    sheet.getRange(row, 14).insertCheckboxes().setValue(true);
    const deliveryText = deliveryType.toLowerCase().includes('sped') ? `Spedizione: €${shipping.toFixed(2)}` : `Ritiro: ${deliveryType}`;
    const promotionText = payload.promotion ? `Promozione applicata: ${payload.promotion}\n` : '';
    const body = `Gentile ${customer.name},\n\nabbiamo ricevuto la tua richiesta d'ordine.\n\nID ordine: ${orderId}\n\n${itemText}\n\nSubtotale: €${subtotal.toFixed(2)}\n${deliveryText}\nTotale: €${total.toFixed(2)}\n${promotionText}Metodo di pagamento: ${paymentMethod || 'Carta'}\n\nL'ordine è stato registrato. Riceverai le indicazioni relative al pagamento secondo il metodo selezionato.\n\nSegui il tuo ordine in qualsiasi momento:\n${trackingUrl}\n\nEdvinas Dragoni\nLa Nostra Terra da Vicino`;
    // Invia sempre prima la copia amministrativa all'indirizzo fisso del progetto.
    MailApp.sendEmail({
      to: OWNER_EMAIL,
      subject: `Nuovo ordine ${orderId}${paymentStatus === 'PAGATO' ? ' — PAGATO' : ''}`,
      body: body
    });

    MailApp.sendEmail({
      to: customer.email,
      subject: `Conferma ordine ${orderId} — La Nostra Terra da Vicino`,
      body: body
    });
    if (paymentStatus === 'PAGATO') {
      const paymentBody = `Gentile ${customer.name},\n\nconfermiamo che il pagamento dell'ordine ${orderId} risulta PAGATO.\n\n${itemText}\n\nTotale pagato: €${total.toFixed(2)}\nMetodo di pagamento: ${paymentMethod || 'non specificato'}\n\nConserva questa email come conferma del pagamento.\n\nEdvinas Dragoni\nLa Nostra Terra da Vicino`;
      MailApp.sendEmail({to: customer.email, subject: `Pagamento confermato ${orderId} — La Nostra Terra da Vicino`, body: paymentBody});
    }
    return json_({ok:true, orderId:orderId, trackingToken:trackingToken, paymentStatus:paymentStatus, subtotal:subtotal, shipping:shipping, total:total});
  } catch (err) {
    return json_({ok:false, error:String(err)});
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'config') { const cfg = getSettings_(); return json_({ok:true, shippingPrice:Number(cfg.shippingPrice || 0), pickupText:cfg.pickupText, iban:cfg.iban || '', accountHolder:cfg.accountHolder || 'Edvinas Dragoni', paymentNote:'Pagamento tramite il metodo selezionato nel checkout.'}); }
  if (p.action === 'confirm') return confirmOrder_(p.orderId || p.ordine || '', p.token || '', p.email || '', p.callback || '');
  if (p.action === 'order') return orderWindow_(p.orderId || p.ordine || '', p.key || '');
  if (p.action === 'track') return trackOrder_(p.orderId || p.ordine || '', p.email || '', p.token || '', p.callback || '');
  if (p.action === 'shipment') return shipmentStatus_(p.orderId || p.ordine || '', p.email || '', p.token || '', p.callback || '');
  return HtmlService.createHtmlOutput('<!doctype html><html lang="it"><body style="font-family:Arial;padding:30px;background:#f3eadc;color:#3d281d"><h2>La Nostra Terra da Vicino</h2><p>Servizio ordini attivo.</p></body></html>');
}

function orderWindow_(orderId, key) {
  const cfg = getSettings_();
  if (!orderId || !key || key !== cfg.adminKey) return HtmlService.createHtmlOutput('<h3>Accesso non autorizzato</h3>');
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return HtmlService.createHtmlOutput('<h3>Nessun ordine disponibile</h3>');
  const values = sheet.getDataRange().getValues();
  const index = values.findIndex((r, i) => i > 0 && String(r[1]) === String(orderId));
  if (index < 1) return HtmlService.createHtmlOutput('<h3>Ordine non trovato</h3>');
  const row = values[index];
  const received = row[13] === true;
  const status = row[14] || 'NUOVO';
  const safe = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const orderHtml = safe(row[7]).replace(/\n/g, '<br>');
  const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gestione ${safe(orderId)}</title><style>body{font-family:Arial,sans-serif;background:#f3eadc;color:#3d281d;margin:0;padding:24px}.box{max-width:760px;margin:auto;background:#fffaf3;border:1px solid #d8c5ae;border-radius:16px;padding:24px;box-shadow:0 8px 30px #0001}h1{margin-top:0;color:#5a3b2b}.row{padding:10px 0;border-bottom:1px solid #eadbc9}.status{font-size:18px;font-weight:700;margin:22px 0}button{background:#5a3b2b;color:#fff;border:0;border-radius:9px;padding:12px 18px;font-size:16px;cursor:pointer;margin-right:8px;margin-top:8px}</style></head><body><div class="box"><h1>Gestione ordine ${safe(orderId)}</h1><div class="row"><b>Cliente:</b> ${safe(row[2])}</div><div class="row"><b>Email:</b> ${safe(row[6])}</div><div class="row"><b>Indirizzo:</b> ${safe(row[3])}, ${safe(row[4])} ${safe(row[5])}</div><div class="row"><b>Ordine:</b><br>${orderHtml}</div><div class="row"><b>Subtotale:</b> €${Number(row[8]||0).toFixed(2)}</div><div class="row"><b>Spedizione:</b> €${Number(row[9]||0).toFixed(2)}</div><div class="row"><b>Totale:</b> €${Number(row[10]||0).toFixed(2)}</div><div class="row"><b>Modalità:</b> ${safe(row[11])}</div><div class="row"><b>Data consegna Biblioteca di Arese:</b> ${safe(row[DELIVERY_DATE_COLUMN - 1] || 'Da concordare dopo il ritiro in copisteria')}</div><div class="row"><b>Stato pagamento:</b> ${safe(status)}</div><div class="row"><b>Note:</b> ${safe(row[12])}</div><div class="status">Stato: ${safe(status)}</div><button onclick="setStatus('RICEVUTO')">✓ Ricevuto</button><button onclick="setStatus('IN_LAVORAZIONE')">⚙ In lavorazione</button><button onclick="setStatus('PRONTO_AL_RITIRO')">✓ Pronto al ritiro</button><button onclick="setStatus('IN_CONSEGNA_BIBLIOTECA')">🚚 In consegna Biblioteca Arese</button><button onclick="setStatus('DISPONIBILE_PER_IL_RITIRO')">✓ Disponibile al ritiro</button><button onclick="setStatus('RITIRATO')">✓ Ritirato</button><br><input id="deliveryDate" type="date" style="padding:10px;border:1px solid #d8c5ae;border-radius:8px;margin-top:12px"><button onclick="saveDeliveryDate()">Salva data Biblioteca di Arese</button><button onclick="setStatus('CONSEGNATO')">✓ Consegnato</button><button onclick="setStatus('ANNULLATO')">× Annulla</button></div><script>function setStatus(v){google.script.run.withSuccessHandler(function(){location.reload()}).withFailureHandler(function(e){alert(e.message||e)}).setOrderStatus('${safe(orderId)}',v)}function saveDeliveryDate(){var v=document.getElementById('deliveryDate').value;if(!v){alert('Inserisci la data concordata.');return}google.script.run.withSuccessHandler(function(){location.reload()}).withFailureHandler(function(e){alert(e.message||e)}).setDeliveryDate('${safe(orderId)}',v,'${safe(cfg.adminKey)}')}</script></body></html>`;
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function setOrderReceived(orderId, value) {
  return setOrderStatus_(orderId, value ? 'RICEVUTO' : 'NUOVO');
}

function setOrderStatus(orderId, status) {
  return setOrderStatus_(orderId, status);
}

function setDeliveryDate(orderId, dateValue, key) {
  const cfg = getSettings_();
  if (String(key || '') !== cfg.adminKey) throw new Error('Accesso non autorizzato.');
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Foglio Ordini non trovato.');
  const values = sheet.getDataRange().getValues();
  const index = values.findIndex((r,i) => i > 0 && String(r[1]) === String(orderId));
  if (index < 1) throw new Error('Ordine non trovato.');
  const date = String(dateValue || '').trim();
  if (!date) throw new Error('Data consegna obbligatoria.');
  sheet.getRange(index + 1, DELIVERY_DATE_COLUMN).setValue(date);
  return true;
}

function setOrderStatus_(orderId, status) {
  const allowed = ['RICEVUTO','IN_LAVORAZIONE','PRONTO_AL_RITIRO','IN_CONSEGNA_BIBLIOTECA','DISPONIBILE_PER_IL_RITIRO','RITIRATO','CONSEGNATO','ANNULLATO','NUOVO'];
  status = String(status || '').toUpperCase();
  if (!allowed.includes(status)) throw new Error('Stato ordine non valido.');
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Foglio Ordini non trovato.');
  const values = sheet.getDataRange().getValues();
  const index = values.findIndex((r, i) => i > 0 && String(r[1]) === String(orderId));
  if (index < 1) throw new Error('Ordine non trovato.');
  const row = values[index];
  const oldStatus = String(row[14] || 'NUOVO').toUpperCase();
  sheet.getRange(index + 1, 15).setValue(status);
  sheet.getRange(index + 1, 14).setValue(status !== 'NUOVO' && status !== 'ANNULLATO');
  if (oldStatus !== status && row[6]) sendStatusEmail_(row, status);
  return true;
}

function sendStatusEmail_(row, status) {
  const labels = {
    RICEVUTO: 'Ordine ricevuto',
    IN_LAVORAZIONE: 'Ordine in lavorazione',
    PRONTO_AL_RITIRO: 'Ordine pronto per il ritiro',
    CONSEGNATO: 'Ordine consegnato',
    IN_CONSEGNA_BIBLIOTECA: 'Ordine in consegna alla Biblioteca di Arese',
    DISPONIBILE_PER_IL_RITIRO: 'Ordine disponibile per il ritiro',
    RITIRATO: 'Ordine ritirato',
    ANNULLATO: 'Ordine annullato',
    NUOVO: 'Ordine registrato'
  };
  const name = String(row[2] || '');
  const orderId = String(row[1] || '');
  const itemText = String(row[7] || '');
  const total = Number(row[10] || 0).toFixed(2);
  const pickup = String(row[11] || 'Ritiro');
  const message = {
    RICEVUTO: 'Abbiamo ricevuto il tuo ordine e lo abbiamo preso in carico.',
    IN_LAVORAZIONE: 'Il tuo ordine è ora in lavorazione.',
    PRONTO_AL_RITIRO: 'Il tuo ordine è pronto per il ritiro.',
    CONSEGNATO: 'Il tuo ordine risulta consegnato.',
    IN_CONSEGNA_BIBLIOTECA: 'Il tuo ordine è in consegna alla Biblioteca di Arese.',
    DISPONIBILE_PER_IL_RITIRO: 'Il tuo ordine è disponibile per il ritiro alla Biblioteca di Arese.',
    RITIRATO: 'Il tuo ordine risulta ritirato.',
    ANNULLATO: 'Il tuo ordine è stato annullato. Per informazioni puoi rispondere a questa email.',
    NUOVO: 'Il tuo ordine è stato registrato.'
  }[status];
  const trackingToken = String(row[15] || '');
  const trackingUrl = SITE_URL + '?ordine=' + encodeURIComponent(orderId) + '&token=' + encodeURIComponent(trackingToken);
  const deliveryDate = String(row[DELIVERY_DATE_COLUMN - 1] || '').trim();
  const pickupNote = ['PRONTO_AL_RITIRO','DISPONIBILE_PER_IL_RITIRO','IN_CONSEGNA_BIBLIOTECA'].includes(status) ? `\n\nCONSEGNA/RITIRO:\n${pickup}${deliveryDate ? '\\nData concordata: ' + deliveryDate : ''}\n\nQuando vieni a ritirare, porta con te l'ID ordine ${orderId}.` : '';
  const body = `Gentile ${name},

${message}${pickupNote}

ID ordine: ${orderId}

${itemText}

Totale ordine: €${total}
Modalità: ${pickup}

Stato: ${labels[status]}

Dati per il bonifico:
IBAN: ${getSettings_().iban || 'verrà indicato nella conferma ordine'}
Intestatario: ${getSettings_().accountHolder || 'Edvinas Dragoni'}
Causale: ${orderId}


Segui il tuo ordine:
${trackingUrl}

Edvinas Dragoni
La Nostra Terra da Vicino

© 2026 Edvinas Dragoni — La Nostra Terra Da Vicino. Tutti i diritti riservati.`;
  MailApp.sendEmail({
    to: String(row[6]),
    subject: `${labels[status]} ${orderId} — La Nostra Terra da Vicino`,
    body
  });
}

function getSettings_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SETTINGS_SHEET) || ss.insertSheet(SETTINGS_SHEET);
  ensureSettings_(sh);
  const data = sh.getDataRange().getValues();
  const out = {};
  data.slice(1).forEach(r => { if (r[0]) out[String(r[0])] = r[1]; });
  return {shippingPrice:Number(out.shippingPrice || 0), pickupText:String(out.pickupText || 'Ritiro da concordare a Milano'), adminKey:String(out.adminKey || 'CAMBIA-QUESTA-CHIAVE'), iban:String(out.iban || ''), accountHolder:String(out.accountHolder || 'Edvinas Dragoni')};
}

function ensureHeader_(sheet) {
  const headers = ['Data','ID ordine','Nome','Via','CAP','Città','Email cliente','Ordine','Subtotale','Consegna','Totale','Modalità consegna','Note','Ricezione ordine','Stato','Token tracking','','','', 'Pagamento confermato','Copisteria inviata','Data consegna Arese','Stato copisteria','Ultima mail copisteria'];
  if (sheet.getLastRow() === 0) sheet.appendRow(headers); else sheet.getRange(1,1,1,headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  if (sheet.getMaxColumns() < COPYSHOP_LAST_MESSAGE_COLUMN) sheet.insertColumnsAfter(sheet.getMaxColumns(), COPYSHOP_LAST_MESSAGE_COLUMN - sheet.getMaxColumns());
}

function ensureSettings_(sheet) {
  if (sheet.getLastRow() === 0) { sheet.getRange(1,1,8,2).setValues([['Parametro','Valore'],['shippingPrice',10],['pickupText','Ritiro da concordare a Milano'],['adminKey','CAMBIA-QUESTA-CHIAVE'],['iban',''],['xpayApiKey',''],['xpayEnvironment','TEST'],['accountHolder','Edvinas Dragoni']]); sheet.setFrozenRows(1); } else { const data=sheet.getDataRange().getValues().map(r=>String(r[0]||'')); if(!data.includes('iban')) sheet.appendRow(['iban','']); if(!data.includes('accountHolder')) sheet.appendRow(['accountHolder','Edvinas Dragoni']); }
}

function formatOrders_(sheet) { sheet.getRange(1,1,1,COPYSHOP_LAST_MESSAGE_COLUMN).setFontWeight('bold'); sheet.autoResizeColumns(1,COPYSHOP_LAST_MESSAGE_COLUMN); if (sheet.getLastRow() > 1) { sheet.getRange(2,14,sheet.getLastRow()-1,1).insertCheckboxes(); sheet.getRange(2,PAYMENT_CONFIRMATION_COLUMN,sheet.getLastRow()-1,1).insertCheckboxes(); sheet.getRange(2,COPYSHOP_SENT_COLUMN,sheet.getLastRow()-1,1).insertCheckboxes(); } }
function formatSettings_(sheet) { sheet.getRange(1,1,1,2).setFontWeight('bold'); sheet.autoResizeColumns(1,2); }
function json_(obj, callback) { const data = JSON.stringify(obj); if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) return ContentService.createTextOutput(callback + '(' + data + ');').setMimeType(ContentService.MimeType.JAVASCRIPT); return ContentService.createTextOutput(data).setMimeType(ContentService.MimeType.JSON); }


function trackOrder_(orderId, email, token, callback) {
  orderId = String(orderId || '').trim();
  email = String(email || '').trim().toLowerCase();
  token = String(token || '').trim().toUpperCase();
  if (!orderId || !token) return json_({ok:false,error:'ID ordine e token obbligatori.'}, callback);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return json_({ok:false,error:'Ordini non disponibile.'}, callback);
  const values = sheet.getDataRange().getValues();
  const index = values.findIndex((r,i) => {
    if (i === 0) return false;
    const idOk = orderId ? String(r[1]) === orderId : true;
    const tokenOk = token ? String(r[15] || '').toUpperCase() === token : false;
    const emailOk = email ? String(r[6] || '').toLowerCase() === email : true;
    return idOk && tokenOk && emailOk;
  });
  if (index < 1) return json_({ok:false,error:'Ordine non trovato.'}, callback);
  const row = values[index];
  const status = String(row[14] || 'NUOVO').toUpperCase();
  const labels = {
    RICEVUTO:'Ricevuto',
    IN_LAVORAZIONE:'In lavorazione',
    PRONTO_AL_RITIRO:'Pronto al ritiro',
    IN_CONSEGNA_BIBLIOTECA:'In consegna alla Biblioteca di Arese',
    DISPONIBILE_PER_IL_RITIRO:'Disponibile per il ritiro',
    RITIRATO:'Ritirato',
    CONSEGNATO:'Consegnato',
    ANNULLATO:'Annullato',
    NUOVO:'Registrato'
  };
  return json_({
    ok:true,
    orderId:String(row[1]),
    status:status,
    label:labels[status] || status,
    total:Number(row[10] || 0),
    deliveryDate:String(row[DELIVERY_DATE_COLUMN - 1] || ''),
    labels:{RICEVUTO:'Ricevuto',IN_LAVORAZIONE:'In lavorazione',PRONTO_AL_RITIRO:'Pronto al ritiro',IN_CONSEGNA_BIBLIOTECA:'In consegna alla Biblioteca di Arese',DISPONIBILE_PER_IL_RITIRO:'Disponibile per il ritiro',RITIRATO:'Ritirato',CONSEGNATO:'Consegnato'}
  }, callback);
}


function sendCopyshopOrderEmail_(row) {
  const orderId = String(row[1] || '');
  const customer = String(row[2] || '');
  const email = String(row[6] || '');
  const orderText = String(row[7] || '');
  const total = Number(row[10] || 0).toFixed(2);
  const delivery = String(row[11] || '');
  const body = `ORDINE LNTDV DA PRODURRE\\n\\nID ordine: ${orderId}\\nCliente: ${customer}\\nEmail cliente: ${email}\\n\\n${orderText}\\n\\nTotale: €${total}\\nModalità consegna: ${delivery}\\n\\nPer automatizzare il tracking, rispondere mantenendo l'ID ordine nell'oggetto e indicando una delle fasi: ORDINE RICEVUTO, IN STAMPA, STAMPA COMPLETATA, ORDINE PRONTO.\\n\\nLa Nostra Terra da Vicino`;
  MailApp.sendEmail({to:COPYSHOP_EMAIL,subject:`LNTDV ${orderId} — ORDINE DA PRODURRE`,body});
}

function processCopyshopEmails_() {
  const threads = GmailApp.search('in:anywhere newer_than:30d LNTDV-');
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return;
  const values = sheet.getDataRange().getValues();
  threads.forEach(thread => thread.getMessages().forEach(msg => {
    const messageId = String(msg.getId() || '');
    const subject = String(msg.getSubject() || '');
    const body = String(msg.getPlainBody() || '');
    const hay = (subject + '\\n' + body).toUpperCase();
    const idMatch = hay.match(/LNTDV-[A-Z0-9-]{6,80}/);
    if (!idMatch) return;
    const orderId = idMatch[0];
    const index = values.findIndex((r,i) => i > 0 && String(r[1]) === orderId);
    if (index < 1) return;
    const rowNumber = index + 1;
    const already = String(sheet.getRange(rowNumber,COPYSHOP_LAST_MESSAGE_COLUMN).getValue() || '');
    if (already === messageId) return;
    let status = '';
    if (/ORDINE\\s+PRONTO|PRONTO\\s+PER\\s+IL\\s+RITIRO|STAMPA\\s+COMPLETATA|COMPLETATA/.test(hay)) status = 'PRONTO_AL_RITIRO';
    else if (/IN\\s+STAMPA|STAMPA\\s+IN\\s+CORSO/.test(hay)) status = 'IN_LAVORAZIONE';
    else if (/ORDINE\\s+RICEVUTO|RICEZIONE\\s+ORDINI|RICEVUTO/.test(hay)) status = 'RICEVUTO';
    if (!status) return;
    sheet.getRange(rowNumber,COPYSHOP_STATUS_COLUMN).setValue(status);
    sheet.getRange(rowNumber,COPYSHOP_LAST_MESSAGE_COLUMN).setValue(messageId);
    sheet.getRange(rowNumber,15).setValue(status);
    if (status !== 'RICEVUTO') sendStatusEmail_(sheet.getRange(rowNumber,1,1,COPYSHOP_LAST_MESSAGE_COLUMN).getValues()[0], status);
  }));
}

function ensureOrderEditTrigger_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const triggers = ScriptApp.getProjectTriggers();
  const exists = triggers.some(t => t.getHandlerFunction() === 'onOrderCheckboxEdit_');
  if (!exists) ScriptApp.newTrigger('onOrderCheckboxEdit_').forSpreadsheet(ss).onEdit().create();
}

function onOrderCheckboxEdit_(e) {
  try {
    if (!e || !e.range) return;
    const range = e.range;
    const sheet = range.getSheet();
    if (sheet.getName() !== SHEET_NAME) return;
    if (![14, PAYMENT_CONFIRMATION_COLUMN].includes(range.getColumn()) || range.getRow() < 2) return;
    if (String(e.value || '').toUpperCase() !== 'TRUE') return;

    const rowNumber = range.getRow();
    const values = sheet.getRange(rowNumber, 1, 1, PAYMENT_CONFIRMATION_COLUMN).getValues()[0];
    if (!values[1] || !values[6]) return;

    if (range.getColumn() === PAYMENT_CONFIRMATION_COLUMN) {
      const currentStatus = String(values[14] || 'NUOVO').toUpperCase();
      if (currentStatus === 'PAGATO') return;
      sheet.getRange(rowNumber, 15).setValue('PAGATO');
      sendPaymentConfirmationEmail_(values);
      sendCopyshopOrderEmail_(values);
      sheet.getRange(rowNumber,COPYSHOP_SENT_COLUMN).setValue(true);
      return;
    }
    const currentStatus = String(values[14] || 'NUOVO').toUpperCase();
    if (currentStatus === 'RICEVUTO') return;
    sheet.getRange(rowNumber, 15).setValue('RICEVUTO');
    sendStatusEmail_(values, 'RICEVUTO');
  } catch (err) {
    console.error(err);
  }
}


function sendPaymentConfirmationEmail_(row) {
  const name = String(row[2] || '');
  const orderId = String(row[1] || '');
  const total = Number(row[10] || 0).toFixed(2);
  const trackingToken = String(row[15] || '');
  const trackingUrl = SITE_URL + '?ordine=' + encodeURIComponent(orderId) + '&token=' + encodeURIComponent(trackingToken);
  const body = 'Gentile ' + name + ',\\n\\nconfermiamo che il pagamento dell\'ordine ' + orderId + ' è stato ricevuto e verificato.\\n\\nIl tuo ordine è confermato.\\n\\nTotale pagato: €' + total + '\\nID ordine: ' + orderId + '\\n\\nPuoi seguire lo stato del tuo ordine qui:\\n' + trackingUrl + '\\n\\nEdvinas Dragoni\\nLa Nostra Terra da Vicino\\n\\n© 2026 Edvinas Dragoni — La Nostra Terra Da Vicino. Tutti i diritti riservati.';
  if (row[6]) MailApp.sendEmail({to:String(row[6]),subject:'Pagamento ricevuto e ordine confermato ' + orderId + ' — La Nostra Terra da Vicino',body});
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const rowNumber = sheet.getDataRange().getValues().findIndex((r,i)=>i>0 && String(r[1])===orderId)+1;
    if (rowNumber > 1 && !sheet.getRange(rowNumber,COPYSHOP_SENT_COLUMN).getValue()) {
      sendCopyshopOrderEmail_(sheet.getRange(rowNumber,1,1,COPYSHOP_LAST_MESSAGE_COLUMN).getValues()[0]);
      sheet.getRange(rowNumber,COPYSHOP_SENT_COLUMN).setValue(true);
    }
  } catch (_) {}
}


function shipmentStatus_(orderId, email, token, callback) {
  return trackOrder_(orderId, email, token, callback);
}

function markFinalCopyshopBatch_(key) {
  const cfg = getSettings_();
  if (String(key || '') !== cfg.adminKey) throw new Error('Accesso non autorizzato.');
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Foglio Ordini non trovato.');
  const values = sheet.getDataRange().getValues();
  let updated = 0;
  values.forEach((row, i) => {
    if (i === 0 || !row[1] || !row[6]) return;
    const payment = String(row[14] || '').toUpperCase();
    const sent = row[COPYSHOP_SENT_COLUMN - 1] === true;
    if (payment === 'PAGATO' && !sent) {
      sheet.getRange(i + 1, COPYSHOP_SENT_COLUMN).setValue(true);
      sheet.getRange(i + 1, COPYSHOP_STATUS_COLUMN).setValue('IN_LAVORAZIONE');
      sheet.getRange(i + 1, 15).setValue('IN_LAVORAZIONE');
      sendStatusEmail_(sheet.getRange(i + 1, 1, 1, COPYSHOP_LAST_MESSAGE_COLUMN).getValues()[0], 'IN_LAVORAZIONE');
      updated++;
    }
  });
  return {ok:true,updated:updated,date:FINAL_COPYSHOP_DATE};
}

function confirmOrder_(orderId, token, email, callback) {
  orderId = String(orderId || '').trim();
  token = String(token || '').trim().toUpperCase();
  email = String(email || '').trim().toLowerCase();
  if (!orderId || !token) return json_({ok:false,error:'ID ordine e token obbligatori.'}, callback);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return json_({ok:false,error:'Ordini non disponibile.'}, callback);
  const values = sheet.getDataRange().getValues();
  const index = values.findIndex((r,i) => i > 0 && String(r[1]) === orderId && String(r[15] || '').toUpperCase() === token && (!email || String(r[6] || '').toLowerCase() === email));
  if (index < 1) return json_({ok:false,error:'Ordine non trovato.'}, callback);
  const row = values[index];
  return json_({ok:true,received:true,orderId:String(row[1]),email:String(row[6] || ''),status:String(row[14] || 'RICEVUTO'),total:Number(row[10] || 0)}, callback);
}
