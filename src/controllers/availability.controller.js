import { Sequelize } from 'sequelize';
import { db } from '../lib/databases.js';

export const getAvailability = async (req, res) => {
  try {
    const { start, end, room_type_id } = req.query;
    if (!start || !end) return res.status(400).json({ error: 'start and end required (YYYY-MM-DD)' });

    const rooms = await db.inv.query(
      `
      SELECT id, code, room_type_id
      FROM rooms
      ${room_type_id ? 'WHERE room_type_id = :room_type_id' : ''}
      ORDER BY code
      `,
      {
        replacements: { room_type_id },
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    if (!rooms.length) return res.json([]);

    const roomIds = rooms.map(r => r.id);

    const blocked = await db.inv.query(
      `
      SELECT DISTINCT room_id
      FROM room_blocks
      WHERE room_id IN (:roomIds)
        AND start < (:end::timestamptz)
        AND "end" > (:start::timestamptz)
      `,
      {
        replacements: { roomIds, start, end },
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    const blockedSet = new Set(blocked.map(b => b.room_id));

    const booked = await db.book.query(
      `
      SELECT DISTINCT bi.room_id
      FROM bookings b
      JOIN booking_items bi ON bi.booking_id = b.id
      WHERE bi.room_id IN (:roomIds)
        AND b.start_date < (:end::date)
        AND b.end_date   > (:start::date)
        AND (b.status IS NULL OR b.status <> 'CANCELLED')
      `,
      {
        replacements: { roomIds, start, end },
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    const bookedSet = new Set(booked.map(b => b.room_id));

    const available = rooms.filter(r => !blockedSet.has(r.id) && !bookedSet.has(r.id));
    res.json(available);
  } catch (e) {
    console.error('[availability][error]', e);
    res.status(500).json({ error: 'availability failed', detail: String(e?.message || e) });
  }
};
