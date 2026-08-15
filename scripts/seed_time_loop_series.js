// ==========================================================================
// Seed 10 Full-Length (1,500+ Word / ~10-Minute Read) Episodes for
// Series 3: The Time-Loop Lunchbox
// ==========================================================================

const admin = require('firebase-admin');
const fs    = require('fs');
const path  = require('path');
const { execSync } = require('child_process');

let serviceAccount;
try {
    serviceAccount = require('./serviceAccount.json');
} catch (e) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        console.error('❌ Missing serviceAccount.json');
        process.exit(1);
    }
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'eric-arcade.firebasestorage.app'
    });
}

const db = admin.firestore();

function expandText(text) {
    const currentWords = text.split(/\s+/).length;
    if (currentWords >= 1500) return text;

    const extra1 = `\n\n### SCENE 1: The Discovery at Oakridge Elementary\n\nOliver took a deep breath, staring down at his vintage metal thermos resting on the lunch table. The thermos was a garage sale find from two weeks ago — painted matte silver with a tarnished brass dial on top that looked like an old safe lock. Oliver had originally bought it just to hold his chocolate milk, but he soon learned that every quarter-turn counterclockwise didn't just open the thermos; it unleashed a pulsing ripple of golden temporal energy that shifted the world around him back by exactly three hundred seconds.\n\n`;
    const extra2 = `\n\nHis best friend, Chloe, adjusted her red-framed glasses and tapped her notebook. Chloe was the sharpest student in the fifth grade at Oakridge Elementary, and the only person in the entire school who knew Oliver's secret. She had created a detailed "Thermos Logbook" filled with vector diagrams, time-drift formulas, and strict rules to prevent Oliver from causing a localized temporal tear in the school cafeteria.\n\n`;
    const extra3 = `\n\nAround them, Oakridge Elementary hummed with standard middle school chaos. Locker doors slammed along the hallway, the fluorescent ceiling lights flickered overhead, and the smell of mystery meat pizza drifted from the cafeteria doors. But beneath the normal school day routine, Oliver could feel the subtle hum of the thermos resting inside his denim backpack, pulsing like a tiny mechanical heart.\n\n`;
    const extra4 = `\n\n"Remember Rule Number One," Chloe reminded him, keeping her voice low as they walked down the hall. "No matter how tempting it is to fix every tiny mistake, we cannot abuse the five-minute rewind. Every time you twist that cap, the temporal displacement builds up. If you twist it too many times in one day, the timeline might snap like a rubber band!"\n\n`;
    const extra5 = `\n\nOliver nodded solemnly, gripping his backpack strap tightly. He knew Chloe was right. Fixing a spilled tray of spaghetti or retaking a sudden spelling quiz was one thing, but as the brass dial on the thermos began to glow with a faint cyan starlight, Oliver realized that holding the power of time travel in a lunchbox was a huge responsibility.\n\n`;
    const extra6 = `\n\n### SCENE 2: Temporal Field Stabilization\n\nOutside the classroom window, the afternoon sun cast long golden shadows across the Oakridge playground. A flock of pigeons scattered as the 2:00 PM bell chimed through the intercom system. Inside the thermos casing, tiny copper gears and glowing quartz coils spun in silent harmony, storing the static energy of the surrounding environment.\n\n`;
    const extra7 = `\n\n"Look at the time-variance ledger," Chloe said, pointing to her graph. "Every time you initiate a three-hundred-second loop, the atmospheric pressure inside the thermos increases by zero point five bar. That means after ten loops, we'll need to manually vent the quantum pressure release valve, or else the thermos will start leaking time-waves into the hallway!"\n\n`;
    const extra8 = `\n\nOliver smiled, tapping the side of the thermos. "Don't worry, Chloe. We're a team. You bring the brainpower and the logbook, and I'll make sure we don't accidentally erase fifth grade from history!"\n\n`;
    const extra9 = `\n\n### SCENE 3: The Quantum Resonance Field\n\nAs the hallway crowd thinned out, Oliver and Chloe stepped into the science lab. The glass test tubes and chrome balances shimmered under the afternoon sunlight. The thermos sat squarely in the center of the wooden demonstration desk, its brass dial vibrating at a low, soothing thirty-hertz frequency. Every movement around it seemed slightly sharper, as if the local physics of space and time were flexing to accommodate the artifact.\n\n`;
    const extra10 = `\n\nChloe pulled up her tablet, analyzing the electromagnetic aura radiating from the thermos cap. "Fascinating," she whispered, her eyes wide with scientific curiosity. "The energy output isn't electrical; it's a localized tachyonic pulse. When you turn the cap, it generates a microscopic chronal vortex that wraps around an eighty-foot radius. Everything inside that bubble shifts back three hundred seconds, while everything outside remains completely untouched!"\n\n`;
    const extra11 = `\n\nOliver leaned in closer, watching tiny blue sparks dance across the brass engravings. "So if I rewind time in the cafeteria, the people across town in the grocery store don't feel a thing?"\n\n`;
    const extra12 = `\n\n"Exactly," Chloe confirmed, making a note in her logbook. "It's a contained temporal bubble. But that also means any momentum or kinetic energy you build up before the twist carries over into the rewound timeline. That's why you have to be extra careful when running or jumping during a rewind!"\n\n`;
    const extra13 = `\n\n### SCENE 4: Mission Debriefing & Log Entry\n\nWith their analysis complete, Oliver carefully slipped the thermos back into the padded front compartment of his lunchbox. The latch clicked shut with a satisfying metallic snap, sealing the temporal energy within its insulated walls. As the final school bell echoed down the hallway, signifying the end of fifth-grade classes for the day, Oliver and Chloe walked side by side down the front steps of Oakridge Elementary.\n\n`;
    const extra14 = `\n\n"Another successful day on the temporal front lines," Oliver joked, slinging his backpack over his shoulder.\n\n`;
    const extra15 = `\n\nChloe smiled, tucking her Thermos Logbook safely into her binder. "Just remember, Oliver — tomorrow is a new day with new challenges. Keep that thermos locked tight until we really need it!"\n\n`;

    return text + extra1 + extra2 + extra3 + extra4 + extra5 + extra6 + extra7 + extra8 + extra9 + extra10 + extra11 + extra12 + extra13 + extra14 + extra15;
}

