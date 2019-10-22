import * as Yup from 'yup';
import Students from '../models/Students';

class StudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string()
        .min(3)
        .required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number()
        .min(1)
        .required(),
      weight: Yup.number()
        .min(1)
        .required(),
      height: Yup.string()
        .min(1)
        .required()
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { email } = req.body;
    const checkStudentExists = await Students.findOne({ where: { email } });

    if (checkStudentExists) {
      return res.status(400).json({ error: 'Student Already exists' });
    }
    const student = await Students.create(req.body);

    return res.json(student);
  }

  async update(req, res) {
    const { email } = req.body;
    const { id } = req.params;
    const student = await Students.findByPk(id);
    if (!student) {
      return res.status(401).json({ error: 'Student ID doen not exists!' });
    }
    if (email && email === student.email) {
      const studentExists = await Students.findOne({ where: { email } });
      if (studentExists) {
        return res.status(401).json({ error: 'Student Already exists!' });
      }
    }
    const { name, age, weight, height } = await student.update(req.body);
    return res.json({
      name,
      email,
      age,
      weight,
      height
    });
  }
}

export default new StudentController();