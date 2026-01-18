import fetch from 'node-fetch'; // or built-in in Node 18+

const BASE_URL = 'http://localhost:3000/api';

const GOLD_SET = [
    { q: "What is the primary pigment involved in photosynthesis?", expected: "Chlorophyll" },
    { q: "Where does the light-dependent reaction take place?", expected: "Thylakoid membranes" },
    { q: "What are the byproducts of photosynthesis?", expected: "Oxygen and Glucose" },
    { q: "What is the Calvin Cycle?", expected: "Light-independent reactions in chloroplasts" },
    { q: "Which organisms perform photosynthesis?", expected: "Plants, algae, cyanobacteria" }
];

async function runEval() {
    console.log("Starting Evaluation (Ensure localhost:3000 is running)...\n");

    let passed = 0;

    for (const item of GOLD_SET) {
        console.log(`Q: ${item.q}`);
        try {
            const res = await fetch(`${BASE_URL}/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: item.q })
            });
            const data = await res.json();

            if (data.answer) {
                console.log(`A: ${data.answer.substring(0, 100)}...`);
                console.log(`Citations: ${data.citations?.length || 0}`);
                console.log(`Time: ${data.time}ms`);
                console.log(`[PASS] (Manual check required for semantic accuracy vs '${item.expected}')`);
                passed++; // Naive pass if we get an answer
            } else {
                console.log(`[FAIL] No answer returned. Error: ${data.error}`);
            }
        } catch (e) {
            console.log(`[FAIL] Request error: ${e.message}`);
        }
        console.log('-'.repeat(40));
    }

    console.log(`\nEval Complete. Requests successful: ${passed}/${GOLD_SET.length}`);
}

runEval();
