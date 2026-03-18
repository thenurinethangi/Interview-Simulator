import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

const input = "Binary Trees & Graphs";
const randomnessToken = "12345";
const flavor = "Emphasize edge cases";

const promptContext = `Generate exactly 5 interview questions about the following topic: "${input}". Ensure the 5 questions cover a strict variety of difficulty levels: e.g., 2 Easy, 2 Medium, and 1 Hard.`;

const prompt = `You are an expert technical interviewer.
${promptContext}

Rules:
1. Generate exactly 5 questions.
2. Mix theoretical and coding questions (include at least 1 coding question).
3. Coding questions MUST be simple algorithms or functions (e.g., reverse a string, find max element). Do not ask for multi-file systems or complex architecture design.
4. Vary phrasing, difficulty, and angle each time even for the same input. Do not repeat the same set across calls. Randomness token: ${randomnessToken}. Flavor: ${flavor}
5. Return the result STRICTLY as a JSON object containing a "questions" array, where each object has:
  - "text": string (the question text. **MUST** start with the difficulty level in brackets, e.g., "[Easy] What is...", "[Medium] Explain...", "[Hard] Implement...")
  - "isCoding": boolean (true if the user should write code to answer in an IDE, false for a text explanation)

Example Output:
{
  "questions": [
    { "text": "[Easy] Explain the concept of Closure in JavaScript.", "isCoding": false },
    { "text": "[Medium] Write a function to check if a string is a palindrome.", "isCoding": true }
  ]
}`;

async function test() {
    console.log("Testing Groq Prompt...");
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: 'You are a helpful assistant that strictly outputs valid JSON only.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            response_format: { type: 'json_object' }
        })
    });
    
    const data = await res.json();
    console.log(data?.choices?.[0]?.message?.content);
}

test();
