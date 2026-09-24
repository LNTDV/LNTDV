/**
 * LNTDV — COMPATIBILITY INSTALLER
 *
 * Il flusso pagamento canonico è in:
 * LNTDV-DEPLOY-24-09-2026.gs
 *
 * NON crea più un secondo handler di pagamento.
 * Usare questa funzione solo come scorciatoia di installazione.
 */
function lntdvFinalSetup() {
  if (typeof lntdvInstallFinal24092026 !== 'function') {
    throw new Error('Manca LNTDV-DEPLOY-24-09-2026.gs. Copia prima il file canonico nel progetto Apps Script.');
  }
  return lntdvInstallFinal24092026();
}

function lntdvFinalHealthCheck() {
  if (typeof lntdvHealthFinal24092026 !== 'function') {
    throw new Error('Manca LNTDV-DEPLOY-24-09-2026.gs.');
  }
  return lntdvHealthFinal24092026();
}
