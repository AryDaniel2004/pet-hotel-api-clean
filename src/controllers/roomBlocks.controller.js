import { RoomBlock } from '../lib/databases.js';

export const createBlock = async (req, res) => {
  try {
    const { id: room_id } = req.params;
    const { start, end, reason } = req.body || {};
    if (!room_id || !start || !end) return res.status(400).json({ error: 'room_id, start, end required' });
    const block = await RoomBlock.create({ room_id, start, end, reason });
    res.status(201).json(block);
  } catch (e) {
    console.error('[createBlock]', e);
    res.status(500).json({ error: 'create block failed' });
  }
};

export const listBlocks = async (req, res) => {
  try {
    const { id: room_id } = req.params;
    const items = await RoomBlock.findAll({ where: { room_id }, order: [['start','ASC']] });
    res.json(items);
  } catch (e) {
    console.error('[listBlocks]', e);
    res.status(500).json({ error: 'list blocks failed' });
  }
};

export const removeBlock = async (req, res) => {
  try {
    const { blockId } = req.params;
    const n = await RoomBlock.destroy({ where: { id: blockId } });
    if (!n) return res.status(404).json({ error: 'block not found' });
    res.json({ ok: true });
  } catch (e) {
    console.error('[removeBlock]', e);
    res.status(500).json({ error: 'remove block failed' });
  }
};
