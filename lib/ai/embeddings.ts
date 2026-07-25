const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

/**
 * Generates a semantic embedding for Second Brain memories using OpenAI's
 * embeddings endpoint. Kept as a plain `fetch` call (no SDK dependency) since
 * it's the only OpenAI call in the app — everything else goes through Claude.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY não configurada. Defina a variável de ambiente para habilitar a busca semântica do Second Brain."
    );
  }

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text.slice(0, 8000),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Falha ao gerar embedding (${res.status}): ${body}`);
  }

  const json = await res.json();
  return json.data[0].embedding as number[];
}
