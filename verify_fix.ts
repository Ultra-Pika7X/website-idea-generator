const { generateIdeaBatch } = require('./src/lib/ideaEngine');

// Mock NICHES and other deps if needed, or rely on them being present if valid JS.
// Since ideaEngine uses import/export, we might need to use ts-node or just run it as a module if possible.
// Actually, let's just make this a TS file and try to run it with ts-node if available, or just use a simple JS test that copies the logic if needed.
// Better: create a test file in the project and run it.

async function verify() {
    console.log("Starting verification...");
    const batch = generateIdeaBatch(25, 'SaaS');
    const titles = batch.map(i => i.title);
    const unique = new Set(titles);

    console.log(`Generated ${batch.length} ideas.`);
    console.log(`Unique titles: ${unique.size}`);

    if (unique.size === batch.length) {
        console.log("SUCCESS: All ideas are unique!");
    } else {
        console.log("FAILURE: Found duplicates.");
        console.log("Duplicates:");
        const seen = new Set();
        titles.forEach(t => {
            if (seen.has(t)) console.log(` - ${t}`);
            seen.add(t);
        });
    }
}

verify();
