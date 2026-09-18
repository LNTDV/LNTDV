const SHEET_NAME = 'Ordini';
const SETTINGS_SHEET = 'Impostazioni';
const OWNER_EMAIL = 'info.lanostraterradavicino@gmail.com';
const SITE_URL = 'https://lntdv.it/';

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const orders = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  const settings = ss.getSheetByName(SETTINGS_SHEET) || ss.insertSheet(SETTINGS_SHEET);
  ensureHeader_(orders);
  ensureSettings_(settings);
  formatOrders_(orders);
  formatSettings_(settings);
}

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.parameter && e.parameter.payload) || '{}');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    ensureHeader_(sheet);
    const cfg = getSettings_();
    const customer = payload.customer || {};
    const items = Array.isArray(payload.items) ? payload.items : [];
    if (!items.length) throw new Error('Nessuna fotografia selezionata.');
    if (!customer.name || !customer.email) throw new Error('Nome ed email sono obbligatori.');
    const deliveryType = String(payload.deliveryType || payload.pickup || 'Ritiro');
    const shipping = deliveryType.toLowerCase().includes('sped') ? Number(cfg.shippingPrice || 0) : 0;
    const subtotal = Number(payload.total || 0);
    const total = subtotal + shipping;
    const suppliedOrderId = String(payload.orderId || '').trim();
    const orderId = /^LNTDV-[A-Z0-9-]{6,80}$/.test(suppliedOrderId) ? suppliedOrderId : ('LNTDV-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '-' + Utilities.getUuid().replace(/-/g,'').slice(0,8).toUpperCase());
    const paymentMethod = String(payload.paymentMethod || '');
    const paymentStatus = String(payload.paymentStatus || 'RICEVUTO').toUpperCase();
    const trackingToken = Utilities.getUuid().replace(/-/g,'').toUpperCase();
    const trackingUrl = SITE_URL + '?ordine=' + encodeURIComponent(orderId) + '&token=' + encodeURIComponent(trackingToken);
    const itemText = items.map((x, i) => `${i + 1}. ${x.title || 'Fotografia'} — ${x.orientation || 'Orientamento non specificato'} — ${x.format || 'Formato non specificato'} — €${Number(x.price || 0).toFixed(2)}`).join('\n');
    const row = sheet.getLastRow() + 1;
    sheet.appendRow([new Date(), orderId, customer.name || '', customer.street || '', customer.zip || '', customer.city || '', customer.email || '', itemText, subtotal, shipping, total, deliveryType, customer.note || '', false, paymentStatus === 'PAGATO' ? 'PAGATO' : 'RICEVUTO', trackingToken]);
    sheet.getRange(row, 14).insertCheckboxes().setValue(false);
    const deliveryText = deliveryType.toLowerCase().includes('sped') ? `Spedizione: €${shipping.toFixed(2)}` : `Ritiro: ${deliveryType}`;
    const promotionText = payload.promotion ? `Promozione applicata: ${payload.promotion}\n` : '';
    const body = `Gentile ${customer.name},\n\nabbiamo ricevuto la tua richiesta d'ordine.\n\nID ordine: ${orderId}\n\n${itemText}\n\nSubtotale: €${subtotal.toFixed(2)}\n${deliveryText}\nTotale: €${total.toFixed(2)}\n${promotionText}Metodo di pagamento: ${paymentMethod || 'non specificato'}\n\nQuesta email conferma la ricezione della richiesta. Il pagamento viene considerato confermato solo quando il sistema restituisce esplicitamente l'esito PAGATO.\n\nSegui il tuo ordine in qualsiasi momento:\n${trackingUrl}\n\nEdvinas Dragoni\nLa Nostra Terra da Vicino`;
    MailApp.sendEmail({to: customer.email, subject: `Conferma ordine ${orderId} — La Nostra Terra da Vicino`, body: body});
    if (paymentStatus === 'PAGATO') {
      const paymentBody = `Gentile ${customer.name},\n\nconfermiamo che il pagamento dell'ordine ${orderId} risulta PAGATO.\n\n${itemText}\n\nTotale pagato: €${total.toFixed(2)}\nMetodo di pagamento: ${paymentMethod || 'non specificato'}\n\nConserva questa email come conferma del pagamento.\n\nEdvinas Dragoni\nLa Nostra Terra da Vicino`;
      MailApp.sendEmail({to: customer.email, subject: `Pagamento confermato ${orderId} — La Nostra Terra da Vicino`, body: paymentBody});
    }
    const adminUrl = ScriptApp.getService().getUrl() + '?action=order&orderId=' + encodeURIComponent(orderId) + '&key=' + encodeURIComponent(cfg.adminKey);
    MailApp.sendEmail({to: OWNER_EMAIL, subject: `Nuovo ordine ${orderId}${paymentStatus === 'PAGATO' ? ' — PAGATO' : ''}`, body: body + (paymentStatus === 'PAGATO' ? '\n\nPAGAMENTO CONFERMATO DAL SISTEMA.' : '') + `\n\nGESTIONE ORDINE:\n${adminUrl}`});
    return json_({ok:true, orderId:orderId, trackingToken:trackingToken, paymentStatus:paymentStatus, subtotal:subtotal, shipping:shipping, total:total});
  } catch (err) {
    return json_({ok:false, error:String(err)});
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'config') { const cfg = getSettings_(); return json_({ok:true, shippingPrice:Number(cfg.shippingPrice || 0), pickupText:cfg.pickupText}); }
  if (p.action === 'order') return orderWindow_(p.orderId || '', p.key || '');
  if (p.action === 'xpayVerify') return verifyXpayOrder_(p.orderId || '', p.key || '');
  if (p.action === 'track') return trackOrder_(p.orderId || '', p.email || '', p.token || '', p.callback || '');
  if (p.action === 'shipment') return shipmentStatus_(p.orderId || '', p.email || '', p.token || '', p.callback || '');
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
  const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gestione ${safe(orderId)}</title><style>body{font-family:Arial,sans-serif;background:#f3eadc;color:#3d281d;margin:0;padding:24px}.box{max-width:760px;margin:auto;background:#fffaf3;border:1px solid #d8c5ae;border-radius:16px;padding:24px;box-shadow:0 8px 30px #0001}h1{margin-top:0;color:#5a3b2b}.row{padding:10px 0;border-bottom:1px solid #eadbc9}.status{font-size:18px;font-weight:700;margin:22px 0}button{background:#5a3b2b;color:#fff;border:0;border-radius:9px;padding:12px 18px;font-size:16px;cursor:pointer;margin-right:8px;margin-top:8px}</style></head><body><div class="box"><h1>Gestione ordine ${safe(orderId)}</h1><div class="row"><b>Cliente:</b> ${safe(row[2])}</div><div class="row"><b>Email:</b> ${safe(row[6])}</div><div class="row"><b>Indirizzo:</b> ${safe(row[3])}, ${safe(row[4])} ${safe(row[5])}</div><div class="row"><b>Ordine:</b><br>${orderHtml}</div><div class="row"><b>Subtotale:</b> €${Number(row[8]||0).toFixed(2)}</div><div class="row"><b>Spedizione:</b> €${Number(row[9]||0).toFixed(2)}</div><div class="row"><b>Totale:</b> €${Number(row[10]||0).toFixed(2)}</div><div class="row"><b>Modalità:</b> ${safe(row[11])}</div><div class="row"><b>Stato pagamento:</b> ${safe(status)}</div><div class="row"><b>Note:</b> ${safe(row[12])}</div><div class="status">Stato: ${safe(status)}</div><button onclick="setStatus('RICEVUTO')">✓ Ricevuto</button><button onclick="setStatus('IN_LAVORAZIONE')">⚙ In lavorazione</button><button onclick="setStatus('PRONTO_AL_RITIRO')">✓ Pronto al ritiro</button><button onclick="setStatus('CONSEGNATO')">✓ Consegnato</button><button onclick="setStatus('ANNULLATO')">× Annulla</button></div><script>function setStatus(v){google.script.run.withSuccessHandler(function(){location.reload()}).withFailureHandler(function(e){alert(e.message||e)}).setOrderStatus('${safe(orderId)}',v)}</script></body></html>`;
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function setOrderReceived(orderId, value) {
  return setOrderStatus_(orderId, value ? 'RICEVUTO' : 'NUOVO');
}

function setOrderStatus(orderId, status) {
  return setOrderStatus_(orderId, status);
}

function setOrderStatus_(orderId, status) {
  const allowed = ['RICEVUTO','IN_LAVORAZIONE','PRONTO_AL_RITIRO','CONSEGNATO','ANNULLATO','NUOVO'];
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
    ANNULLATO: 'Il tuo ordine è stato annullato. Per informazioni puoi rispondere a questa email.',
    NUOVO: 'Il tuo ordine è stato registrato.'
  }[status];
  const trackingToken = String(row[15] || '');
  const trackingUrl = SITE_URL + '?ordine=' + encodeURIComponent(orderId) + '&token=' + encodeURIComponent(trackingToken);
  const pickupNote = status === 'PRONTO_AL_RITIRO' ? `\n\nRITIRO:\n${pickup}\n\nQuando vieni a ritirare, porta con te l'ID ordine ${orderId}.` : '';
  const body = `Gentile ${name},

${message}${pickupNote}

ID ordine: ${orderId}

${itemText}

Totale ordine: €${total}
Modalità: ${pickup}

Stato: ${labels[status]}

Segui il tuo ordine:
${trackingUrl}

Edvinas Dragoni
La Nostra Terra da Vicino`;
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
  return {shippingPrice:Number(out.shippingPrice || 0), pickupText:String(out.pickupText || 'Ritiro da concordare a Milano'), adminKey:String(out.adminKey || 'CAMBIA-QUESTA-CHIAVE'), xpayApiKey:String(out.xpayApiKey || ''), xpayEnvironment:String(out.xpayEnvironment || 'TEST').toUpperCase()};
}

