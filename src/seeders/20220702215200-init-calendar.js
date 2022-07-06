// const categories = require('./categories.json');
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
    INSERT INTO public.calendar(
      id, calendar_date, year, month, week, day, week_day, week_day_name)
      (select 
        extract('year' from date)*10000+extract('month' from date)*100+extract('day' from date) as id,
        date::date,
        extract('year' from date) as year,
        extract('month' from date) as month,
        extract('week' from date) as week,
        extract('day' from date) as day,
        extract('isodow' from date) as dow_num,
        to_char(date, 'dy') as dow_name
        from generate_series(date '2020-01-01',
                        date '2025-12-31',
                        interval '1 day')
        as t(date));`);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('calendar', null, {});
  },
};
