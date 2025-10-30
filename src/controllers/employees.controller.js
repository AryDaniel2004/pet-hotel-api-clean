import Employee from '../models/auth/Employee.js';

export async function createEmployee(req, res) {
  try {
    const data = req.body;
    const employee = await Employee.create(data);
    res.status(201).json({ ok: true, employee });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: error.message });
  }
}

export async function getAllEmployees(req, res) {
  try {
    const employees = await Employee.findAll();
    res.json({ ok: true, employees });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

export async function getEmployeeById(req, res) {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);
    if (!employee)
      return res.status(404).json({ ok: false, error: 'Empleado no encontrado' });

    res.json({ ok: true, employee });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

export async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    const employee = await Employee.findByPk(id);

    if (!employee)
      return res.status(404).json({ ok: false, error: 'Empleado no encontrado' });

    await employee.update(data);
    res.json({ ok: true, employee });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

export async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);

    if (!employee)
      return res.status(404).json({ ok: false, error: 'Empleado no encontrado' });

    await employee.destroy();
    res.json({ ok: true, message: 'Empleado eliminado' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}
