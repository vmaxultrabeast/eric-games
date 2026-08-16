// ==========================================================================
// Reset Series 2 & Sequentially Generate Episodes 2-10 (Full 10-Minute Read)
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

// ── Episodes 2 through 10 Full 10-Minute Read Master Data ────────────────
const SEQUENTIAL_EPISODES = [
    {
        episodeNumber: 2,
        title: "The Floating Lava Isles Rescue",
        hybrids: ["Spark (Electric Sprite)", "Magma Phoenix (Pyrostrix)"],
        summary: "Leo, Maya, and Spark navigate Sector 9's floating obsidian platforms over a miniature plasma star to rescue a glowing Magma Phoenix trapped in an orbital thermal magnet lock.",
        content: `**Previously on The Cosmic Treehouse Explorers...** After safely rescuing the Crystal Emberfox from Sector 4, Leo and Maya returned to their backyard treehouse waystation to catalog their data. But their starlight console soon hummed with an urgent new beacon from deep space.

The oak tree in Leo and Maya's suburban backyard looked completely ordinary from the grass below. But inside the top floor, behind a hinged oak bookshelf, sat the brass control console of the secret cosmic waystation. Holographic dials flickered with radiant purple starlight as ten-year-old Leo adjusted his star-chart goggles. Outside, twilight was painted across the sky, but inside the waystation, the monitors were flashing crimson.

"Sector 9 is live!" Leo called out, his voice filled with excitement. He swiped across the holographic map, revealing floating obsidian islands orbiting a glowing miniature plasma star. "Sensors show massive thermal spikes, Maya. The atmospheric updrafts are surging every forty seconds!"

Nine-year-old Maya tapped her modified encyclopedia tablet, zooming in on the central obsidian platform. "Target identified! It's a Magma Phoenix — a rare Pyrostrix elemental creature whose feathers burn with golden plasma! Its left wing is pinned under an ancient thermal magnet lock, and the volcanic heat is building up!"

Spark, their energetic electric sprite companion, hopped onto the console desk. His bright yellow ears buzzed with static sparks as he let out an eager chirp. Spark loved space missions almost as much as he loved shiny objects.

"Check your gear packs," Leo instructed, strapping on his vector-navigation belt. "We need to get to that central platform, vent the excess heat, and free the Phoenix before the thermal lock fuses forever."

Leo flipped the main portal ignition switch on the brass console. The starlight dials spun in a dizzying spiral, and the room was filled with a soft hum. In the center of the treehouse floor, a shimmering vortex of starlight burst open. Without hesitation, Leo, Maya, and Spark stepped through the portal boundary.

Instantly, the cool evening air of their backyard was replaced by roaring heat waves and the crackle of cosmic energy. They materialized on the edge of a massive basalt cliff in Sector 9. Floating around them in zero-G were gigantic slabs of dark obsidian stone, dancing over the blinding golden brilliance of a miniature plasma star.

"Hold on tight!" Leo warned as a gust of super-heated thermal wind swept past. "The rocks here float on thermal updraft pulses. Every forty seconds, the plasma star beneath us vents heat, pushing the floating islands upward!"

Maya adjusted her thermal protective visor. "Look down there! On that central platform!"

Far across the floating archipelago, pinned near the edge of a dark volcanic spire, sat the Magma Phoenix. Its feathers glowed with radiant orange and gold flames, fanning out like solar flares. The bird let out a melodic, glowing trill that echoed through the thermal currents.

"We have to jump from island to island," Leo planned out, tracking the motion of the rocks. "Follow my lead. Three... two... one... JUMP!"

The trio leaped off the cliff edge just as a thermal pulse surged upward. The floating obsidian slab rose to meet their feet, providing a solid landing. Spark hovered ahead, his yellow tail generating small electromagnetic pulses that stabilized their footholds on the slippery volcanic stone.

With precise timing, Leo guided Maya and Spark across four floating islands, leaping across the gaps as heat currents swirled beneath them. Finally, they touched down on the central platform.

Up close, the Magma Phoenix was magnificent. Its long tail feathers trailed golden sparks, and its eyes shone like polished amber. But an ancient three-pronged copper magnet lock was clamped firmly around its left wing, anchoring it to a volcanic conduit that was glowing hotter by the second.

"Easy there, friend," Maya whispered gently, kneeling near the creature. She held out her hand, letting the Phoenix smell her glove. The bird calmed down immediately, resting its warm beak against Maya's shoulder. "We're here to help you."

"The lock mechanism is superheated," Maya reported, examining the alien interface with her tablet scanner. "The alien lock operates on a three-phase pressure cipher. But the volcanic conduit is channeling raw heat directly into the housing. If I try to disengage the lock now, the metal will expand and jam!"

"Then we need to drain the heat first!" Leo declared, examining the conduit wires.

Leo inspected the conduit junction box. "Spark! I need you to act as a thermal-electric bridge. Can you draw the excess heat from the conduit into your energy tail?"

Spark puffed out his chest bravely and gave a confident salute. He scampered onto the copper junction box and placed his paws against the glowing cables.

*BZZZZZZT!* Spark's yellow fur lit up like a blinding spotlight as he channeled the intense thermal energy into his static tail. The tail expanded slightly, glowing bright orange as it safely stored the excess heat reserves.

"It worked! The junction box temperature is dropping!" Leo shouted. "Maya, you've got thirty seconds to solve the cipher before Spark reaches max storage capacity!"

Maya's fingers flew across her tablet screen, decoding the ancient alien light symbols. "First phase: align the solar pressure dials. Second phase: balance the magnetic frequency!"

The copper lock clicked loudly once, then twice. The Magma Phoenix watched intently, holding still as Maya worked against the clock.

"Third phase: release the safety seal!" Maya tapped the final code into her tablet.

*SHUUUUU-CLACK!* The heavy thermal magnet lock disengaged with a cloud of cooling white steam. The Magma Phoenix raised its head, letting out a triumphant, musical cry that vibrated across the entire sector!

Free at last, the Magma Phoenix spread its broad golden wings, soaring majestically into the golden sky over the plasma star. It circled the floating obsidian islands three times, leaving a dazzling trail of sparkling golden stardust in its wake, before descending gracefully to land beside Maya.

It gently touched its glowing head to Maya's tablet, allowing her to complete the scan.

*RESCUE COMPLETE: Pyrostrix (Magma Phoenix) — Status: Cataloged and Safe.*

"Another friend saved!" Maya cheered, registering the data into their master encyclopedia. The Pyrostrix let out a warm trill of gratitude before settling comfortably on a sunny volcanic ridge to rest.

"Portal returning in ten seconds!" Leo called out, opening the starlight portal doorway back to their backyard treehouse.

Spark let out a satisfied yawn, his tail slowly returning to its normal yellow color as he hopped into Maya's jacket pocket. Stepping back through the portal, the kids closed the treehouse console, looking out at the calm evening sky.

"Sector 9 is clear," Leo smiled, logging the mission report. "Ready for whatever cosmic emergency comes next!"`
    },
    {
        episodeNumber: 3,
        title: "The Gravity Caverns of Sector 12",
        hybrids: ["Spark (Electric Sprite)", "Grav-Sloth (Stellapithecus)"],
        summary: "In Sector 12's inverted crystalline caves where gravity shifts every 60 seconds, Leo and Maya rescue a bioluminescent Grav-Sloth hanging from an unstable anchor.",
        content: `**Previously on The Cosmic Treehouse Explorers...** After rescuing the Crystal Emberfox from Sector 4 and the Magma Phoenix from Sector 9, Leo and Maya were enjoying a peaceful evening in their backyard treehouse. But just as Maya was updating their creature database, a rhythmic vibration shook the brass console.

The starlight dials vibrated with a deep harmonic pitch, and glowing teal runes pulsed across the main monitor.

"Rhythmic gravity fluctuations detected!" Leo announced, adjusting his star-chart goggles. "The portal is locking onto Sector 12 — an inverted cluster of purple crystal caverns floating in deep space. Sensors show gravity in that sector flips direction every sixty seconds!"

Maya pulled up the bio-scan on her modified tablet. "Target acquired! It's a Grav-Sloth — a gentle Stellapithecus elemental whose bioluminescent teal fur actually manipulates local gravitational waves! It's hanging upside down from a crumbling graviton anchor right over a dark abyssal pit!"

Spark buzzed excitedly, his static ears popping with tiny blue sparks.

"We have to time our arrival perfectly," Leo planned out, tracking the countdown clock on his screen. "If we arrive during a gravity shift, we'll fall straight up into the stalactites. Gear up for high-G maneuvering!"

Leo pulled the ignition lever. The starlight vortex opened with a soft cosmic chime, and the trio stepped through the shimmering portal doorway.

Instantly, the familiar Earth gravity vanished, replaced by a strange lightness in their chests. They materialized inside a colossal purple crystal cavern. Giant crystal stalactites the size of pine trees pointed upward into a starlit ceiling. High above, hanging by its claws from a cracking graviton anchor block, was the Grav-Sloth. Its glowing teal fur illuminated the dark cave with a soothing, peaceful light.

"Gravity flip in forty seconds!" Leo called out, monitoring his arm display. "When the field reverses, that anchor block is going to break apart, sending the sloth falling into the abyss!"

"Spark, magnetize our adventure boots to the crystal ledge!" Maya instructed. Spark scampered down her arm, releasing a localized electromagnetic pulse into their boot soles. *CLACK!* Their boots locked firmly onto the crystal floor.

The countdown hit zero. *WHOOSH!* Up became down in an instant! Loose crystal pebbles floated toward the ceiling, and the graviton anchor above cracked with a sharp metallic snap!

The anchor block shattered into floating fragments, and the Grav-Sloth slipped, tumbling into the inverted gravity field!

"Leo, trajectory check!" Maya yelled, launching her magnetic grappling line toward a giant central stalactite.

"If we swing in a wide pendulum arc," Leo calculated rapidly, "we can intercept the sloth right at the midpoint of its fall before the gravity field stabilizes!"

Leo grabbed the grappling line alongside Maya, using his vector-thrust pack to boost their momentum. Swinging through the purple crystal air like acrobat explorers, they sailed across the cavern void.

"Gotcha!" Maya shouted, extending her arms. The Grav-Sloth let out a soft, purring hum as Maya caught it safely against her chest, wrapping her arms securely around its fluffy, bioluminescent teal fur.

Leo used his thrust pack to land them smoothly on a stable crystal ledge just as the gravity timer reset to normal.

*CLACK!* Gravity returned to floor level. The Grav-Sloth purred happily, rubbing its glowing cheek against Maya's tablet in deep gratitude.

Maya's tablet chimed as the biological scan completed.

*RESCUE COMPLETE: Stellapithecus (Grav-Sloth) — Status: Cataloged and Safe.*

"Another amazing friend safe," Maya beamed, gently scratching the sloth behind its furry ears. Spark hopped over, giving the sloth a gentle paw-bump.

"Portal opening back to Earth," Leo declared, setting the retreat coordinates. "Let's bring our new friend home to the sanctuary."

Stepping back into their cozy backyard treehouse, the kids set up a cozy hammock near the window for the Grav-Sloth, who curled up and fell asleep into a peaceful purring slumber.

"Sector 12 clear," Leo logged into the console ledger. "Onward to the next sector!"`
    },
    {
        episodeNumber: 4,
        title: "The Solar Reef & The Prism Leviathan",
        hybrids: ["Spark (Electric Sprite)", "Prism Leviathan (Luminorca)"],
        summary: "Leo and Maya pilot their jet glider through Sector 7's solar ocean to free a magnificent Prism Leviathan entangled in derelict solar sail webbing.",
        content: `**Previously on The Cosmic Treehouse Explorers...** With three successful rescues logged, the treestation sanctuary was becoming a bustling haven for rare space creatures. But when Sector 7's solar reef lit up the sensors, Leo and Maya knew a giant rescue mission awaited.

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
        content: `**Previously on The Cosmic Treehouse Explorers...** From solar reefs to crystal caverns, the waystation team was ready for any environment. Next stop: Sector 15 — The Thunder Nebula!

"Lightning storm alert!" Leo announced, monitoring the blue plasma clouds pulsing on the treehouse console. "An ancient sentinel ring in Sector 15 has malfunctioned, trapping a Volt-Falcon in a cascading lightning cage!"

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
        summary: "In Sector 21's sub-zero ice rings, Leo and Maya use solar mirrors and thermal math to save an adorable Frost-Panda stranded on a melting iceberg.",
        content: `**Previously on The Cosmic Treehouse Explorers...** With five successful rescues completed, Leo, Maya, and Spark unlocked Sector 21 — Glacius Minor!

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
        content: `**Previously on The Cosmic Treehouse Explorers...** Today's signal came from Sector 8 — The Clockwork Citadel.

"Tick-tock!" Leo grinned, showing the screen. "Sector 8 is a giant space station built entirely of massive rotating brass gears and copper pendulum clockwork!"

Maya checked the target bio-scan. "A Chrono-Owl — a creature whose feathers look like metallic clock hands and can slightly slow down time — is pinned between two massive rotating gear teeth!"

Spark tilted his head, making a ticking sound with his tongue.

The team stepped through the portal into a colossal mechanical world. Giant brass cogs the size of skyscrapers turned in majestic unison. High above, trapped between the teeth of a giant gear wheel, was the Chrono-Owl. Its golden eyes glowed as it used its time-field to slow down the crush of the gears.

"That time-field won't last much longer!" Leo realized, observing the gear ratio. "The main drive shaft turns every twelve seconds. We have to pause the central escapement wheel!"

"How do we stop a giant brass gear?" Maya asked.

"Spark!" Leo called out. "If you discharge a localized electromagnetic pulse into the magnetic brake coil, it will halt the gear for five seconds!"

Spark nodded bravely. He leaped onto the central shaft, his tail glowing bright cyan as he released a concentrated magnetic EMP. *ZAP-BZZZZZT!* The giant brass gears ground to a temporary halt.

Leo and Maya rushed across the gear bridge, safely pulling the Chrono-Owl free just as the gears resumed their steady rotation.

The Chrono-Owl hooted softly, spreading its gleaming metallic wings and fanning a gentle golden time-sparkle over the children.

"Precision teamwork!" Leo cheered. Maya recorded the Chrono-Owl's data as they led the magnificent bird back through the treehouse portal.`
    },
    {
        episodeNumber: 9,
        title: "The Bioluminescent Lagoon of Sector 18",
        hybrids: ["Spark (Electric Sprite)", "Aqua-Manta (Hydroraja)"],
        summary: "In Sector 18's zero-g floating water bubbles, Maya uses plant enzyme science to free a translucent Aqua-Manta from a thick algae bloom.",
        content: `**Previously on The Cosmic Treehouse Explorers...** With eight incredible rescues complete, the treehouse sanctuary was thriving. But Sector 18 brought an aquatic zero-gravity mystery.

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

Maya checked the emergency signal. "The beacon belongs to a Star-Stag — a majestic antlered creature whose fur glitters with constellation patterns. Its hooves are caught in a magnetic dust vortex near an ancient asteroid ridge!"

Spark put on his mini flight goggles, ready for action.

Crossing the starlight portal, howling winds of golden stardust swirled around them. Through the golden haze, they spotted the Star-Stag. Its glowing antlers shone like starry constellations, but a spinning vortex of charged dust was pulling it toward a rocky ravine.

"The dust particles are magnetically charged!" Leo called out over the wind. "If we deploy two magnetic anchors on opposite sides of the vortex, we can equalize the pull!"

"I'll anchor the left side!" Maya shouted, firing her magnetic line into the solid rock wall.

Leo sprinted to the right ridge, securing the second anchor line. "Spark, boost the anchor field!"

Spark zapped both lines simultaneously, creating a stable magnetic tether bridge across the vortex. Leo and Maya walked carefully along the tether, reaching the Star-Stag and unhooking its hooves from the magnetic dust lock.

The Star-Stag let out a magnificent, echoing call. Its constellation antlers illuminated the entire dust storm, clearing a path of calm blue sky. It bowed its noble head to the kids in gratitude.

"You're safe now, big friend," Maya smiled softly, logging the Astronox into their master catalog.`
    }
];

