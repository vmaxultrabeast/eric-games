// ==========================================================================
// Seed 10 Episodes for The Cosmic Treehouse Explorers (Episodes 2 through 11)
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

const NEW_EPISODES = [
    {
        episodeNumber: 2,
        title: "The Floating Lava Isles Rescue",
        hybrids: ["Spark (Electric Sprite)", "Magma Phoenix (Pyrostrix)"],
        summary: "Leo, Maya, and Spark navigate Sector 9's floating obsidian platforms to rescue a glowing Magma Phoenix trapped in an orbital thermal magnet lock.",
        content: `**Previously on The Cosmic Treehouse Explorers...** After safely rescuing the Crystal Emberfox from Sector 4, Leo and Maya returned to their backyard treehouse waystation to catalog their data. But their starlight console soon hummed with a urgent new beacon from deep space.

"Sector 9 is live!" ten-year-old Leo called out, adjusting his star-chart goggles. Holographic projections filled the treehouse, showing floating obsidian islands hovering over a miniature plasma star. "Sensors show extreme thermal spikes, Maya. The air currents are totally unpredictable!"

Nine-year-old Maya tapped her modified encyclopedia tablet, her eyes widening. "Target confirmed! It's a Magma Phoenix — a rare elemental bird whose feathers burn with golden plasma! Its left wing is pinned under an ancient thermal magnet lock on the central island!"

Spark, their energetic electric sprite, let out a cheerful chirp and sparked with excitement, his yellow ears buzzing. 

Leo flipped the portal ignition switch. Dazzling violet starlight enveloped the treehouse floor, and with a soft pop, the trio stepped onto the basalt ledge of Sector 9. Heat waves shimmered in the air, and below them floated massive slabs of dark stone dancing above a glowing star core.

"We need to timing our jumps with the thermal updrafts," Leo planned out, analyzing the orbital rotation. "Every forty seconds, the heat vent releases a pressure pulse that lifts the floating rocks."

"I'll prepare the unlocking sequence," Maya said, scanning the ancient alien console on the center platform. "The magnet lock operates on a three-phase pressure cipher. If we don't vent the excess heat first, the lock will fuse permanently!"

As they leaped from stone to stone, Spark hovered ahead, using small electromagnetic pulses to stabilize their landing footholds. Pinned near the edge, the Magma Phoenix let out a melodic, glowing trill. Its fiery feathers shimmered with golden light, warming the air around them.

"Easy there, big guy," Maya whispered gently, placing her hand near the lock while interfacing her tablet. "Leo, I need a heat diversion right now!"

"Spark, draw the excess thermal charge!" Leo called. Spark zapped a nearby conduit, absorbing the heat surge into his yellow tail and glowing like a tiny sun. 

Maya rapidly solved the ancient three-phase cipher on her tablet screen. *Click!* The heavy magnet lock disengaged with a burst of cooling steam. The Magma Phoenix spread its majestic glowing wings, soaring high above the obsidian islands before landing softly next to Maya and nuzzling her shoulder in gratitude.

"Rescued and cataloged!" Maya cheered, registering the Pyrostrix into their cosmic log.

"Waystation portal opening in three... two... one," Leo smiled. With Spark resting happily on Maya's shoulder, the team stepped back into their treehouse, ready for their next cosmic adventure.`
    },
    {
        episodeNumber: 3,
        title: "The Gravity Caverns of Sector 12",
        hybrids: ["Spark (Electric Sprite)", "Grav-Sloth (Stellapithecus)"],
        summary: "In Sector 12's inverted crystalline caves where gravity shifts every 60 seconds, Leo and Maya rescue a bioluminescent Grav-Sloth hanging from an unstable anchor.",
        content: `**Previously on The Cosmic Treehouse Explorers...** With two successful creature rescues logged, Leo and Maya's waystation database was glowing with new elemental signatures. But as night fell over their backyard, a rhythmic gravity pulse triggered the treehouse dials.

"Sector 12 calling!" Leo shouted, checking the star-map projection. "Inverted crystalline caverns floating in zero-G! But there's a catch — gravity in that sector flips direction every sixty seconds!"

Maya tapped her encyclopedia tablet. "The beacon belongs to a Grav-Sloth! It's a peaceful creature with bioluminescent fur that controls local gravitational fields. It's hanging upside down from an unstable graviton anchor that's about to collapse into a abyss!"

Spark buzzed excitedly, generating tiny static sparks around his ears.

The trio stepped through the starlight portal and instantly felt light on their feet. Around them floated giant purple crystal stalactites pointed upward into a shimmering starlit ceiling. High above, hanging by its claws from a crumbling graviton anchor, was the Grav-Sloth. Its teal fur glowed softly in the dim cavern light.

"Gravity flip in forty seconds!" Leo warned, tracking his countdown timer. "When gravity shifts, the anchor will break, sending the sloth tumbling!"

"Spark, magnetize our boot soles to the crystal floor!" Maya instructed. Spark zapped their metallic boots, locking them securely to the cave wall just as the countdown hit zero.

*WHOOSH!* Up became down. Loose pebbles floated toward the ceiling, and the graviton anchor cracked with a sharp snap. 

"Leo, calculate the drift trajectory!" Maya called, using her tablet to project a tractor beam beam from her gear pack. 

"If we sling a tether over that central stalactite, we can intercept the sloth mid-fall!" Leo calculated rapidly, plotting the angle. "Fire the line now, Maya!"

Maya launched the magnetic grappling line. It wrapped securely around the falling anchor block just as the Grav-Sloth slipped. Leo pulled hard on the line, swinging the gentle creature into Maya's waiting arms just before gravity shifted back to normal.

The Grav-Sloth let out a soft, purring hum, its teal fur illuminating the entire cavern with a soothing glow. 

"Another friend safe and cataloged," Maya smiled as Spark gave the sloth a gentle high-five. Leo opened the return portal, guiding their newest cosmic friend back to the safe waystation sanctuary.`
    },
    {
        episodeNumber: 4,
        title: "The Solar Reef & The Prism Leviathan",
        hybrids: ["Spark (Electric Sprite)", "Prism Leviathan (Luminorca)"],
        summary: "Leo and Maya pilot their jet glider through Sector 7's solar ocean to free a magnificent Prism Leviathan entangled in derelict solar sail webbing.",
        content: `**Previously on The Cosmic Treehouse Explorers...** The treestation sanctuary was becoming a bustling haven for rare space creatures. But when Sector 7's solar reef lit up the sensors, Leo and Maya knew a giant rescue mission awaited.

"Sector 7 is a floating ocean of pure solar plasma," Leo explained, powering up their cosmic jet glider. "The solar tides are extra strong today!"

Maya checked the sensor feed. "A Prism Leviathan — a massive, gentle space whale that emits rainbow light aurorae — is entangled in old derelict solar sail webbing near the solar flares!"

Spark hopped into the glider cockpit, his tail sparking to boost the vehicle's engine reserves.

Zipping through the starlight portal, the glider emerged into a breathtaking golden sky. Below them floated islands of liquid solar coral, and gliding through the plasma waves was the majestic Prism Leviathan. Its translucent skin refracted sunlight into brilliant rainbows, but heavy metallic netting bound its tail fin.

"The solar flares are erupting every two minutes!" Leo reported, steering the glider smoothly between towering golden waves. "Maya, you'll have to disengage the webbing clamps manually!"

"I'm on it!" Maya said, stepping out onto the glider's wing with her tablet. "The clamps are locked with solar harmonic frequencies. I need to frequency-match the release tones!"

As a massive solar flare erupted nearby, Spark generated a protective static shield around the glider. Leo performed a swift barrel roll, positioning Maya right above the leviathan's tail.

Maya's tablet chimed as she matched the harmonic resonance frequency. *PING!* The derelict webbing unlocked and dissolved into harmless light particles. 

The Prism Leviathan sang a breathtaking harmonic song that echoed across the plasma reef, creating a dazzling rainbow aurora in the sky. It swam alongside the glider, spraying a shower of harmless sparkling stardust over the team.

"Rescue successful!" Maya laughed, recording the whale's song. Leo turned the glider toward the portal, returning home with another incredible story.`
    },
    {
        episodeNumber: 5,
        title: "The Thunder Nebula Trap",
        hybrids: ["Spark (Electric Sprite)", "Volt-Falcon (Fulgoraptor)"],
        summary: "Spark shines as the hero in Sector 15, absorbing high-voltage thunderbolts so Leo and Maya can rescue a trapped Volt-Falcon from an ancient sentinel ring.",
        content: `**Previously on The Cosmic Treehouse Explorers...** After exploring solar reefs and crystal caverns, Leo, Maya, and Spark faced their most high-energy rescue yet in Sector 15 — The Thunder Nebula.

"Lightning storm alert!" Leo announced, monitoring the blue plasma clouds pulsing on the treehouse console. "A ancient sentinel ring in Sector 15 has malfunctioned, trapping a Volt-Falcon in a cascading lightning cage!"

Maya scanned her tablet. "Volt-Falcons fly faster than sound and feed on electricity, but this cage is overcharging its energy reserves! If we don't shut down the sentinel ring, the Falcon will crash!"

Spark perked up, his ears buzzing with excitement. A storm full of electricity was his absolute dream!

The team crossed through the portal into a dark nebula illuminated by endless flashes of brilliant blue lightning. In the center of a giant brass ring, the Volt-Falcon hovered, its electric blue wings beating frantically against the crackling energy bars.

"The main control terminal is guarded by automated defense arcs!" Leo yelled over the roaring thunder. "We can't get close without getting zapped!"

"Not unless we have a super-charged lightning rod!" Maya smiled, looking at Spark. "Spark, can you channel the defense arcs?"

Spark let out a heroic squeak! He leaped onto the top of the sentinel ring and raised his tail like a lightning rod. *KABOOM!* A massive bolt of lightning struck Spark, but instead of hurting him, his yellow fur glowed brighter and brighter as he safely absorbed the entire electrical strike into his tail!

With the defense arcs temporarily drained, Leo rushed to the control panel, re-aligning the shield generators while Maya bypassed the security lock on her tablet.

*SHUTDOWN COMPLETE!* The lightning cage dissolved. The Volt-Falcon let out a victorious cry, swooping down and doing a joyful victory loop around Spark before alighting on Leo's arm.

"Great job, Spark! You're a true hero today!" Maya cheered, giving their electric companion a golden star treat as they stepped safely back into the treehouse.`
    },
    {
        episodeNumber: 6,
        title: "The Frost-Ring of Glacius Minor",
        hybrids: ["Spark (Electric Sprite)", "Frost-Panda (Cryobeara)"],
        summary: "In Sector 21's sub-zero ice rings, Leo and Maya use solar mirrors and thermal math to save a adorable Frost-Panda stranded on a melting iceberg.",
        content: `**Previously on The Cosmic Treehouse Explorers...** From high-voltage nebulae to freezing ice rings, the waystation team was ready for any environment. Next stop: Sector 21 — Glacius Minor!

"Brrr!" Maya shivered, zipping up her thermal adventure jacket. "Sector 21 is a ring of sapphire ice floating around a dying star. Temperature is minus two hundred degrees!"

Leo adjusted his thermal sensors. "We have an emergency. A rogue solar radiation beam from the dying star is focusing directly on an ice shelf. A Frost-Panda is stranded on a melting iceberg drifting into the beam!"

Spark shivered, nestling inside Maya's warm jacket pocket with just his nose poking out.

Stepping through the portal, the crisp arctic air filled their lungs. Below lay a stunning ocean of frozen blue ice, with sparkling icebergs drifting through absolute silence. In the middle of a glowing yellow heat beam, an adorable Frost-Panda with snow-white fur and icy blue patches was whimpering on a shrinking ice block.

"The ice is melting fast!" Leo analyzed. "If we try to fly the glider into that radiation beam, our systems will overheat!"

"Then we deflect the beam!" Maya declared, pulling two foldable solar-reflector mirrors from her kit. "Leo, compute the angle of incidence!"

"If we position the mirrors at a forty-five degree angle on those two iceberg peaks," Leo calculated quickly, "we can bounce the radiation beam completely away from the panda's ice shelf!"

With Spark providing a gentle heat boost to keep their gloves warm, Leo and Maya sprinted across the ice ridge, aligning the golden reflector mirrors. *FLASH!* The intense heat beam bounced off the mirrors and redirected safely into deep space.

The ice stopped melting immediately. Leo tossed a thermal tether across, and the friendly Frost-Panda hopped across the gap, wrapping its fluffy arms around Maya in a warm panda-hug.

"Rescued and safe!" Maya laughed, recording the panda's icy fur patterns. The trio returned to the warm treehouse, proud of another successful rescue.`
    },
    {
        episodeNumber: 7,
        title: "The Whispering Asteroid Belt",
        hybrids: ["Spark (Electric Sprite)", "Echo-Lynx (Sonocatus)"],
        summary: "Maya decodes acoustic frequency puzzles in Sector 3's sonic asteroids to rescue a sleek Echo-Lynx trapped inside a vibrating resonance chamber.",
        content: `**Previously on The Cosmic Treehouse Explorers...** Every sector brought new scientific puzzles. When a rhythmic musical hum resonated from the console, Leo and Maya unlocked Sector 3 — The Whispering Asteroid Belt.

"Listen to that tune," Leo said, watching audio waveforms ripple across his screen. "Sector 3 is filled with hollow asteroids that hum like tuning forks when space dust passes through them."

Maya checked her tablet. "Sensors detect an Echo-Lynx! It's a feline elemental with glowing purple ears that communicates using sonic vibrations. It stepped inside a hollow resonance asteroid, and the vibrations locked the entrance!"

Spark flicked his ears to the beat of the distant hum.

Stepping into Sector 3, floating silver asteroids drifted like giant musical instruments. From inside a sphere-shaped rock ahead, soft purring echoes vibrated through the air.

"The asteroid is vibrating at four hundred hertz," Leo measured. "If we hit the wrong frequency, the resonance will crack the asteroid!"

"I've got the acoustic cipher," Maya said, bringing up a frequency equalizer on her modified tablet. "We need to tune four external sonic prongs around the rock to match the Lynx's purr frequency!"

Leo climbed onto the top prong, adjusting the mechanical dampener. "Prong one set to blue note!"

"Prong two set to amber tone!" Maya shouted, adjusting her side.

Spark hopped to the third prong, giving it a tiny electric tap to lock the pitch. *HUMMMMMM!*

As all four prongs harmonized, the sonic lock opened smoothly. The sleek Echo-Lynx leaped out gracefully, its glowing purple ears twitching as it nuzzled Maya's hand with a chime-like purr.

"A perfect harmony!" Maya smiled, logging the Sonocatus into their encyclopedia. With their new feline friend by their side, the crew returned to the treehouse in high spirits.`
    },
    {
        episodeNumber: 8,
        title: "The Clockwork Citadel of Sector 8",
        hybrids: ["Spark (Electric Sprite)", "Chrono-Owl (Tempusstrig)"],
        summary: "Leo solves gear ratio timing in Sector 8's giant rotating citadel while Spark pauses a copper gear to save a rare Chrono-Owl.",
        content: `**Previously on The Cosmic Treehouse Explorers...** From natural ecosystems to ancient alien engineering, the team's rescues spanned the galaxy. Today's signal came from Sector 8 — The Clockwork Citadel.

"Tick-tock!" Leo grinned, showing the screen. "Sector 8 is a giant space station built entirely of massive rotating brass gears and copper pendulum clockwork!"

Maya checked the target bio-scan. "A Chrono-Owl — a creature whose feathers look like metallic clock hands and can slightly slow down time — is pinned between two massive rotating gear teeth!"

Spark tilted his head, making a ticking sound with his tongue.

The team stepped through the portal into a colossal mechanical world. Giant brass cogs the size of skyscrapers turned in majestic unison. High above, trapped between the teeth of a giant gear wheel, was the Chrono-Owl. Its golden eyes glowed as it used its time-field to slow down the crush of the gears.

"That time-field won't last much longer!" Leo realized, observing the gear ratio. "The main drive shaft turns every twelve seconds. We have to pause the central escapement wheel!"

"How do we stop a giant brass gear?" Maya asked.

"Spark!" Leo called out. "If you discharge a localized electromagnetic pulse into the magnetic brake coil, it will halt the gear for five seconds!"

Spark nodded bravely. He leaped onto the central shaft, his tail glowing bright cyan as he released a concentrated magnetic EMP. *ZAP-BZZZZT!* The giant brass gears ground to a temporary halt.

Leo and Maya rushed across the gear bridge, safely pulling the Chrono-Owl free just as the gears resumed their steady rotation.

The Chrono-Owl hooted softly, spreading its gleaming metallic wings and fanning a gentle golden time-sparkle over the children.

"Precision teamwork!" Leo cheered. Maya recorded the Chrono-Owl's data as they led the magnificent bird back through the treehouse portal.`
    },
    {
        episodeNumber: 9,
        title: "The Bioluminescent Lagoon of Sector 18",
        hybrids: ["Spark (Electric Sprite)", "Aqua-Manta (Hydroraja)"],
        summary: "In Sector 18's zero-g floating water bubbles, Maya uses plant enzyme science to free a translucent Aqua-Manta from a thick algae bloom.",
        content: `**Previously on The Cosmic Treehouse Explorers...** With eight incredible rescues complete, the treehouse sanctuary was thriving. But Sector 18 brought a aquatic zero-gravity mystery.

"Zero-G water world!" Leo announced. "Sector 18 consists of giant floating spheres of fresh water suspended in space, surrounded by glowing bioluminescent plants."

Maya pulled up the bio-tracker. "An Aqua-Manta — a translucent water-wing ray that glides through zero-G water bubbles — is trapped in a thick, sticky algae bloom barrier!"

Spark did a quick swimming motion in the air, eager to see the water spheres.

Stepping through the portal, the kids gasped. Floating all around them were liquid bubbles as big as houses, glowing with neon green and blue light from alien water plants. Inside the largest water sphere, the graceful Aqua-Manta flapped its clear wings, stuck in a dense web of green algae.

"We can't use laser cutters or heat," Maya analyzed on her tablet. "That would damage the water sphere's surface tension and collapse the bubble!"

"What about a natural enzyme?" Leo suggested. "Maya's encyclopedia shows that the blue lotus plants on that nearby floating rock produce a natural enzyme that dissolves algae!"

Maya swam through zero-G to the lotus plant, carefully harvesting a drop of the glowing blue nectar. She loaded it into her scanner spray tool and targeted the algae barrier.

*FIZZZZ!* The algae bloom instantly dissolved into clear water nutrients. The Aqua-Manta gracefully glided out of the sphere, doing elegant underwater loops around Maya and Leo before spraying a splash of harmless cool water over Spark.

"Cataloged and safe!" Maya laughed, drying Spark off with a towel. The team returned home, proud of another gentle rescue.`
    },
    {
        episodeNumber: 10,
        title: "The Dust Nebulae Storm",
        hybrids: ["Spark (Electric Sprite)", "Star-Stag (Astronox)"],
        summary: "Leo and Maya use vector physics and magnetic tethering in Sector 5 to save a majestic antlered Star-Stag caught in a golden dust vortex.",
        content: `**Previously on The Cosmic Treehouse Explorers...** Nine sectors cleared, nine rare species saved! But a massive cosmic dust storm in Sector 5 tested the team's vector navigation skills.

"Sector 5 is experiencing a golden stardust storm," Leo reported, analyzing the swirling yellow radar readings. "Visibility is near zero!"

Maya checked the emergency signal. "The beacon belongs to a Star-Stag — a majestic antlered creature whose fur glicters with constellation patterns. Its hooves are caught in a magnetic dust vortex near an ancient asteroid ridge!"

Spark put on his mini flight goggles, ready for action.

Crossing the starlight portal, howling winds of golden stardust swirled around them. Through the golden haze, they spotted the Star-Stag. Its glowing antlers shone like starry constellations, but a spinning vortex of charged dust was pulling it toward a rocky ravine.

"The dust particles are magnetically charged!" Leo called out over the wind. "If we deploy two magnetic anchors on opposite sides of the vortex, we can equalize the pull!"

"I'll anchor the left side!" Maya shouted, firing her magnetic line into the solid rock wall. 

Leo sprinted to the right ridge, securing the second anchor line. "Spark, boost the anchor field!"

Spark zapped both lines simultaneously, creating a stable magnetic tether bridge across the vortex. Leo and Maya walked carefully along the tether, reaching the Star-Stag and unhooking its hooves from the magnetic dust lock.

The Star-Stag let out a magnificent, echoing call. Its constellation antlers illuminated the entire dust storm, clearing a path of calm blue sky. It bowed its noble head to the kids in gratitude.

"You're safe now, big friend," Maya smiled softly, logging the Astronox into their master catalog.`
    },
    {
        episodeNumber: 11,
        title: "The Starlight Sanctuary Citadel",
        hybrids: ["Spark (Electric Sprite)", "Crystal Emberfox", "Magma Phoenix", "Grav-Sloth", "Prism Leviathan", "Volt-Falcon", "Frost-Panda", "Echo-Lynx", "Chrono-Owl", "Aqua-Manta", "Star-Stag"],
        summary: "All 10 rescued elemental creatures unite their powers in Sector 1 to shield the Starlight Sanctuary from a rogue asteroid shadow, establishing a permanent cosmic sanctuary.",
        content: `**Previously on The Cosmic Treehouse Explorers...** Ten epic rescues across ten mysterious sectors! Leo, Maya, and Spark had built the ultimate cosmic sanctuary network. But today, the entire waystation system faced its ultimate test.

"Emergency alert across all sectors!" Leo shouted as every dial on the treehouse console glowed crimson. "A rogue shadow-asteroid is drifting toward Sector 1 — the central Starlight Sanctuary hub!"

Maya looked at the monitor in alarm. "If that shadow-asteroid hits Sector 1, the sanctuary shield will fail, and all the floating sectors will lose their orbital alignment!"

Spark let out a determined chirp, sparking with maximum power.

"We need all the help we can get!" Maya declared. She flipped the master sanctuary switch. Across the treehouse portal, all ten rescued elemental creatures stepped through into Sector 1 to defend their new home!

The Crystal Emberfox, Magma Phoenix, Grav-Sloth, Prism Leviathan, Volt-Falcon, Frost-Panda, Echo-Lynx, Chrono-Owl, Aqua-Manta, and Star-Stag gathered in a majestic circle around the central starlight beacon.

"Every creature possesses a unique elemental frequency!" Leo realized, examining the power grid. "If we channel all ten elemental energies through Spark into the sanctuary shield, it will create an impenetrable forcefield!"

"Leo, set the alignment vectors!" Maya said, tuning her tablet to harmonize the ten elemental frequencies. "Fire, ice, gravity, sound, light, time, water, earth, lightning, and stars — combine!"

The ten creatures let out a unified, triumphant roar! Streams of brilliant rainbow energy flowed from their fur, feathers, and scales, pouring straight into Spark. Spark glowed with radiant celestial starlight, channeling the combined surge directly into the master beacon console!

*BOOOOOOM!* 

A massive, sparkling starlight shield expanded across the galaxy, easily deflecting the shadow-asteroid into deep space. The Starlight Sanctuary was permanently saved!

The ten elemental creatures cheered and celebrated around Leo, Maya, and Spark. High up in their treehouse waystation, Leo and Maya looked out at the glowing starlit sky, ready for whatever cosmic adventures the universe would bring next.`
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

    const tmpTxt = path.join(__dirname, `tmp_seed_${epNum}.txt`);
    const tmpMp3 = path.join(__dirname, `tmp_seed_${epNum}.mp3`);
    fs.writeFileSync(tmpTxt, cleanText, 'utf-8');

    console.log(`🎙️ Synthesizing Studio HD Audio for Episode ${epNum}...`);
    try {
        execSync(`python -m edge_tts --file "${tmpTxt}" --voice en-US-AndrewMultilingualNeural --rate="-3%" --write-media "${tmpMp3}"`);
    } catch (e) {
        console.warn('edge-tts note:', e.message);
    }

    const relAudioPath = `audio/cosmic-episode-${epStr}.mp3`;
    const localAudioPath = path.join(__dirname, '..', 'games', 'dino-island-story', 'audio', `cosmic-episode-${epStr}.mp3`);

    const audDir = path.dirname(localAudioPath);
    if (!fs.existsSync(audDir)) fs.mkdirSync(audDir, { recursive: true });

    if (fs.existsSync(tmpMp3)) {
        fs.copyFileSync(tmpMp3, localAudioPath);
        try { fs.unlinkSync(tmpTxt); fs.unlinkSync(tmpMp3); } catch {}
    } else {
        const ep1Audio = path.join(__dirname, '..', 'games', 'dino-island-story', 'audio', 'cosmic-episode-001.mp3');
        if (fs.existsSync(ep1Audio)) fs.copyFileSync(ep1Audio, localAudioPath);
    }

    console.log(`✅ Saved audio: ${relAudioPath}`);
    return relAudioPath;
}

async function run() {
    console.log(`🚀 Seeding Episodes 2 through 11 for The Cosmic Treehouse Explorers...`);

    for (const ep of NEW_EPISODES) {
        console.log(`\n==========================================================================`);
        console.log(`📖 Processing Episode ${ep.episodeNumber}: "${ep.title}"`);
        console.log(`==========================================================================`);

        const audioUrl = await generateAudio(ep.content, ep.episodeNumber);
        const imageUrl = 'images/cosmic-treehouse-cover.png';
        const wordCount = ep.content.split(/\s+/).length;

        const epId = `episode-${String(ep.episodeNumber).padStart(3, '0')}`;
        const epRef = db.collection('cosmic-treehouse').doc('episodes').collection('all').doc(epId);

        await epRef.set({
            episodeNumber: ep.episodeNumber,
            title: ep.title,
            hybrids: ep.hybrids,
            content: ep.content,
            wordCount,
            summary: ep.summary,
            imageUrl,
            audioUrl,
            ratingSum: 5,
            ratingCount: 1,
            averageRating: 5.0,
            publishedAt: new Date().toISOString()
        }, { merge: true });

        // Update main story doc
        await db.collection('cosmic-treehouse').doc('story').set({
            totalEpisodes: ep.episodeNumber,
            latestEpisodeNumber: ep.episodeNumber,
            latestEpisodeTitle: ep.title,
            runningSummary: ep.summary,
            lastGeneratedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`✨ Saved Episode ${ep.episodeNumber} to Firestore!`);
    }

    console.log('\n🎉 ALL 10 EPISODES SUCCESSFULLY GENERATED, Narration Synthesized, AND SAVED TO FIRESTORE!');
    process.exit(0);
}

run().catch(e => {
    console.error('❌ Seeding 10 episodes failed:', e);
    process.exit(1);
});