function ensureHeader_(sheet) {
  const headers = ['Data','ID ordine','Nome','Via','CAP','Città','Email cliente','Ordine','Subtotale','Spedizione','Totale','Modalità consegna','Note','Ricezione ordine','Stato','Token tracking'];
  if (sheet.getLastRow() === 0) sheet.appendRow(headers); else sheet.getRange(1,1,1,headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
}

function ensureSettings_(sheet) {
  if (sheet.getLastRow() === 0) { sheet.getRange(1,1,6,2).setValues([['Parametro','Valore'],['shippingPrice',10],['pickupText','Ritiro da concordare a Milano'],['adminKey','CAMBIA-QUESTA-CHIAVE'],['xpayApiKey',''],['xpayEnvironment','TEST']]); sheet.setFrozenRows(1); } else { const data=sheet.getDataRange().getValues().map(r=>String(r[0]||'')); if(!data.includes('xpayApiKey')) sheet.appendRow(['xpayApiKey','']); if(!data.includes('xpayEnvironment')) sheet.appendRow(['xpayEnvironment','TEST']); }
}

function formatOrders_(sheet) { sheet.getRange(1,1,1,16).setFontWeight('bold'); sheet.autoResizeColumns(1,16); if (sheet.getLastRow() > 1) sheet.getRange(2,14,sheet.getLastRow()-1,1).insertCheckboxes(); }
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
    labels:{RICEVUTO:'Ricevuto',IN_LAVORAZIONE:'In lavorazione',PRONTO_AL_RITIRO:'Pronto al ritiro',CONSEGNATO:'Consegnato'}
  }, callback);
}


