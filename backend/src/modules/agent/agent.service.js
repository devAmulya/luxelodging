const ai = require('../../config/gemini');
const { toolDeclarations, executeTool } = require('./agent.tools');

const MODEL = 'gemini-3.5-flash'; // gemini-2.5-flash was unavailable at test time — confirmed working
const MAX_TOOL_ROUNDS = 5;

const SYSTEM_INSTRUCTION = `You are LuxeLodging's booking concierge — warm, concise, conversational.
Help guests search properties, check availability, and get a price quote using the tools provided.
Always use the tools for real data — never invent property names, prices, or availability.
If a tool reports an error or unavailability, explain it to the user simply and suggest what to try
instead (e.g. a different date or property) rather than repeating the raw error.
When a guest wants to book, use propose_booking to get an accurate quote, then tell them to review
and confirm it via the "Review & Book" button — you cannot create a booking or take payment yourself.
Keep replies short, suited for a small chat window.`;

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
      system_instruction: SYSTEM_INSTRUCTION,
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
        // One tool failing becomes a normal result the model can explain —
        // not a crashed request
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