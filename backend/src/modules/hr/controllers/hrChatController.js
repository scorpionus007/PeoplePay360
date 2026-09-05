'use strict';

const { success } = require('../../../utils/response');

// Placeholder AI chat surface. The Python AI microservice (added in a later push)
// will be called from here with a signed intent token; for now we return a
// deterministic canned response so the frontend can render the transport shape.

async function ask(req, res) {
  const question = String(req.body.question || '').trim();
  const reply = question
    ? `I am the PeoplePay360 assistant. You asked: ${question}. AI microservice integration lands in the AI push.`
    : 'Please provide a question.';
  return success(res, {
    thread_id: req.body.thread_id || null,
    reply,
    source: 'stub',
  });
}

module.exports = { ask };
