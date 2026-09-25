# LNTDV — SYSTEM REPORT

**Data:** 20 settembre 2026  
**Repository:** LNTDV/LNTDV  
**Dominio previsto:** https://lntdv.it/

## 1. Catalogo
- 25 fotografie `natura-01.jpg` … `natura-25.jpg`.
- 25 codici `LNTDV-001` … `LNTDV-025`.
- 25 script fotografici `assets/photo01.js` … `assets/photo25.js`.
- Formato **Pannello – Forex** presente.
- Nessuna rotazione CSS prevista sulle fotografie.

## 2. Menu
- `infoMenuButton` presente una sola volta.
- Menu secondario a tre linee.
- Nessun cerchio/cornice: il CSS imposta sfondo trasparente, bordo 0, raggio 0 e nessuna ombra.

## 3. Ordini
- `orderPanel` presente.
- `completePayment` presente.
- Riepilogo/conferma e tracking presenti.
- `order-system.js` e `order-system.css` presenti.
- Gmail e Apple Mail sono disponibili con indirizzo precompilato.

## 4. Google Apps Script
- `Code.gs`: `doPost`, `doGet`, Google Sheets e `MailApp.sendEmail`.
- Tracking token verificato nel codice.
- Il codice contiene `doGet?action=health` per una verifica esplicita del Web App.
- La verifica pubblica del deployment deve risultare HTTP 200 prima di considerare operativo il collegamento Google Sheets/MailApp.

## 5. Orientamento fotografie
Il sistema è stato riallineato: il workflow orario **non modifica più fisicamente le fotografie**. Controlla invece dimensioni, orientamento EXIF e presenza degli asset.

Il workflow dedicato di normalizzazione:
- installa esplicitamente Pillow;
- normalizza EXIF;
- verifica l'orientamento fisico atteso delle 25 fotografie;
- può essere avviato manualmente;
- si attiva anche quando cambiano le fotografie.

Questo evita che un controllo orario possa applicare nuovamente una rotazione 180° non desiderata.

## 6. Health check
Il controllo automatico verifica:
- 25 foto;
- 25 codici;
- 25 script fotografici;
- CSS/JS locali referenziati da `index.html`;
- menu;
- Forex;
- ordine;
- tracking;
- Gmail/Apple Mail;
- Apps Script;
- assenza di rotazioni CSS;
- `robots.txt`;
- `sitemap.xml`;
- sito pubblico `https://lntdv.it/`.

## 7. Pubblicazione
La pipeline GitHub Pages risulta presente. Le ultime modifiche hanno generato nuove esecuzioni GitHub Actions per il controllo del sistema.

La verifica web diretta da questo ambiente non ha restituito il contenuto di `https://lntdv.it/`; per questo il report distingue il controllo del repository dalla verifica visuale del sito live.

## 8. Ultime correzioni
- Hardening del workflow di health check.
- Eliminata la rotazione automatica distruttiva dal controllo orario.
- Workflow di orientamento reso ripetibile e verificabile.
- Installazione esplicita di Pillow.
- Verifica estesa a tutti gli script fotografici.

## Stato
**Repository:** aggiornato.  
**Controlli automatici:** attivati sulla nuova revisione.  
**Sito live:** la pipeline deve confermare il contenuto pubblico; la verifica visuale diretta da questo ambiente non è stata disponibile.
