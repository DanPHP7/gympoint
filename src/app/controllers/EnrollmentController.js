import * as Yup from 'yup';
import { addMonths, parseISO, isBefore, startOfHour } from 'date-fns';
import Enrollments from '../models/Enrollments';
import Students from '../models/Students';
import Plans from '../models/Plans';
import User from '../models/User';
import Queue from '../../lib/Queue';
import WellcomeMail from '../jobs/WellcomeMail';

class EnrollmentController {
  async index(req, res) {
    const { gym_id } = await User.findOne({ where: { id: req.userId } });
    const enrollments = await Enrollments.findAll({
      attributes: ['id', 'start_date', 'end_date', 'price', 'active'],
      include: [
        {
          model: Students,
          as: 'student',
          attributes: ['id'],
          where: { gym_id }
        }
      ]
    });
    return res.json(enrollments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .integer()
        .strict()
        .required(),
      plan_id: Yup.number()
        .integer()
        .strict()
        .required(),
      start_date: Yup.date().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails!' });
    }
    const { student_id, plan_id, start_date } = req.body;

    const student = await Students.findByPk(student_id);

    if (!student) {
      return res.status(404).json({ error: 'Student not found!' });
    }
    const enrollmentExists = await Enrollments.findOne({
      where: { student_id }
    });
    if (enrollmentExists) {
      return res
        .status(400)
        .json({ error: 'This Student is already enrolled' });
    }
    const plan = await Plans.findByPk(plan_id);

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found!!' });
    }

    if (req.gym_id !== student.gym_id) {
      return res.status(401).json({ error: 'You cannot enroll this student' });
    }

    const hourStart = startOfHour(parseISO(start_date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permited' });
    }

    const end_date = addMonths(parseISO(start_date), plan.duration);

    const price = plan.price * plan.duration;

    const enrollment = await Enrollments.create({
      student_id,
      plan_id,
      start_date,
      end_date,
      price
    });
    await Queue.add(WellcomeMail.key, {
      student,
      plan,
      hourStart,
      end_date,
      price
    });
    // console.log(`${student.name} <${student.email}>`);
    return res.json(enrollment);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number().integer(),
      start_date: Yup.date().when('plan_id', (plan_id, field) =>
        plan_id ? field.required() : field
      )
    });
    // validate schema
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation Fails!!' });
    }

    // check enrollment exists
    const { enrollment_id } = req.params;
    const enrollment = await Enrollments.findByPk(enrollment_id);
    if (!enrollment) {
      return res
        .status(400)
        .json({ error: 'This Enrollment does not esxits!' });
    }
    const { student_id: student } = enrollment;

    const { gym_id } = await Students.findByPk(student);

    const userSameGym = await User.findByPk(req.userId);

    if (userSameGym.gym_id !== gym_id) {
      return res
        .status(401)
        .json({ error: 'You cannot update this enrollment' });
    }

    const { start_date, plan_id } = req.body;
    // getting info by plan_id
    const plan = await Plans.findByPk(!plan_id ? enrollment.plan_id : plan_id);
    // checking plan_id exists

    if (!plan) {
      return res.status(400).json({ error: 'This plan does not exists' });
    }
    // validate past dates reporteds
    const hourStart = startOfHour(parseISO(start_date));

    if (isBefore(hourStart, startOfHour(parseISO(new Date())))) {
      return res.status(400).json({ error: 'Past Dates are not permited!' });
    }
    // add months
    const end_date = addMonths(hourStart, plan.duration);

    // calculate price according kind of plan
    const price = plan.price * plan.duration;

    const { student_id } = await enrollment.update({
      price,
      end_date,
      start_date: hourStart,
      plan_id
    });

    return res.json({
      student_id,
      plan_id: !plan_id ? enrollment.plan_id : plan_id,
      end_date,
      start_date,
      price
    });
  }

  async delete(req, res) {
    const { enrollment_id } = req.params;
    const enrollment = await Enrollments.findByPk(enrollment_id);
    if (!enrollment) {
      return res.status(400).json({ error: 'This enrollment does not exists' });
    }
    const { student_id } = enrollment;

    const { gym_id } = await Students.findByPk(student_id);

    if (req.gym_id !== gym_id) {
      return res
        .status(401)
        .json({ error: 'You cannot update this enrollment' });
    }
    await enrollment.destroy();

    return res.json();
  }
}

export default new EnrollmentController();
