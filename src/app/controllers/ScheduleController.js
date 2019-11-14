import uuid from 'uuid/v4';
import { eachDayOfInterval, parse, getDay, format, compareAsc } from 'date-fns';
import { writeDatabase, readDatabase } from '../helpers/FileHelper';
import {
  checkHourExist,
  checkWeekDays,
  parseWeekDays,
} from '../helpers/UtilHelper';

class ScheduleController {
  index(req, res) {
    try {
      const database = readDatabase();

      if (database.length === 0)
        return res.status(200).json({ message: 'There are no schedules' });

      return res.status(200).json(
        database.map(value => ({
          ...value,
          days: parseWeekDays(value.days),
        }))
      );
    } catch (err) {
      return res.status(400).json({ message: err });
    }
  }

  store(req, res) {
    try {
      const numbersOfWeekDay = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
      };
      const database = readDatabase();
      const { period, days, date, intervals } = req.body;

      if (date && (period === 'weekly' || period === 'daily'))
        return res.status(400).json({
          message: 'For weekly or daily periods, do not need a specifc date.',
        });

      if (period === 'day' && !date)
        return res.status(400).json({
          message: 'Date is required for a specifc schedule.',
        });

      let intervalInvalid = false;
      intervals.forEach(value => {
        const date1 = parse(value[0], 'HH:mm', new Date());
        const date2 = parse(value[1], 'HH:mm', new Date());

        if (compareAsc(date1, date2) === 1) {
          intervalInvalid = true;
        }
      });

      if (intervalInvalid) {
        return res.status(400).json({ message: 'Time interval invalid' });
      }

      const weekDays = days.map(day => numbersOfWeekDay[day]);

      if (database.length > 0) {
        let scheduleExists;
        for (let i = 0; i < database.length; i += 1) {
          const item = database[i];
          if (
            period === 'day' &&
            item.period === 'day' &&
            date === item.date &&
            checkHourExist(item.intervals, intervals)
          )
            scheduleExists = true;

          if (
            period === 'daily' &&
            item.period === 'daily' &&
            checkHourExist(item.intervals, intervals)
          )
            scheduleExists = true;

          if (
            period === 'weekly' &&
            item.period === 'weekly' &&
            checkWeekDays(item.days, weekDays) &&
            checkHourExist(item.intervals, intervals)
          ) {
            scheduleExists = true;
          }

          if (scheduleExists)
            return res.status(400).json({ message: 'Time interval exists' });
        }
      }

      const newSchedule = {
        id: uuid(),
        period,
        days: weekDays,
        date,
        intervals,
      };

      writeDatabase([...database, newSchedule]);
      return res.status(200).json(newSchedule);
    } catch (err) {
      return res.status(400).json({ message: err });
    }
  }

  delete(req, res) {
    try {
      const { id } = req.params;

      const database = readDatabase();
      const appointment = database.find(item => item.id === id);

      if (!appointment)
        return res.status(400).json({ message: 'Appointment not found' });

      database.forEach((item, idx) => {
        if (item.id === id) {
          database.splice(idx, 1);
        }
      });

      writeDatabase(database);

      return res.status(200).json(database);
    } catch (err) {
      return res.status(400).json({ message: err });
    }
  }

  available(req, res) {
    try {
      const database = readDatabase();
      let { start_date, end_date } = req.query;

      start_date = parse(start_date, 'dd-MM-yyyy', new Date());
      end_date = parse(end_date, 'dd-MM-yyyy', new Date());

      const daysList = eachDayOfInterval({ start: start_date, end: end_date });
      const available = [];

      daysList.forEach(day => {
        const weekDay = getDay(day);
        const formattedDay = format(day, 'dd-MM-yyyy');

        database.forEach(item => {
          let appointmentExists = false;
          if (item.period === 'weekly') {
            appointmentExists = item.days.includes(weekDay);
          } else if (item.period === 'daily') {
            appointmentExists = true;
          } else {
            appointmentExists = item.date === formattedDay;
          }

          if (appointmentExists)
            available.push({
              day: item.date || formattedDay,
              intervals: item.intervals.map(hour => ({
                start: hour[0],
                end: hour[1],
              })),
            });
        });
      });

      return res.status(200).json(available);
    } catch (err) {
      return res.status(400).json({ message: err });
    }
  }
}

export default new ScheduleController();
