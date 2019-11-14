import request from 'supertest';

import app from '../../../src/app';

import truncate from '../../util/truncate';
import { writeDatabase } from '../../../src/app/helpers/FileHelper';

describe('Schedule', () => {
  beforeAll(async () => {
    await truncate();
  });

  it('should return status 200 with no schedules', async () => {
    const response = await request(app).get('/schedule');

    expect(response.status).toBe(200);
  });

  it('should be fail with bad formatted json file', async () => {
    const badJson = '..';

    writeDatabase(badJson);
    const response = await request(app).get('/schedule');
    await truncate();
    expect(response.status).toBe(400);
  });

  it('should be able insert new schedule day', async () => {
    const schedule = {
      period: 'day',
      days: [],
      date: '10-11-2019',
      intervals: [
        ['07:00', '10:10'],
        ['12:30', '15:30'],
      ],
    };
    const response = await request(app)
      .post('/schedule')
      .send(schedule);

    expect(response.body).toHaveProperty('id');
  });

  it('should be able insert new schedules weekly', async () => {
    const schedule = {
      period: 'weekly',
      days: ['monday', 'wednesday'],
      date: '',
      intervals: [
        ['07:30', '11:30'],
        ['13:30', '15:30'],
      ],
    };
    const response = await request(app)
      .post('/schedule')
      .send(schedule);

    expect(response.body).toHaveProperty('id');
  });

  it('should be able insert new schedules daily', async () => {
    const schedule = {
      period: 'daily',
      days: [],
      date: '',
      intervals: [
        ['08:00', '12:00'],
        ['15:30', '17:30'],
      ],
    };
    const response = await request(app)
      .post('/schedule')
      .send(schedule);

    expect(response.body).toHaveProperty('id');
  });

  it('should be able to delete a schedule', async () => {
    const schedule = {
      period: 'day',
      days: [],
      date: '10-11-2019',
      intervals: [
        ['08:00', '10:10'],
        ['11:30', '15:30'],
      ],
    };
    const insertResponse = await request(app)
      .post('/schedule')
      .send(schedule);

    const { id } = insertResponse.body;

    const deleteResponse = await request(app).delete(`/schedule/${id}`);

    expect(deleteResponse.status).toBe(200);
  });

  it('should fail to register a non-existent schedule id', async () => {
    const id = 'fdjfdkjah-312d123f';
    const deleteResponse = await request(app).delete(`/schedule/${id}`);

    expect(deleteResponse.status).toBe(400);
  });

  it('should be return all schedules in a range of dates', async () => {
    const schedules = [
      {
        id: 'a14eb9c2-5fd8-4eda-ba56-ab4ce27d38a1',
        period: 'weekly',
        days: [1, 3],
        date: '',
        intervals: [
          ['10:00', '14:00'],
          ['15:00', '18:00'],
        ],
      },
      {
        id: 'ba3928a4-55b0-4975-99fb-51b45329c7c3',
        period: 'daily',
        days: [],
        date: '',
        intervals: [
          ['07:00', '10:00'],
          ['12:30', '16:00'],
        ],
      },
      {
        id: '488ab08f-5fb1-467a-a430-9550faaf9fca',
        period: 'day',
        days: [],
        date: '10-11-2019',
        intervals: [
          ['07:00', '10:10'],
          ['12:30', '15:30'],
        ],
      },
    ];

    writeDatabase(schedules);

    const response = await request(app)
      .get(`/schedule/available`)
      .query({ start_date: '05-11-2019', end_date: '15-11-2019' });

    response.body.forEach(schedule => {
      expect(schedule).toHaveProperty('day');
    });
    expect(response.status).toBe(200);
  });

  it('should be able insert a daily schedule', async () => {
    const schedule = {
      period: 'daily',
      days: [],
      date: '',
      intervals: [
        ['07:00', '11:30'],
        ['11:00', '15:00'],
      ],
    };
    const response = await request(app)
      .post('/schedule')
      .send(schedule);

    expect(response.status).toBe(200);
  });

  it('should be able insert a weekly schedule', async () => {
    const schedule = {
      period: 'weekly',
      days: [],
      date: '',
      intervals: [
        ['09:00', '11:30'],
        ['15:00', '19:00'],
      ],
    };
    const response = await request(app)
      .post('/schedule')
      .send(schedule);

    expect(response.status).toBe(200);
  });

  it('should be able validate a weekly schedule with date field', async () => {
    const schedule = {
      period: 'weekly',
      days: [],
      date: '10-11-2019',
      intervals: [
        ['06:00', '11:30'],
        ['17:00', '19:00'],
      ],
    };
    const response = await request(app)
      .post('/schedule')
      .send(schedule);

    expect(response.status).toBe(400);
  });

  it('date field is required for a specifc day schedule', async () => {
    const schedule = {
      period: 'day',
      days: [],
      date: '',
      intervals: [
        ['06:00', '11:30'],
        ['17:00', '19:00'],
      ],
    };
    const response = await request(app)
      .post('/schedule')
      .send(schedule);

    expect(response.status).toBe(400);
  });

  it('should be validate hours', async () => {
    const schedule = {
      period: 'day',
      days: [],
      date: '10-11-2019',
      intervals: [
        ['06:00', '05:30'],
        ['17:00', '19:00'],
      ],
    };
    const response = await request(app)
      .post('/schedule')
      .send(schedule);

    expect(response.status).toBe(400);
  });

  it('should be validate if a interval of hours already exists for a day', async () => {
    const schedule = {
      period: 'day',
      days: [],
      date: '10-11-2019',
      intervals: [
        ['07:00', '10:10'],
        ['15:00', '18:00'],
      ],
    };
    const response = await request(app)
      .post('/schedule')
      .send(schedule);

    expect(response.status).toBe(400);
  });

  it('should be validate if a interval of hours already exists for daily period', async () => {
    const schedule = {
      period: 'daily',
      days: [],
      date: '',
      intervals: [
        ['07:00', '10:00'],
        ['15:00', '18:00'],
      ],
    };
    const response = await request(app)
      .post('/schedule')
      .send(schedule);

    expect(response.status).toBe(400);
  });

  it('should be validate if a interval of hours already exists for weekly period', async () => {
    const schedule = {
      period: 'weekly',
      days: ['monday', 'sunday'],
      date: '',
      intervals: [
        ['06:00', '11:30'],
        ['15:00', '18:00'],
      ],
    };
    const response = await request(app)
      .post('/schedule')
      .send(schedule);

    expect(response.status).toBe(400);
  });

  it('should be able return all schedules', async () => {
    const response = await request(app).get('/schedule');
    response.body.forEach(schedule => {
      expect(schedule).toHaveProperty('id');
    });
    expect(response.status).toBe(200);
  });

  it('should return status 200 and all schedules', async () => {
    const response = await request(app).get('/schedule');
    response.body.forEach(schedule => {
      expect(schedule).toHaveProperty('id');
    });
    expect(response.status).toBe(200);
  });
});