/**
 * Verifica server-side dello stato di un ordine su Nexi XPay.
 * La X-Api-Key resta nel foglio Impostazioni di Apps Script e non viene mai
 * esposta al browser del cliente.
 *
 * Richiesta protetta:
 *   ?action=xpayVerify&orderId=LNTDV-...&key=<adminKey>
 */
function verifyXpayOrder_(orderId, key) {
  const cfg = getSettings_();
  orderId = String(orderId || '').trim();
  key = String(key || '').trim();
  if (!orderId || !key || key !== cfg.adminKey) {
    return json_({ok:false, error:'Accesso non autorizzato.'});
  }
  if (!cfg.xpayApiKey) {
    return json_({ok:false, error:'XPay API Key non configurata nelle Impostazioni.'});
  }
  if (!/^LNTDV-[A-Z0-9-]{6,80}$/.test(orderId)) {
    return json_({ok:false, error:'ID ordine non valido.'});
  }

  const endpoint = cfg.xpayEnvironment === 'PROD'
    ? 'https://xpay.nexigroup.com/api/phoenix-0.0/psp/api/v1/orders/'
    : 'https://xpaysandbox.nexigroup.com/api/phoenix-0.0/psp/api/v1/orders/';

  const correlationId = Utilities.getUuid();
  const response = UrlFetchApp.fetch(endpoint + encodeURIComponent(orderId), {
    method:'get',
    muteHttpExceptions:true,
    headers:{
      'X-Api-Key': cfg.xpayApiKey,
      'Correlation-Id': correlationId
    }
  });

  const code = response.getResponseCode();
  const raw = response.getContentText();
  let data = {};
  try { data = JSON.parse(raw || '{}'); } catch (_) {}

  if (code < 200 || code >= 300) {
    return json_({ok:false, httpStatus:code, correlationId:correlationId, error:data.message || data.description || raw || 'Errore XPay.'});
  }

  const order = data.order || {};
  const operations = Array.isArray(data.operations) ? data.operations : [];
  const successful = operations.filter(op =>
    ['EXECUTED','AUTHORIZED'].includes(String(op.operationResult || '').toUpperCase()) &&
    ['AUTHORIZATION','CAPTURE'].includes(String(op.operationType || '').toUpperCase())
  );
  const paid = successful.length > 0;

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Foglio Ordini non trovato.');
  const values = sheet.getDataRange().getValues();
  const index = values.findIndex((r,i) => i > 0 && String(r[1]) === orderId);
  if (index < 1) return json_({ok:false, error:'Ordine LNTDV non trovato.', xpay:data});

  const row = values[index];
  const expectedTotal = Number(row[10] || 0);
  const xpayAmount = Number(order.amount || 0) / 100;
  const amountOk = !isNaN(xpayAmount) && Math.abs(xpayAmount - expectedTotal) < 0.01;

  if (paid && amountOk) {
    const current = String(row[14] || '').toUpperCase();
    if (current !== 'PAGATO') {
      sheet.getRange(index + 1, 15).setValue('PAGATO');
      sheet.getRange(index + 1, 14).setValue(true);
      const customerEmail = String(row[6] || '');
      if (customerEmail) {
        const paymentCircuit = successful[successful.length - 1].paymentCircuit || 'XPay';
        const body = 'Gentile ' + String(row[2] || '') + ',\n\nconfermiamo che il pagamento dell\'ordine ' + orderId + ' risulta confermato da Nexi XPay.\n\nTotale pagato: €' + expectedTotal.toFixed(2) + '\nMetodo: ' + paymentCircuit + '\n\nEdvinas Dragoni\nLa Nostra Terra da Vicino';
        MailApp.sendEmail({to:customerEmail, subject:'Pagamento confermato ' + orderId + ' — La Nostra Terra da Vicino', body:body});
      }
    }
  }

  return json_({
    ok:true,
    orderId:orderId,
    paid:paid && amountOk,
    amountOk:amountOk,
    expectedAmount:expectedTotal,
    xpayAmount:xpayAmount,
    operationResult:successful.length ? successful[successful.length - 1].operationResult : null,
    paymentCircuit:successful.length ? (successful[successful.length - 1].paymentCircuit || null) : null,
    correlationId:correlationId
  });
}


function shipmentStatus_(orderId, email, token, callback) {
  orderId = String(orderId || '').trim();
  email = String(email || '').trim().toLowerCase();
  token = String(token || '').trim().toUpperCase();
  if (!orderId || !token) return json_({ok:false,error:'ID ordine e token obbligatori.'}, callback);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return json_({ok:false,error:'Ordini non disponibile.'}, callback);
  const values = sheet.getDataRange().getValues();
  const index = values.findIndex((r,i) => i > 0 && String(r[1]) === orderId && String(r[15] || '').toUpperCase() === token && (!email || String(r[6] || '').toLowerCase() === email));
  if (index < 1) return json_({ok:false,error:'Ordine non trovato.'}, callback);
  const row = values[index];
  const status = String(row[14] || 'NUOVO').toUpperCase();
  const shipmentTracking = String(row[16] || '').trim();
  const carrier = String(row[17] || '').trim();
  const shipmentStatus = String(row[18] || '').trim();
  const shipmentUrl = String(row[19] || '').trim();
  return json_({ok:true,orderId:orderId,deliveryType:String(row[11] || ''),status:status,trackingNumber:shipmentTracking,carrier:carrier,shipmentStatus:shipmentStatus,trackingUrl:shipmentUrl}, callback);
}