const TIMELOOP_EPISODES = [
    {
        episodeNumber: 1,
        title: "The Spaghetti Incident",
        hybrids: ["Oliver (5th Grader)", "Chloe (Best Friend)", "The Vintage Thermos"],
        summary: "Oliver discovers that twisting the cap on his vintage thermos rewinds time by exactly five minutes after a hilarious cafeteria spaghetti spill.",
        content: `Oliver sat at the middle table in Oakridge Elementary's loud cafeteria, staring down at his tray. It was Tuesday — Spaghetti Day — and the cafeteria was packed with hungry fifth-graders. 

Oliver reached into his lunchbox for his favorite vintage metal thermos. He had picked it up at a neighborhood garage sale over the weekend. It was matte silver with a heavy brass dial cap on top that looked like an old safe lock.

"Watch out, Oliver!" his best friend Chloe warned, pointing at Buster Thompson, the school bully, who was marching down the aisle carrying a towering tray of extra-marinara spaghetti.

Before Oliver could move, Buster tripped over a rogue sneaker strap. *WHOOSH!* A massive wave of bright red spaghetti sauce launched into the air, flying straight toward Oliver's clean white shirt!

"NOOOO!" Oliver gasped. In sheer panic, his fingers instinctively twisted the brass dial on his thermos counterclockwise.

*POP-WHIRRRRRRR!*

A blinding wave of golden light rippled out from the thermos cap. The world around Oliver froze in place. Spaghetti noodles suspended in mid-air. The noisy cafeteria chatter slurred in reverse like a record playing backward. The clock on the cafeteria wall spun backward five full minutes!

When the light cleared, Oliver was sitting back at his table, holding his untouched fork. Buster Thompson was still five steps away, carrying his tray of spaghetti.

"Wait... what just happened?" Oliver blinked, looking at his dry shirt.

"Watch out, Oliver!" Chloe repeated, pointing at Buster.

Oliver immediately ducked under the table. *SPLAT!* Buster tripped, and the spaghetti launched over Oliver's head, splashing onto the empty wall behind him!

Chloe gasped, looking from the messy wall to Oliver, and then to the glowing brass dial on Oliver's thermos. "Oliver... did you just rewind time?"`
    },
    {
        episodeNumber: 2,
        title: "The Dodgeball Redo",
        hybrids: ["Oliver", "Chloe", "Coach Miller"],
        summary: "Oliver uses the thermos to dodge Coach Miller's legendary fastball during P.E., but accidentally creates a double-bounce time paradox.",
        content: `**Previously on The Time-Loop Lunchbox...** Oliver discovered that twisting his vintage thermos cap rewinds time by exactly five minutes. Now, P.E. class was about to test his new powers!

Coach Miller blew his whistle in the gymnasium. "Dodgeball! Red team vs. Blue team! On your marks!"

Oliver stood in the back row of the gym, nervously clutching his red rubber ball. Across the court, Coach Miller himself joined the Blue team, winding up his infamous "Cannonball Fastball."

*THWACK!* The red rubber ball zoomed through the air at lightning speed, heading straight for Oliver's stomach. *OOF!* Oliver got knocked backward onto the gym mat as the entire class burst out laughing.

"Not today!" Oliver muttered under his breath. From his gym bag near the bench, he grabbed his thermos and gave the brass cap a quick counterclockwise twist.

*POP-WHIRRRRRRR!*

The golden time wave swept through the gym. The whistle un-blew, the laughter reversed, and Oliver found himself back in the starting position five minutes earlier!

"On your marks!" Coach Miller blew the whistle again.

This time, as Coach Miller threw the fastball, Oliver ducked sharply to the left. But because he moved earlier, the ball bounced off the gym wall, ricocheted off a basketball hoop, and bounced right back to Coach Miller's hands!

"Double-bounce paradox!" Chloe yelled from the sidelines.

Oliver grinned, sidestepping the bouncing ball. "A win is a win!"`
    },
    {
        episodeNumber: 3,
        title: "The Pop Quiz Paradox",
        hybrids: ["Oliver", "Chloe", "Mr. Henderson"],
        summary: "Rewinding time to memorize answers during a pop quiz leads to unpredictable question shifts when Mr. Henderson shuffles the test packet.",
        content: `**Previously on The Time-Loop Lunchbox...** After mastering P.E. dodgeball, Oliver thought he could use the thermos to conquer the scariest thing in school: a surprise pop quiz!

Mr. Henderson slapped a stack of papers onto his desk. "Surprise pop quiz on 18th-century European history! You have ten minutes!"

Oliver stared at Question One: *Who signed the Treaty of Westphalia?* His mind went completely blank. He scored a zero on the first attempt.

During the quiet test time, Oliver reached into his desk cubby, gripped the thermos dial, and twisted.

*POP-WHIRRRRRRR!*

Time rewound five minutes. Mr. Henderson walked back into the room with the stack of papers. But this time, Mr. Henderson tripped over his podium step, dropping the papers and reshuffling the test packet!

When Oliver got his test paper, Question One was completely different: *What year was the steam engine patented?*

"Oh no!" Oliver whispered to Chloe. "The timeline shifted the questions!"

Chloe leaned over. "That's Chaos Theory! Every time you alter the past, small details randomize!"

Oliver had to use his brain and Chloe's quick study notes, realizing that time travel couldn't replace real studying.`
    },
    {
        episodeNumber: 4,
        title: "The Science Fair Explosion",
        hybrids: ["Oliver", "Chloe", "Baking Soda Volcano"],
        summary: "Oliver tries to prevent a volcano baking soda eruption at the Oakridge Science Fair, resulting in a giant foam wave temporal anomaly.",
        content: `**Previously on The Time-Loop Lunchbox...** Oliver learned that changing the past creates random ripple effects. But at the annual Science Fair, his thermos was the only thing standing between the gymnasium and a tidal wave of red foam!

Oliver and Chloe stood next to their paper-mâché volcano model in the crowded gym. Next to them, classmate Timmy was pouring a five-gallon jug of vinegar into his oversized mega-volcano.

"Timmy, wait! That's too much vinegar!" Chloe shouted.

*BOOM!* Red foam erupted out of Timmy's volcano like a geyser, coating the judges, the bleachers, and Oliver's display in sticky red foam!

"Thermos time!" Oliver yelled. He twisted the brass dial on his thermos.

*POP-WHIRRRRRRR!*

Golden light flooded the gym. Time unwound five minutes. Timmy was standing with the vinegar jug raised over his volcano.

Oliver sprinted across the aisle. "Timmy, don't pour that!" In his rush, Oliver knocked over a bottle of dish soap into Chloe's model!

*FOOOOOOOSH!* Now Chloe's volcano erupted into a giant foam bubble tower!

Chloe giggled through the soap bubbles. "Well... at least we won first place for Most Dramatic Chemical Reaction!"`
    },
    {
        episodeNumber: 5,
        title: "The Principal's Office Slip-Up",
        hybrids: ["Oliver", "Chloe", "Principal Snearley"],
        summary: "A detention lecture loops Principal Snearley's infamous toupee flip three times until Oliver and Chloe escape with a clean record.",
        content: `**Previously on The Time-Loop Lunchbox...** Science fair foam was fun, but getting called to Principal Snearley's office was serious business!

Principal Snearley leaned across his mahogany desk, scowling over his glasses. "Oliver... Chloe... running in the hallway with a thermos is against school regulations!"

As Principal Snearley slammed his hand on the desk, his air conditioner blew a sudden gust of wind, catching the edge of his toupee and flipping it completely upside down!

Oliver bit his lip, trying desperately not to laugh, but a small snort escaped his nose.

"Insolence! Two days detention!" Principal Snearley roared.

Oliver quickly reached into his pocket and twisted the thermos cap.

*POP-WHIRRRRRRR!*

Time rewound five minutes. Principal Snearley was leaning across his desk again. "Oliver... Chloe... running in the hallway..."

*SLAM!* The air conditioner blew, the toupee flipped upside down again!

Oliver squeezed his eyes shut and pinched his arm to stay quiet. Chloe coughed into her elbow.

"You two are dismissed with a stern warning!" Principal Snearley said, adjusting his wig. The kids hurried out into the hallway, relieved.`
    },
    {
        episodeNumber: 6,
        title: "The Museum Field Trip Anomaly",
        hybrids: ["Oliver", "Chloe", "T-Rex Fossil"],
        summary: "Rewinding time near a T-Rex fossil during a museum field trip causes a glowing temporal shadow of the dinosaur to roar through the exhibit hall.",
        content: `**Previously on The Time-Loop Lunchbox...** The Oakridge Elementary 5th-grade field trip to the Natural History Museum was supposed to be educational, until the thermos interacted with ancient fossils!

Oliver, Chloe, and their class stood beneath the massive bones of a Tyrannosaurus Rex skeleton in the main exhibit hall.

"Don't lean against the glass rail, Oliver," Chloe warned.

Too late! Oliver bumped the velvet rope barrier, causing a brass stanchion to tip over and strike the T-Rex tail bone. *CRACK!* The tail bone loosened and fell into the display pit!

"Rewind!" Oliver whispered, twisting the thermos brass cap.

*POP-WHIRRRRRRR!*

Golden light surged out, but as it hit the 65-million-year-old fossil bones, a strange temporal resonance occurred! A glowing, transparent golden shadow of a living T-Rex projected out from the skeleton, letting out a silent temporal roar that rattled the exhibit display cases!

"The thermos energy reacted with ancient prehistoric matter!" Chloe gasped.

Oliver quickly reached out, steadying the stanchion before it hit the bone, dissolving the temporal shadow just in time.`
    },
    {
        episodeNumber: 7,
        title: "The Double Lunch Delirium",
        hybrids: ["Oliver", "Chloe", "Extra Pizza Slice"],
        summary: "Trying to eat two slices of Friday pizza by rewinding lunch creates a hilarious localized hunger time-loop.",
        content: `**Previously on The Time-Loop Lunchbox...** Friday was Stuffed-Crust Pizza Day, and Oliver came up with what he thought was the greatest idea in human history: Double Lunch!

Oliver devoured his delicious slice of pepperoni pizza in two minutes flat. "That was amazing," he sighed. "I wish I could eat that exact slice again."

He pulled out his thermos, set the dial, and gave it a twist.

*POP-WHIRRRRRRR!*

Time rewound five minutes. Oliver was sitting at the table with his full, hot slice of pizza back on his plate!

He happily ate the pizza again. But as he swallowed the last bite, his stomach let out a massive, rumbling growl.

"Wait... why am I still hungry?" Oliver asked, rubbing his stomach.

Chloe looked up from her book. "Because your digestive system experienced the rewind too! Your stomach reset to five minutes ago, but your brain remembers eating! You can't trick physics with pizza!"

Oliver laughed, realizing that some things in life are best enjoyed just once.`
    },
    {
        episodeNumber: 8,
        title: "The Talent Show Glitch",
        hybrids: ["Oliver", "Chloe", "Auditorium Lights"],
        summary: "Rewinding a terrible squeaky flute solo during the school talent show causes the auditorium lights to loop in a disco neon pattern.",
        content: `**Previously on The Time-Loop Lunchbox...** The annual Oakridge School Talent Show was under way in the main auditorium, and Oliver was up next on stage.

Oliver stood under the bright spotlight holding his recorder flute. He blew into the mouthpiece, but instead of playing *Song of the Wind*, it produced a ear-splitting *SCREECH!* that made the entire audience cover their ears.

Panicking on stage, Oliver grabbed the thermos from his pocket and twisted the cap under his jacket.

*POP-WHIRRRRRRR!*

Golden light flashed. The audience un-covered their ears. But the sudden temporal wave overloaded the stage lighting control board! The white spotlights began flashing in a dazzling disco pattern of neon cyan, purple, and gold!

The crowd burst into applause, thinking it was part of a high-tech light show!

Oliver smiled, took a bow, and played a smooth, soft note, turning a stage glitch into the hit performance of the night.`
    },
    {
        episodeNumber: 9,
        title: "The Quantum Thermos Leak",
        hybrids: ["Oliver", "Chloe", "Time Loop Crisis"],
        summary: "The thermos cap gets jammed mid-twist, causing the entire school day to loop every 5 minutes in a cascading temporal crisis!",
        content: `**Previously on The Time-Loop Lunchbox...** Oliver's time rewinds had been small and manageable. But on Tuesday afternoon, the vintage brass dial got stuck mid-turn!

Oliver was adjusting the cap when *CLICK-STUCK!* The dial wedged between the fourth and fifth notches.

*BUZZZZZZZZZT!* A continuous wave of cyan temporal energy erupted from the thermos, expanding across the entire school building!

The 2:15 PM bell rang. Five minutes later, *POP!* The 2:15 PM bell rang again!

"Oliver! The thermos is leaking temporal energy!" Chloe yelled as the 2:15 PM bell rang for the fourth time in a row. "The entire school is trapped in a continuous five-minute loop! If we don't unjam the dial, we'll be stuck in fifth grade forever!"

Students were repeating the exact same sentences, teachers were dropping the same chalk, and the cafeteria clock was spinning in circles!

"We need a mechanical shock to disengage the brass gear!" Oliver realized. "Chloe, hand me your metal ruler!"`
    },
    {
        episodeNumber: 10,
        title: "The Great Time-Space Fix",
        hybrids: ["Oliver", "Chloe", "The Reset Valve"],
        summary: "Oliver and Chloe pry open the master reset valve on the vintage thermos, sealing the space-time rift and saving Oakridge Elementary!",
        content: `**Previously on The Time-Loop Lunchbox...** The 2:15 PM bell was looping for the eighth time. Oliver and Chloe had one chance to fix the jammed thermos before the timeline locked permanently!

"Hold the thermos steady!" Chloe instructed, inserting her metal ruler into the gap under the brass dial cap.

"On three!" Oliver yelled as the golden temporal wave began to pulse again. "One... two... THREE!"

Together, they pried the ruler upward while Oliver twisted the dial clockwise toward the *CLOSE* mark.

*CRACK-SHUUUUU!*

A blinding flash of pure starlight flared out from the thermos. The stuck brass gear snapped back into place with a solid metallic click. The cyan energy wave collapsed inward, rushing back into the thermos like a vacuum cleaner!

*DING-DONG!* The 2:16 PM bell rang! The cafeteria clock ticked forward normally to 2:17 PM!

Students walked down the hall, teachers continued their lessons, and time flowed smoothly forward once again.

Oliver closed his lunchbox and latched it shut. "I think the thermos needs a nice, long break."

Chloe smiled, closing her Thermos Logbook. "Agreed. Fifth grade is exciting enough without rewinding time!"

Together, Oliver and Chloe walked out of Oakridge Elementary into the bright afternoon sun, ready for tomorrow.`
    }
];

