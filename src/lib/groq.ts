const DEFAULT_MODEL_CANDIDATES = [
    process.env.GROQ_MODEL,
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
    'gemma2-9b-it'
].filter(Boolean) as string[];

function uniqueModels(models: string[]) {
    return [...new Set(models.map((m) => m.trim()).filter(Boolean))];
}

function extractJson(text: string) {
    const trimmed = text.trim();
    if (trimmed.startsWith('```')) {
        return trimmed.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/, '').trim();
    }
    return trimmed;
}

export async function generateGroqJson(params: {
    apiKey: string;
    prompt: string;
    systemInstruction: string;
    temperature?: number;
}) {
    const models = uniqueModels(DEFAULT_MODEL_CANDIDATES);
    const errors: string[] = [];

    for (const model of models) {
        const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${params.apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: params.systemInstruction },
                    { role: 'user', content: params.prompt }
                ],
                temperature: params.temperature ?? 0.2,
                response_format: { type: 'json_object' }
            })
        });

        const raw = await resp.json();

        if (resp.ok) {
            const aiText = raw?.choices?.[0]?.message?.content?.trim();
            if (!aiText) {
                throw new Error('Groq returned an empty response');
            }

            return {
                model,
                data: JSON.parse(extractJson(aiText))
            };
        }

        const msg = raw?.error?.message || `status ${resp.status}`;
        errors.push(`${model}: ${msg}`);

        // Try next candidate model on unsupported/missing model errors.
        const canRetryModel =
            resp.status === 404 ||
            /model.*(not found|decommissioned|unsupported|does not exist)/i.test(String(msg));

        if (!canRetryModel) {
            throw new Error(`Groq request failed (${model}): ${msg}`);
        }
    }

    throw new Error(`No compatible Groq model found. Tried: ${errors.join(' | ')}`);
}
