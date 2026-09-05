'use strict';

const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');

function parseHM(hm) {
  const [h, m] = String(hm || '').split(':').map((v) => parseInt(v, 10));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function computeWeeklyHours(days) {
  let totalMinutes = 0;
  for (const day of days || []) {
    if (day.is_working === false) continue;
    const start = parseHM(day.start_time);
    const end = parseHM(day.end_time);
    if (start === null || end === null || end <= start) continue;
    const brk = Number(day.break_minutes || 0);
    totalMinutes += Math.max(0, end - start - brk);
  }
  return Math.round((totalMinutes / 60) * 100) / 100;
}

async function replaceDays({ scheduleId, days, transaction }) {
  await models.WorkingScheduleDay.destroy({ where: { working_schedule_id: scheduleId }, transaction });
  const created = [];
  for (const day of days || []) {
    const row = await models.WorkingScheduleDay.create(
      {
        working_schedule_id: scheduleId,
        day_of_week: day.day_of_week,
        block_index: day.block_index || 1,
        start_time: day.start_time,
        end_time: day.end_time,
        break_minutes: day.break_minutes || 0,
        is_working: day.is_working !== false,
      },
      { transaction }
    );
    created.push(row);
  }
  return created;
}

async function create({ organizationId, payload }) {
  return sequelize.transaction(async (transaction) => {
    const weeklyHours = computeWeeklyHours(payload.days || []);
    const schedule = await models.WorkingSchedule.create(
      {
        organization_id: organizationId,
        name: payload.name,
        code: payload.code || null,
        schedule_type: payload.schedule_type || 'standard',
        timezone: payload.timezone || 'UTC',
        weekly_hours: weeklyHours,
        is_active: payload.is_active !== false,
        description: payload.description || null,
      },
      { transaction }
    );
    if (Array.isArray(payload.days) && payload.days.length) {
      await replaceDays({ scheduleId: schedule.id, days: payload.days, transaction });
    }
    return schedule;
  });
}

async function update({ organizationId, id, payload }) {
  return sequelize.transaction(async (transaction) => {
    const schedule = await models.WorkingSchedule.findOne({
      where: { id, organization_id: organizationId },
      transaction,
    });
    if (!schedule) throw AppError.notFound('Working schedule not found');
    if (payload.days) {
      const weeklyHours = computeWeeklyHours(payload.days);
      await schedule.update({ ...payload, weekly_hours: weeklyHours, days: undefined }, { transaction });
      await replaceDays({ scheduleId: schedule.id, days: payload.days, transaction });
    } else {
      await schedule.update(payload, { transaction });
    }
    return schedule;
  });
}

module.exports = { create, update, computeWeeklyHours };
