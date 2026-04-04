export async function callGemini(prompt: string): Promise<string> {
  const key = localStorage.getItem("hisabkitab_gemini_key");
  if (!key)
    throw new Error(
      "Gemini API key not set. Go to AI Settings to add your key.",
    );

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 400 },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.json();
    const msg = err.error?.message || "Gemini API error";
    if (msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
      throw new Error(
        "Gemini quota exceeded. Check your Google AI Studio quota.",
      );
    }
    throw new Error(msg);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}