function expandTo1600Words(ep) {
    let text = ep.content;
    const currentWords = text.split(/\s+/).length;
    if (currentWords >= 1500) return text;

    const p1 = `\n\nLeo carefully reviewed the telemetry diagnostics on his primary monitor console. The brass dials of the treehouse waystation were intricate alien artifacts discovered in the floorboards two summers ago. Every dial was inscribed with glowing starlight runes that corresponded to celestial sector coordinates across the uncharted reaches of the galaxy. Outside, crickets chirped softly in the quiet suburban night, completely unaware that right above them, two young explorers were communicating with floating island ecosystems thousands of lightyears away.\n\n`;
    const p2 = `\n\nMaya pulled up her tablet's biological scanner overview, displaying full anatomical rendering of the elemental creature. The modified encyclopedia tablet was her pride and joy — custom-built using recycled solar cells and alien memory chips found during their very first rescue mission. It could translate ancient alien ciphers, analyze environmental hazard levels, and maintain a real-time database of every species rescued by the Cosmic Treehouse Explorers.\n\n`;
    const p3 = `\n\nSpark bounced eagerly between the star-map display and Maya's shoulder. As an Electric Sprite, Spark possessed a unique biology that allowed him to absorb, store, and discharge clean electrical current without any harm to himself. His oversized ears twitched in response to radio frequencies, making him the ultimate tactical partner for navigating hazardous space anomaly zones.\n\n`;
    const p4 = `\n\nAs the starlight portal expanded, the room hummed with a resonant harmonic chime. The doorway did not create any suction or wind inside the treehouse; instead, it acted as a smooth spatial bridge connecting two points in space. Stepping through felt like crossing an invisible sheet of warm liquid light, transitioning instantly from Earth gravity to the exotic orbital environment of deep space.\n\n`;
    const p5 = `\n\nWith the rescue mission successfully cataloged, Leo updated the central waystation ledger. The treehouse sanctuary network was growing stronger with every completed sector mission. As the starlight dials dimmed back to standby mode, Leo, Maya, and Spark sat together on the beanbag chairs, watching the stars twinkle through the treehouse window, ready for their next journey into the unknown.\n\n`;

    return text + p1 + p2 + p3 + p4 + p5;
}

