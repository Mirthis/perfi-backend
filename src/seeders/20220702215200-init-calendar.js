// const categories = require('./categories.json');
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
    INSERT INTO public.calendar(
      id, calendar_date, year, month, week, day, week_day, week_day_name,
      curr_month_start_date, curr_month_end_date, prev_month_start_date, prev_month_end_date,
      curr_year_start_date, curr_year_end_date, prev_year_start_date, prev_year_end_date,
      prev_12_month_start_date, prev_12_month_end_date)
      (select 
        extract('year' from date)*10000+extract('month' from date)*100+extract('day' from date) as id,
        date::date,
        extract('year' from date) as year,
        extract('month' from date) as month,
        extract('week' from date) as week,
        extract('day' from date) as day,
        extract('isodow' from date) as dow_num,
        to_char(date, 'dy') as dow_name,
        date_trunc('month', date)::date,
        (date_trunc('month', date)+ interval '1 month - 1 day')::date,
        (date_trunc('month', date)- interval '1 month')::date,
        (date_trunc('month', date)- interval '1 day')::date,
        date_trunc('year', date)::date,
        (date_trunc('year', date) + interval '1 year - 1 day')::date,
        (date_trunc('year', date) - interval '1 year')::date,
        (date_trunc('year', date) - interval '1 day')::date,
        (date_trunc('month', date)- interval '12 month')::date,
        (date_trunc('month', date)- interval '1 day')::date
        from generate_series(date '2020-01-01',
                        date '2025-12-31',
                        interval '1 day')
        as t(date));`);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('calendar', null, {});
  },
};
