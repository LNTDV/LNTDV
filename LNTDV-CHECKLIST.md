# LNTDV — Protocollo di controllo

Questo repository segue un controllo automatico dopo ogni modifica pubblicata.

## Controlli obbligatori

1. **HTML**
   - un solo `orderPanel`
   - un solo `orderBar`
   - un solo `completePayment`
   - un solo `trackingSection`
   - nessun riferimento a runtime legacy eliminati
   - un solo `site-generated.css`

2. **Fotografie**
   - LNTDV-001 → LNTDV-025 presenti
   - 25 file JPG validi in `images/`
   - nessun Base64 inline
   - nessuna rotazione CSS forzata
   - riferimenti alle immagini coerenti

3. **JavaScript / CSS**
   - ogni asset locale richiamato da `index.html` deve esistere
   - `order-system.js` deve superare `node --check`
   - nessun doppio runtime per checkout/performance

4. **Ordini**
   - selezione fotografia
   - selezione formato
   - riepilogo ordine
   - invio ordine
   - tracking
   - collegamento al backend Apps Script

5. **Pubblicazione**
   - GitHub Pages deve ricevere solo gli asset pubblici
   - i file Apps Script di gestione ordini non vengono inclusi nel pacchetto pubblico
   - dopo ogni modifica viene eseguito il controllo automatico

## Regola operativa

Una modifica piccola viene controllata almeno nel suo perimetro.  
Una modifica HTML/CSS/JS o una modifica al flusso ordini attiva il controllo completo.

Non modificare contemporaneamente più parti del sistema senza eseguire nuovamente la verifica.
