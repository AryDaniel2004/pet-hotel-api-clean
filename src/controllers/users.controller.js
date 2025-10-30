import { hashPassword } from '../lib/auth.js';
import { User } from '../lib/databases.js';

export const list = async (_req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'full_name', 'dpi', 'phone', 'email', 'role', 'created_at', 'updated_at']
     
    });
    res.json(users);
  } catch (e) {
    console.error('[users.list]', e);
    res.status(500).json({ error: 'list users failed' });
  }
};

export const getUser = async (req, res) => {
  try {
    const row = await User.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(row);
  } catch (e) {
    console.error('[users.get]', e);
    res.status(500).json({ error: 'get user failed' });
  }
};

export const create = async (req, res) => {
  try {
    let { full_name, dpi, phone, email, password, role = 'CUSTOMER' } = req.body || {};

    if (role === 'CLIENT') role = 'CUSTOMER';
    if (!['ADMIN', 'CUSTOMER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      full_name,
      dpi,
      phone,
      email,
      password: passwordHash, 
      role,
      created_at: new Date(),
      updated_at: new Date()
    });

    return res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (e) {
    console.error('[users.create]', e);
    const msg = String(e?.message || '').toLowerCase();
    if (msg.includes('unique') && msg.includes('email')) {
      return res.status(409).json({ error: 'email already exists' });
    }
    if (msg.includes('null value') || msg.includes('not-null')) {
      return res.status(400).json({ error: 'missing required fields (full_name, dpi, phone, email, password)' });
    }
    return res.status(500).json({ error: 'create user failed' });
  }
};

export const updateUser = async (req, res) => {
  try {
    let { full_name, phone, dpi, role, email } = req.body || {};

 
    if (role !== undefined) {
      if (role === 'CLIENT') role = 'CUSTOMER';
      if (!['ADMIN', 'CUSTOMER'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
    }

    const [n] = await User.update(
      {
        ...(email      !== undefined ? { email } : {}),
        ...(full_name  !== undefined ? { full_name } : {}),
        ...(phone      !== undefined ? { phone } : {}),
        ...(dpi        !== undefined ? { dpi } : {}),
        ...(role       !== undefined ? { role } : {}),
        updated_at: new Date()
      },
      { where: { id: req.params.id } }
    );

    if (!n) return res.status(404).json({ error: 'not found' });

    const row = await User.findByPk(req.params.id);
    res.json(row);
  } catch (e) {
    console.error('[users.update]', e);
    if (String(e?.message || '').toLowerCase().includes('unique')) {
      return res.status(409).json({ error: 'email already exists' });
    }
    res.status(500).json({ error: 'update user failed' });
  }
};

export const deactivate = async (req, res) => {
  try {
    const [n] = await User.update(
      { is_active: false, updated_at: new Date() },
      { where: { id: req.params.id } }
    );
    if (!n) return res.status(404).json({ error: 'not found' });
    return res.json({ ok: true });
  } catch (e) {
    console.error('[users.deactivate]', e);
    res.status(500).json({ error: 'deactivate failed' });
  }
};

