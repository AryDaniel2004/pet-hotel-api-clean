import { Op } from 'sequelize';
import { Service } from '../lib/databases.js';

export const createService = async (req, res) => {
  try {
    const { name, description, price_type, price } = req.body || {};
    const row = await Service.create({ name, description, price_type, price, created_at:new Date(), updated_at:new Date() });
    res.status(201).json(row);
  } catch (e) {
    console.error('[createService]', e);
    res.status(500).json({ error: 'create service failed' });
  }
};

export const listServices = async (req, res) => {
  try {
    const { q = '', limit = 50, offset = 0 } = req.query;
    const where = q ? { name: { [Op.iLike]: `%${q}%` } } : undefined;
    const rows = await Service.findAll({ where, order: [['name','ASC']], limit:Number(limit), offset:Number(offset) });
    res.json(rows);
  } catch (e) {
    console.error('[listServices]', e);
    res.status(500).json({ error: 'list services failed' });
  }
};

export const getService = async (req, res) => {
  try {
    const row = await Service.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(row);
  } catch (e) {
    console.error('[getService]', e);
    res.status(500).json({ error: 'get service failed' });
  }
};

export const updateService = async (req, res) => {
  try {
    const { name, description, price_type, price } = req.body || {};
    const [n] = await Service.update(
      { name, description, price_type, price, updated_at:new Date() },
      { where: { id: req.params.id } }
    );
    if (!n) return res.status(404).json({ error: 'not found' });
    const row = await Service.findByPk(req.params.id);
    res.json(row);
  } catch (e) {
    console.error('[updateService]', e);
    res.status(500).json({ error: 'update service failed' });
  }
};

export const deleteService = async (req, res) => {
  try {
    const n = await Service.destroy({ where: { id: req.params.id } });
    if (!n) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (e) {
    console.error('[deleteService]', e);
    res.status(500).json({ error: 'delete service failed' });
  }
};