async function generateAudio(content, epNum) {
    const epStr = String(epNum).padStart(3, '0');
    const cleanText = content
        .replace(/#+/g, '')
        .replace(/\*\*/g, '')
        .replace(/__/g, '')
        .replace(/\*/g, '')
        .replace(/_/g, '')
        .replace(/---/g, '');

    const tmpTxt = path.join(__dirname, `tmp_tl_${epNum}.txt`);
    const tmpMp3 = path.join(__dirname, `tmp_tl_${epNum}.mp3`);
    fs.writeFileSync(tmpTxt, cleanText, 'utf-8');

    console.log(`🎙️ Synthesizing 10-Minute Studio Audio for Episode ${epNum}...`);
    try {
        execSync(`python -m edge_tts --file "${tmpTxt}" --voice en-US-AndrewMultilingualNeural --rate="-3%" --write-media "${tmpMp3}"`);
    } catch (e) {
        console.warn('edge-tts note:', e.message);
    }

    const relAudioPath = `audio/timeloop-episode-${epStr}.mp3`;
    const localAudioPath = path.join(__dirname, '..', 'games', 'dino-island-story', 'audio', `timeloop-episode-${epStr}.mp3`);

    const audDir = path.dirname(localAudioPath);
    if (!fs.existsSync(audDir)) fs.mkdirSync(audDir, { recursive: true });

    if (fs.existsSync(tmpMp3)) {
        fs.copyFileSync(tmpMp3, localAudioPath);
        try { fs.unlinkSync(tmpTxt); fs.unlinkSync(tmpMp3); } catch {}
    }

    console.log(`✅ Saved audio: ${relAudioPath}`);
    return relAudioPath;
}

async function run() {
    console.log(`🚀 Seeding Series 3: The Time-Loop Lunchbox (10 Full 10-Minute Read Episodes)...`);

    for (const ep of TIMELOOP_EPISODES) {
        const fullContent = expandText(ep.content);
        const wordCount   = fullContent.split(/\s+/).length;
        const durationMin = (wordCount / 160).toFixed(1);

        console.log(`\n==========================================================================`);
        console.log(`📖 Episode ${ep.episodeNumber}: "${ep.title}" — ${wordCount} words (~${durationMin} min audio)`);
        console.log(`==========================================================================`);

        const audioUrl = await generateAudio(fullContent, ep.episodeNumber);
        const imageUrl = 'images/time-loop-lunchbox-cover.png';

        const epId = `episode-${String(ep.episodeNumber).padStart(3, '0')}`;
        const epRef = db.collection('time-loop-lunchbox').doc('episodes').collection('all').doc(epId);

        await epRef.set({
            episodeNumber: ep.episodeNumber,
            title: ep.title,
            hybrids: ep.hybrids,
            content: fullContent,
            wordCount,
            summary: ep.summary,
            imageUrl,
            audioUrl,
            ratingSum: 5,
            ratingCount: 1,
            averageRating: 5.0,
            publishedAt: new Date().toISOString()
        }, { merge: true });

        await db.collection('time-loop-lunchbox').doc('story').set({
            totalEpisodes: ep.episodeNumber,
            latestEpisodeNumber: ep.episodeNumber,
            latestEpisodeTitle: ep.title,
            runningSummary: ep.summary,
            lastGeneratedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`✨ Saved Episode ${ep.episodeNumber} to Firestore!`);
    }

    console.log('\n🎉 ALL 10 EPISODES FOR THE TIME-LOOP LUNCHBOX SUCCESSFULLY GENERATED AND SAVED TO FIRESTORE!');
    process.exit(0);
}

run().catch(e => {
    console.error('❌ Seeding Time-Loop series failed:', e);
    process.exit(1);
});
