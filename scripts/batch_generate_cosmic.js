// ==========================================================================
// Batch Generator for The Cosmic Treehouse Explorers (10 Episodes)
// ==========================================================================

const { execSync } = require('child_process');
const path         = require('path');

async function generateBatch(count = 10) {
    console.log(`🚀 Starting batch generation of ${count} episodes for The Cosmic Treehouse Explorers...\n`);

    for (let i = 1; i <= count; i++) {
        console.log(`==========================================================================`);
        console.log(`📦 BATCH BATCH ITEM ${i} OF ${count}`);
        console.log(`==========================================================================`);
        try {
            execSync(`node "${path.join(__dirname, 'generate-cosmic-story.js')}"`, { stdio: 'inherit' });
            console.log(`✅ Item ${i}/${count} completed successfully!\n`);
        } catch (err) {
            console.error(`❌ Item ${i}/${count} failed:`, err.message);
        }
    }

    console.log(`🎉 Batch generation complete!`);
}

generateBatch(10);
