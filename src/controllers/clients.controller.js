import { Op } from 'sequelize';
import { Client } from '../lib/databases.js'; 

const devErr = (e) => e?.original?.detail || e?.original?.message || e?.message || 'unknown';

export async function createClient(req, res) {
  try {
    const { user_id, full_name, phone, address } = req.body || {};
    if (!user_id || !full_name) {
      return res.status(400).json({ ok: false, error: 'user_id y full_name son requeridos' });
    }
    const row = await Client.create({
      user_id,
      full_name,
      phone: phone ?? null,
      address: address ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return res.status(201).json({ ok: true, client: row });
  } catch (error) {
    console.error('[clients.create]', error);
    return res.status(500).json({ ok: false, error: 'create client failed', detail: devErr(error) });
  }
}

export async function listClients(req, res) {
  try {
    const { q = '', limit = 20, offset = 0 } = req.query;
    const rows = await Client.findAll({
      where: q ? { full_name: { [Op.iLike]: `%${q}%` } } : undefined,
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset: Number(offset),
    });
    return res.json({ ok: true, clients: rows });
  } catch (error) {
    console.error('[clients.list]', error);
    return res.status(500).json({ ok: false, error: 'list clients failed', detail: devErr(error) });
  }
}

export async function getClient(req, res) {
  try {
    const row = await Client.findByPk(req.params.id);
    if (!row) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });
    return res.json({ ok: true, client: row });
  } catch (error) {
    console.error('[clients.get]', error);
    return res.status(500).json({ ok: false, error: 'get client failed', detail: devErr(error) });
  }
}

export async function updateClient(req, res) {
  try {
    const { full_name, phone, address } = req.body || {};
    const [n] = await Client.update(
      {
        ...(full_name !== undefined ? { full_name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(address !== undefined ? { address } : {}),
        updated_at: new Date(),
      },
      { where: { id: req.params.id } }
    );
    if (!n) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });

    const row = await Client.findByPk(req.params.id);
    return res.json({ ok: true, client: row });
  } catch (error) {
    console.error('[clients.update]', error);
    return res.status(500).json({ ok: false, error: 'update client failed', detail: devErr(error) });
  }
}

export async function deleteClient(req, res) {
  try {
    const n = await Client.destroy({ where: { id: req.params.id } });
    if (!n) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });
    return res.status(204).send();
  } catch (error) {
    console.error('[clients.delete]', error);
    return res.status(500).json({ ok: false, error: 'delete client failed', detail: devErr(error) });
  }
}
