import app from '../src/app.js';

function collectRoutes(stack, base='') {
  const out = [];
  for (const layer of stack) {
    if (layer.route?.path) {
      const path = base + layer.route.path;
      const methods = Object.keys(layer.route.methods)
        .filter(m => layer.route.methods[m])
        .map(m => m.toUpperCase());
      out.push({ methods, path });
    } else if (layer.name === 'router' && layer.handle?.stack) {
      const re = layer.regexp;
      let prefix = '';
      if (re?.fast_slash) prefix = '';
      else if (re?.source) {
        prefix = re.source
          .replace('^\\', '')
          .replace('\\/?(?=\\/|$)', '')
          .replace('$/i', '')
          .replace('$/', '')
          .replace(/\\\//g,'/');
      }
      out.push(...collectRoutes(layer.handle.stack, base + (prefix || '')));
    }
  }
  return out;
}

const routes = collectRoutes(app._router?.stack || []);
routes.sort((a,b)=> (a.path||'').localeCompare(b.path||'') || (a.methods[0]||'').localeCompare(b.methods[0]||''));
console.log(JSON.stringify({ count: routes.length, routes }, null, 2));
process.exit(0);