import { Room, RoomType } from '../models/index.js';
import { db } from '../lib/databases.js';
import { Op, Sequelize } from 'sequelize';

export async function availability(req, res) {
  try {
    const { start, end, species = 'DOG', weight_kg } = req.query;
    if (!start || !end) return res.status(400).json({ ok:false, error: 'start and end are required (YYYY-MM-DD)' });

    const weight = weight_kg ? Number(weight_kg) : null;

    // 1) room_types compatibles por peso y especie
    const whereType = {};
    if (weight !== null) {
      whereType.min_weight = { [Op.lte]: weight };
      whereType.max_weight = { [Op.gte]: weight };
    }
    const speciesFilter = Sequelize.where(
      Sequelize.literal(`'${species}' = ANY("allowed_species")`),
      true
    );

    const types = await RoomType.findAll({
      where: whereType,
      having: undefined,
      raw: true
    });

    const typesFiltered = types.filter(t => Array.isArray(t.allowed_species) ? t.allowed_species.includes(species) : true);

    if (!typesFiltered.length) {
      return res.json({ dateRange:{ start, end }, filters:{ species, weight_kg: weight }, roomTypes: [] });
    }

    const typeIds = typesFiltered.map(t => t.id);
    const rooms = await Room.findAll({
      where: { room_type_id: { [Op.in]: typeIds }, status: 'ACTIVE' },
      attributes: ['id','code','room_type_id'],
      raw: true
    });
    if (!rooms.length) {
      return res.json({ dateRange:{ start, end }, filters:{ species, weight_kg: weight }, roomTypes: [] });
    }

    const occupied = await db.book.query(
      `
      SELECT DISTINCT bi.room_id
      FROM booking_items bi
      JOIN bookings b ON b.id = bi.booking_id
      WHERE b.status IN ('PENDING','CONFIRMED')
        AND NOT (b.end_date <= :start::date OR b.start_date >= :end::date)
        AND bi.room_id IN (:roomIds)
      `,
      {
        replacements: {
          start, end,
          roomIds: rooms.map(r => r.id)
        },
        type: db.book.QueryTypes.SELECT
      }
    );
    const occupiedSet = new Set(occupied.map(o => o.room_id));

    const byType = new Map(); // id -> { ... }
    for (const t of typesFiltered) {
      byType.set(t.id, { roomTypeId: t.id, name: t.name, baseRate: t.base_rate, rooms: [], totalFree: 0 });
    }
    for (const r of rooms) {
      const available = !occupiedSet.has(r.id);
      const g = byType.get(r.room_type_id);
      if (g) {
        g.rooms.push({ roomId: r.id, code: r.code, available });
        if (available) g.totalFree += 1;
      }
    }
    const result = Array.from(byType.values()).filter(g => g.rooms.length);

    res.json({
      dateRange: { start, end },
      filters: { species, weight_kg: weight },
      roomTypes: result
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, error: e.message });
  }
}
