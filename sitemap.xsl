<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="it">
      <head>
        <meta charset="UTF-8"/>
        <title>Sitemap — LNTDV</title>
        <style>
          body{font-family:Arial,sans-serif;max-width:1000px;margin:40px auto;padding:0 20px;background:#f4eee7;color:#4b3327}
          h1{font-family:Georgia,serif}
          p{line-height:1.5}
          table{width:100%;border-collapse:collapse;background:#fff}
          th,td{padding:10px;text-align:left;border-bottom:1px solid #ddd}
          a{color:#5a3b2b}
        </style>
      </head>
      <body>
        <h1>Sitemap LNTDV</h1>
        <p>Elenco delle pagine pubbliche del progetto LNTDV — La Nostra Terra Da Vicino.</p>
        <table>
          <tr><th>Pagina</th><th>Ultima modifica</th></tr>
          <xsl:for-each select="s:urlset/s:url">
            <tr>
              <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
              <td><xsl:value-of select="s:lastmod"/></td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>