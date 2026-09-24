/**
 * LNTDV — COMPATIBILITY WRAPPER
 *
 * La conferma pagamento è gestita ESCLUSIVAMENTE da
 * LNTDV-DEPLOY-24-09-2026.gs / lntdvPaymentFinal24092026_.
 * Questo file non installa più un proprio trigger e non invia email.
 */
function installPaymentTokenConfirmation() {
  if (typeof lntdvInstallFinal24092026 !== 'function') {
    throw new Error('Manca LNTDV-DEPLOY-24-09-2026.gs.');
  }
  return lntdvInstallFinal24092026();
}

function testPaymentTokenConfirmationSetup() {
  if (typeof lntdvHealthFinal24092026 !== 'function') {
    throw new Error('Manca LNTDV-DEPLOY-24-09-2026.gs.');
  }
  return lntdvHealthFinal24092026();
}
