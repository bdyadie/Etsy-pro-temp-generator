const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.handler = async ({ headers, body }) => {
  if (!headers.authorization) return { statusCode: 401, body: "Unauthorized" };
  const { prompt } = JSON.parse(body);
  const chat = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }]
  });
  return {
    statusCode: 200,
    body: JSON.stringify({ result: chat.choices[0].message.content })
  };
};
