export async function callOpenAI(prompt: string): Promise<string> {
  const key = localStorage.getItem("hisabkitab_openai_key");
  if (!key)
    throw new Error(
      "OpenAI API key not set. Go to AI Settings to add your key.",
    );

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "OpenAI API error");
  }

  const data = await res.json();
  return data.choices[0]?.message?.content || "";
}
