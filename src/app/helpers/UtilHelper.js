const checkHourExist = (baseArray, compareArray) => {
  let exists;
  for (let i = 0; i < baseArray.length; i += 1) {
    exists = compareArray.find(
      value => baseArray[i][0] === value[0] && baseArray[i][1] === value[1]
    );

    if (exists) return true;
  }
  return exists;
};

const checkWeekDays = (baseArray, compareArray) => {
  for (let i = 0; i < baseArray.length; i += 1) {
    return compareArray.includes(baseArray[i]);
  }
  return false;
};

const parseWeekDays = days => {
  const parsedDays = [];

  if (days && days.length > 0) {
    const weekDays = [
      { number: 0, label: 'Sunday' },
      { number: 1, label: 'Monday' },
      { number: 2, label: 'Tuesday' },
      { number: 3, label: 'Wednesday' },
      { number: 4, label: 'Thursday' },
      { number: 5, label: 'Friday' },
      { number: 6, label: 'Saturday' },
    ];

    days.forEach(value => {
      const searchDay = weekDays.find(day => day.number === value);
      parsedDays.push(searchDay.label);
    });
  }
  return parsedDays;
};

export { checkHourExist, checkWeekDays, parseWeekDays };
