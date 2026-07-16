const ai = require('../../config/gemini');
const { toolDeclarations, executeTool } = require('./agent.tools');

const MODEL = 'gemini-3.1-flash-lite';
const MAX_TOOL_ROUNDS = 5;

// Computed fresh on every call — a static string would silently go stale
const buildSystemInstruction = () => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const todayReadable = today.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return `You are LuxeLodging's booking concierge — warm, concise, conversational.
  Today's date is ${todayStr} (${todayReadable}). Treat this as ground truth for "today", "tomorrow",
  and any relative or partial date the user gives.
  Date handling rules:
  - If the user gives a date without a year (e.g. "Aug 1 to Aug 5"), assume the NEXT upcoming occurrence
    of that date. If that month/day has already passed this year, assume next year instead.
  - Never interpret a bare date as being in the past.
  - Always pass dates to tools in YYYY-MM-DD format.
  - If a date is genuinely ambiguous, ask the user to confirm rather than guessing.
  Help guests search properties, check availability, and get a price quote using the tools provided.
  Always use the tools for real data — never invent property names, prices, or availability.
  If a tool reports an error or unavailability, explain it to the user simply and suggest what to try
  instead (e.g. a different date or property) rather than repeating the raw error.
  When a guest wants to book, use propose_booking to get an accurate quote, then tell them to review
  and confirm it via the "Review & Book" button — you cannot create a booking or take payment yourself.
  Keep replies short, suited for a small chat window.`;
};

const chat = async (interactionId, message) => {
  let bookingProposal = null;
  let requestInput = message;
  let requestPreviousId = interactionId || undefined;
  let interaction;
  let rounds = 0;

  while (rounds < MAX_TOOL_ROUNDS) {
    interaction = await ai.interactions.create({
      model: MODEL,
      input: requestInput,
      tools: toolDeclarations,
      system_instruction: buildSystemInstruction(),
      previous_interaction_id: requestPreviousId,
    });

    const functionCallSteps = interaction.steps.filter((s) => s.type === 'function_call');

    if (functionCallSteps.length === 0) {
      return { reply: interaction.output_text, interactionId: interaction.id, bookingProposal };
    }

    const functionResults = [];
    for (const step of functionCallSteps) {
      let result;
      try {
        result = await executeTool(step.name, step.arguments);
      } catch (toolErr) {
        result = { error: true, message: toolErr.message };
      }

      if (step.name === 'propose_booking' && result?.available) {
        bookingProposal = result;
      }

      functionResults.push({
        type: 'function_result',
        name: step.name,
        call_id: step.id,
        result: [{ type: 'text', text: JSON.stringify(result) }],
      });
    }

    requestInput = functionResults;
    requestPreviousId = interaction.id;
    rounds++;
  }

  return {
    reply: "I'm having trouble completing that — could you try rephrasing?",
    interactionId: interaction?.id || interactionId,
    bookingProposal,
  };
};

module.exports = { chat };