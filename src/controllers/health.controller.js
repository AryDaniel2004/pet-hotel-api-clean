import { pingAll } from '../lib/databases.js';
export async function health(_req, res) {
  try {
    await pingAll();
    res.json({ ok: true, dbs: ['auth','pets','inv','book'], ts: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
