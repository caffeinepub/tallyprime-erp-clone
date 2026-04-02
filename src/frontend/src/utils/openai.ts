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
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    const msg = err.error?.message || "OpenAI API error";
    if (
      msg.includes("quota") ||
      msg.includes("limit") ||
      err.error?.code === "insufficient_quota"
    ) {
      throw new Error(
        "Your OpenAI quota is exceeded. Please add credits at platform.openai.com/account/billing or use a different API key.",
      );
    }
    if (msg.includes("rate_limit") || err.error?.type === "rate_limit_error") {
      throw new Error(
        "OpenAI rate limit reached. Please wait a moment and try again.",
      );
    }
    throw new Error(msg);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content || "";
}
