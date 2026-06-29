export function printRecibo(servicio) {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${servicio.numero_recibo}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Courier New', Courier, monospace;
    font-size: 11px;
    width: 280px;
    margin: 0 auto;
    padding: 18px 12px;
    color: #000;
    background: #fff;
  }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .dots { font-size: 9px; letter-spacing: 0.5px; margin: 5px 0; text-align: center; overflow: hidden; }
  .row { display: flex; justify-content: space-between; margin: 3px 0; }
  .brand { font-size: 15px; font-weight: bold; letter-spacing: 2px; margin-bottom: 4px; }
  .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; margin: 4px 0; }
  p { margin: 2px 0; }
  @media print {
    body { width: 100%; }
    @page { size: 80mm auto; margin: 3mm; }
  }
</style>
</head>
<body>
<div class="center">
  <div class="brand">BARBERSHOP ARIAS</div>
  <p>RUC: 10482015218</p>
  <p>${servicio.sede_direccion || ''}</p>
  <p>Lima - Per&uacute;</p>
  <p>WhatsApp: 986489429</p>
</div>
<div class="dots">${'::::::::::::::::::::::::::::::::'}</div>
<div class="center">
  <div class="bold">RECIBO DE SERVICIO</div>
  <p>N&deg;: ${servicio.numero_recibo}</p>
  <p>F. PAGO: ${servicio.medio_pago || 'CONTADO'}</p>
  <p>${servicio.fecha}&nbsp;&nbsp;${servicio.hora}</p>
</div>
<div class="dots">${'::::::::::::::::::::::::::::::::'}</div>
<p>Cliente: ${servicio.cliente_nombre}</p>
<div class="dots">${'::::::::::::::::::::::::::::::::'}</div>
<div class="row bold"><span>DESCRIPCI&Oacute;N</span><span>P. TOT.</span></div>
<div class="dots">${'::::::::::::::::::::::::::::::::'}</div>
<div class="row">
  <span>${servicio.servicio_nombre}</span>
  <span>S/ ${Number(servicio.servicio_precio).toFixed(2)}</span>
</div>
${servicio.producto_vendido ? `<div class="row">
  <span>Prod: ${servicio.producto_vendido}</span>
  <span>${servicio.precio_producto ? 'S/ ' + Number(servicio.precio_producto).toFixed(2) : '&mdash;'}</span>
</div>` : ''}
<div class="dots">${'::::::::::::::::::::::::::::::::'}</div>
<div class="total-row"><span>TOTAL</span><span>S/ ${Number(servicio.total).toFixed(2)}</span></div>
<div class="dots">${'::::::::::::::::::::::::::::::::'}</div>
<p>Sede: ${servicio.sede_nombre}</p>
<p>Atendido por: ${servicio.barbero_nombre}</p>
<div class="dots">${'::::::::::::::::::::::::::::::::'}</div>
<div class="center"><p>Gracias por tu visita</p></div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=440,height=720,scrollbars=yes');
  if (!win) { alert('Permite ventanas emergentes para imprimir el recibo.'); return; }
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 600);
}
