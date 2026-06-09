const mongoose = require('mongoose');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const TIMELINE_EVENT_TYPES = [
  'appointment.booked',
  'reminder.completed',
  'report.uploaded',
  'pcos.assessment.completed',
  'article.viewed',
  'cycle.created',
  'health_log.created'
];

const eventLabels = {
  'appointment.booked': {
    title: 'Appointment booked',
    description: (payload) =>
      payload?.date
        ? `Appointment scheduled for ${new Date(payload.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}.`
        : 'A new appointment was booked.'
  },
  'reminder.completed': {
    title: 'Reminder completed',
    description: (payload) =>
      payload?.title ? `${payload.title} was marked complete.` : 'A reminder was marked complete.'
  },
  'report.uploaded': {
    title: 'Report uploaded',
    description: (payload) =>
      payload?.title ? `${payload.title} was added to reports.` : 'A medical report was uploaded.'
  },
  'pcos.assessment.completed': {
    title: 'PCOS assessment completed',
    description: (payload) =>
      payload?.riskLevel ? `Assessment completed with ${payload.riskLevel} risk.` : 'A PCOS assessment was completed.'
  },
  'article.viewed': {
    title: 'Article viewed',
    description: (payload) =>
      payload?.title ? `Read ${payload.title}.` : 'An article was viewed.'
  },
  'cycle.created': {
    title: 'Cycle logged',
    description: () => 'A cycle record was added.'
  },
  'health_log.created': {
    title: 'Health log added',
    description: () => 'A health log entry was added.'
  }
};

const buildTimelineItem = (event) => {
  const payload = event.payload || {};
  const label = eventLabels[event.eventType] || {
    title: event.eventType,
    description: () => 'Health activity was recorded.'
  };

  return {
    id: event._id,
    eventType: event.eventType,
    topic: event.topic,
    entityId: event.entityId,
    title: label.title,
    description: label.description(payload),
    payload,
    occurredAt: event.occurredAt
  };
};

const getTimeline = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const eventType = String(req.query.eventType || '').trim();
  const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
  const eventTypes = TIMELINE_EVENT_TYPES.includes(eventType)
    ? [eventType]
    : TIMELINE_EVENT_TYPES;

  const events = await AnalyticsEvent.find({
    user: userId,
    eventType: { $in: eventTypes }
  })
    .sort({ occurredAt: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  return successResponse(res, 200, 'Timeline fetched successfully', {
    events: events.map(buildTimelineItem),
    filters: {
      eventTypes: TIMELINE_EVENT_TYPES
    }
  });
});

module.exports = {
  TIMELINE_EVENT_TYPES,
  getTimeline
};
