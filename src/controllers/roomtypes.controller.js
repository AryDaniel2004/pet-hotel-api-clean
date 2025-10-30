import { db } from '../lib/databases.js';

export async function listRoomTypes(req, res) {
  try {
    const rows = await db.inv.query(
      `SELECT id, name, min_weight, max_weight, allowed_species, base_rate
       FROM room_types
       ORDER BY base_rate, name`,
      { type: db.inv.QueryTypes.SELECT }
    );
    res.json({ ok:true, room_types: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, error:e.message });
  }
}