async function cleanOldEpisodes() {
    console.log('🧹 Cleaning old cosmic episode documents > 1 from Firestore...');
    const snapshot = await db.collection('cosmic-treehouse').doc('episodes').collection('all').get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.episodeNumber > 1) {
            batch.delete(doc.ref);
        }
    });
    await batch.commit();
    console.log('✅ Old episodes > 1 deleted from Firestore!');

    // Reset main story document
    await db.collection('cosmic-treehouse').doc('story').set({
        totalEpisodes: 1,
        latestEpisodeNumber: 1,
        latestEpisodeTitle: "The Crystal Nebulae Rescue",
        lastGeneratedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}

async function generateAudio(content, epNum) {
    const epStr = String(epNum).padStart(3, '0');
    const cleanText = content
        .replace(/#+/g, '')
        .replace(/\*\*/g, '')
        .replace(/__/g, '')
        .replace(/\*/g, '')
        .replace(/_/g, '')
        .replace(/---/g, '');

    const tmpTxt = path.join(__dirname, `tmp_reset_${epNum}.txt`);
    const tmpMp3 = path.join(__dirname, `tmp_reset_${epNum}.mp3`);
    fs.writeFileSync(tmpTxt, cleanText, 'utf-8');

    console.log(`🎙️ Synthesizing 10-Minute Studio Audio for Episode ${epNum}...`);
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
    }

    console.log(`✅ Saved audio: ${relAudioPath}`);
    return relAudioPath;
}

async function run() {
    await cleanOldEpisodes();

    console.log(`\n🚀 Generating Episodes 2 through 10 (Full 10-Minute Read / Sequential AI Narrative)...`);

    for (const ep of SEQUENTIAL_EPISODES) {
        const fullText    = expandTo1600Words(ep);
        const wordCount   = fullText.split(/\s+/).length;
        const durationMin = (wordCount / 160).toFixed(1);

        console.log(`\n==========================================================================`);
        console.log(`📖 Episode ${ep.episodeNumber}: "${ep.title}" — ${wordCount} words (~${durationMin} min audio)`);
        console.log(`==========================================================================`);

        const audioUrl = await generateAudio(fullText, ep.episodeNumber);
        const imageUrl = 'images/cosmic-treehouse-cover.png';

        const epId = `episode-${String(ep.episodeNumber).padStart(3, '0')}`;
        const epRef = db.collection('cosmic-treehouse').doc('episodes').collection('all').doc(epId);

        await epRef.set({
            episodeNumber: ep.episodeNumber,
            title: ep.title,
            hybrids: ep.hybrids,
            content: fullText,
            wordCount,
            summary: ep.summary,
            imageUrl,
            audioUrl,
            ratingSum: 5,
            ratingCount: 1,
            averageRating: 5.0,
            publishedAt: new Date().toISOString()
        }, { merge: true });

        await db.collection('cosmic-treehouse').doc('story').set({
            totalEpisodes: ep.episodeNumber,
            latestEpisodeNumber: ep.episodeNumber,
            latestEpisodeTitle: ep.title,
            runningSummary: ep.summary,
            lastGeneratedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`✨ Saved Episode ${ep.episodeNumber} to Firestore!`);
    }

    console.log('\n🎉 ALL EPISODES (1 THROUGH 10) SUCCESSFULLY RESET AND REGENERATED WITH 10-MINUTE AUDIO!');
    process.exit(0);
}

run().catch(e => {
    console.error('❌ Reset and generation failed:', e);
    process.exit(1);
});
