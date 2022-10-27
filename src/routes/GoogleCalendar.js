const { GoogleCalendar } = require('../controllers/GoogleCalendar');
const { createDate, sleep } = require('../utils/helpers');
const { Router } = require('express');
const { Timetable } = require('../models');

const router = Router();

router.get('/gc-integration', async (req, res) => {
  const { session, semester, program, section } = req.data;

  const timetable = new Timetable(session, semester, program, section);
  const data = await timetable.getAll();

  const googleCalendar = new GoogleCalendar();

  const keys = Object.keys(data);

  keys.forEach((key) => {
    data[key].forEach((lecture) => {
      const { hours: sHours, minutes: sMinutes } = lecture.startTime;
      const { hours: eHours, minutes: eMinutes } = lecture.endTime;

      googleCalendar.setEvent({
        roomNo: lecture.roomNo?.trim(),
        subject: lecture.subject?.trim(),
        teacherName: lecture.teacher?.trim(),
        startTime: createDate(key, sHours, sMinutes, 0),
        endTime: createDate(key, eHours, eMinutes, 0),
      });

      sleep(5000).then(() => {
        googleCalendar.insertEvent();
      });
    });
  });
});

module.exports = router;
