// ==========================================================================
// DINO QUIZ MASTER — Core Logic & Firebase Firestore Integration
// ==========================================================================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Firebase Config (Matches Eric's Arcade)
const firebaseConfig = {
    apiKey: "AIzaSyD-placeholder",
    authDomain: "eric-arcade.firebaseapp.com",
    projectId: "eric-arcade",
    storageBucket: "eric-arcade.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef"
};

let db = null;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (e) {
    console.warn("Firestore fallback active:", e);
}

// ── Dinosaur Master Database (32 Dinosaurs) ──────────────────────────────
const DINOSAURS = [
    {
        "name": "Abelisaurus",
        "image": "images/abelisaurus.jpg",
        "type": "Theropod",
        "era": "Late Cretaceous",
        "diet": "Carnivore",
        "found": "Argentina",
        "length": "Approximately 7-9 meters (23-30 feet)",
        "fact": "We start our list of dinosaurs with Abelisaurus, a predatory theropod dinosaur of the late Cretaceous Period. Abelisaurus was a medium-sized, bipedal* dinosaur that was probably between 7 and 9 metres (23 and 29 ft.) in length."
    },
    {
        "name": "Acrocanthosaurus",
        "image": "images/acrocanthosaurus.jpg",
        "type": "Theropod",
        "era": "Early Cretaceous (around 110 million years ago)",
        "diet": "Carnivore",
        "found": "North America (especially in parts of Oklahoma, Texas, and Wyoming)",
        "length": "Up to 38 feet (11.5 meters)",
        "fact": "One of the apex predators of its time, Acrocanthosaurus was known for the distinctive ridge or spine running along its back. This ridge, which is believed to have supported a hump or fin, might have had various roles, from fat storage to thermoregulation or display."
    },
    {
        "name": "Albertosaurus",
        "image": "images/albertosaurus.jpg",
        "type": "Theropod, closely related to T. rex",
        "era": "Late Cretaceous",
        "diet": "Carnivore",
        "found": "Western North America, primarily Alberta, Canada",
        "length": "Approximately 9 meters (30 feet)",
        "fact": "Albertosaurus was a close relation of Tyrannosaurus, and was in the same family, Tyrannosauridae. Looking very much like its more famous&nbsp;relative, Albertosaurus walked on two legs, and had small arms. It would have been a fast runner, and probably sat at the very&nbsp;top of the food chain."
    },
    {
        "name": "Allosaurus",
        "image": "images/allosaurus.jpg",
        "type": "Theropod",
        "era": "Late Jurassic",
        "diet": "Carnivore",
        "found": "North America, Europe, and possibly Africa",
        "length": "Around 8.5-12 meters (28-39 feet), though there&#8217;s some variation depending on the species",
        "fact": "Allosaurus was one of the largest predators of the Jurassic Period. It would have reached lengths of around 12 metres (40 ft.), and weighed between 2 and 5 metric tonnes (2.2 and 3.3 short tons)."
    },
    {
        "name": "Amargasaurus",
        "image": "images/amargasaurus.jpg",
        "type": "Sauropod",
        "era": "Early Cretaceous (around 125 million years ago)",
        "diet": "Herbivore",
        "found": "Argentina",
        "length": "About 33 feet (10 meters)",
        "fact": "Amargasaurus stands out among sauropods due to its double row of long, upward-extending spines on its neck and back. Though their exact function is unknown, they might have supported skin sails for display, thermoregulation, or even protection."
    },
    {
        "name": "Ankylosaurus",
        "image": "images/ankylosaurus.jpg",
        "type": "Armored herbivore",
        "era": "Late Cretaceous",
        "diet": "Herbivore",
        "found": "North America",
        "length": "Around 6-8 meters (20-26 feet)",
        "fact": "Ankylosaurus was a member of a group of dinosaurs called Ankylosauria. Their name means \u2018fused together lizards\u2019 on behalf of their joined-together armoured plates."
    },
    {
        "name": "Apatosaurus",
        "image": "images/apatosaurus.jpg",
        "type": "Sauropod",
        "era": "Late Jurassic",
        "diet": "Herbivore",
        "found": "North America",
        "length": "Approximately 21-22 meters (70-72 feet)",
        "fact": "Apatosaurus was a huge sauropod dinosaur. It lived in the late Jurassic Period. It weighed between 20 and 30 metric tonnes (22 and 33 short tons), and was around 20 to 23 metres (65 and 75 ft.)&nbsp;in length."
    },
    {
        "name": "Archaeopteryx",
        "image": "images/archaeopteryx.jpg",
        "type": "Transitional fossil between non-avian dinosaurs and birds",
        "era": "Late Jurassic",
        "diet": "Herbivore",
        "found": "Southern Germany",
        "length": "About 0.5 meters (1.6 feet) including the tail",
        "fact": "If you can imagine a cross between a small dinosaur and a bird, then you&#8217;ll probably have a good idea of what Archaeopteryx looked like. It had the tooth-filled mouth and bony tail of a dinosaur, with the feathered wings of a bird. It may even have been able to fly, rather than simply glide."
    },
    {
        "name": "Argentinosaurus",
        "image": "images/argentinosaurus.jpg",
        "type": "Sauropod",
        "era": "Late Cretaceous (around 94-97 million years ago)",
        "diet": "Herbivore",
        "found": "Argentina",
        "length": "Estimates range up to 100 feet (30 meters)",
        "fact": "One of the largest land animals ever to have lived, Argentinosaurus is known from limited fossils, but its immense size is undisputed. It had a massive body, long neck, and tail, and would have moved at a slow pace, browsing on vast amounts of vegetation with its small head."
    },
    {
        "name": "Baryonyx",
        "image": "images/baryonyx.jpg",
        "type": "Theropod, spinosaurid",
        "era": "Early Cretaceous",
        "diet": "Carnivore",
        "found": "England, Spain",
        "length": "Approximately 7.5-10 meters (25-33 feet)",
        "fact": "Baryonyx was a bipedal, fish-eating dinosaur that lived in the early Cretaceous Period. Its narrow, tooth-filled snout is thought to have been similar to that of today&#8217;s gharial \u2013 a fish-eating crocodilian found in Asia."
    },
    {
        "name": "Brachiosaurus",
        "image": "images/brachiosaurus.jpg",
        "type": "Sauropod",
        "era": "Late Jurassic",
        "diet": "Herbivore",
        "found": "North America, Africa",
        "length": "About 18-26 meters (59-85 feet)",
        "fact": "This huge sauropod grew up to 25 metres (82 ft.)&nbsp;in length and weighed between 30 and 50 metric tonnes (33 and 55 short tons). It was one of the largest land animals ever. Brachiosaurus\u2019s name means \u2018arm lizard\u2019, because of the way its forelimbs joined its shoulders."
    },
    {
        "name": "Brontosaurus",
        "image": "images/brontosaurus.jpg",
        "type": "Sauropod",
        "era": "Late Jurassic (around 155 to 152 million years ago)",
        "diet": "Herbivore",
        "found": "North America (mainly in the Morrison Formation of the western U.S.)",
        "length": "Up to 72 feet (22 meters)",
        "fact": "Brontosaurus, which means &#8220;thunder lizard&#8221;, is one of the most iconic and recognizable dinosaurs due to its massive size, long neck, and lengthy tail."
    },
    {
        "name": "Carnotaurus",
        "image": "images/carnotaurus.jpg",
        "type": "Theropod",
        "era": "Late Cretaceous",
        "diet": "Carnivore",
        "found": "Argentina",
        "length": "Around 7.5-9 meters (25-30 feet)",
        "fact": "Carnotaurus was a large, fast-moving predator that walked on two legs. It was around 9 metres (30 ft.) in length, and weighed around 1.35 metric tonnes (1.5 short tons)."
    },
    {
        "name": "Ceratosaurus",
        "image": "images/ceratosaurus.jpg",
        "type": "Theropod",
        "era": "Late Jurassic (around 150 million years ago)",
        "diet": "Carnivore",
        "found": "North America and possibly Portugal",
        "length": "About 18-20 feet (5.5-6 meters)",
        "fact": "Distinguished by its large nasal horn and two smaller horns in front of its eyes, Ceratosaurus was a carnivore with sharp teeth and a long tail. It had a more slender build compared to other large theropods of its time, suggesting it might have had a different ecological niche."
    },
    {
        "name": "Chasmosaurus",
        "image": "images/chasmosaurus.jpg",
        "type": "Ceratopsian",
        "era": "Late Cretaceous (around 75-76 million years ago)",
        "diet": "Herbivore",
        "found": "North America (Canada)",
        "length": "Up to 16 feet (4.8 meters)",
        "fact": "Chasmosaurus was a four-legged herbivore with a large, ornate frill and long brow horns. Its frill was adorned with large fenestrae or holes, and it was likely used in display or defense. As a ceratopsian, it would have had a beak-like mouth for cropping vegetation."
    },
    {
        "name": "Coelophysis",
        "image": "images/coelophysis.jpg",
        "type": "Theropod",
        "era": "Late Triassic",
        "diet": "Carnivore",
        "found": "Southwestern United States, especially New Mexico",
        "length": "Approximately 3 meters (10 feet)",
        "fact": "Coelophysis is one of the earliest known dinosaurs. It lived in the late Triassic Period. Despite their great age, many Coelophysis fossils have been found."
    },
    {
        "name": "Compsognathus",
        "image": "images/compsognathus.jpg",
        "type": "Theropod",
        "era": "Late Jurassic",
        "diet": "Carnivore",
        "found": "Germany and France",
        "length": "About 1 meter (3.3 feet)",
        "fact": "At the time of writing, only two Compsognathus specimens have been discovered. The first was found in Germany in the mid-nineteenth century. The second was found in France over 100 years later, in 1971."
    },
    {
        "name": "Corythosaurus",
        "image": "images/corythosaurus.jpg",
        "type": "Hadrosaur (duck-billed herbivorous ornithopod)",
        "era": "Late Cretaceous",
        "diet": "Herbivore",
        "found": "North America (Canada \u2013 Alberta)",
        "length": "~9 metres (\u224829.5 feet)",
        "fact": "Corythosaurus was a large, plant-eating dinosaur that lived about 77 million years ago during the Late Cretaceous period. It is best known for the tall, hollow crest on its head, which may have been used to make sounds or for display."
    },
    {
        "name": "Deinonychus",
        "image": "images/deinonychus.jpg",
        "type": "Theropod, dromaeosaurid",
        "era": "Early Cretaceous",
        "diet": "Carnivore",
        "found": "Western North America",
        "length": "Around 3.4 meters (11 feet)",
        "fact": "This early Cretaceous dinosaur grew to around 3 metres (10 ft.)&nbsp;in length and weighed around 80 kg (176 lb). Its name, which means \u2018terrible claw\u2019, refers to the deadly claw found on each of its feet."
    },
    {
        "name": "Dilophosaurus",
        "image": "images/dilophosaurus.jpg",
        "type": "Theropod",
        "era": "Early Jurassic (around 193 million years ago)",
        "diet": "Carnivore",
        "found": "North America (Arizona)",
        "length": "About 20 feet (6 meters)",
        "fact": "Notable for its twin crests on its skull, Dilophosaurus is an early theropod that was likely a fast and agile predator. While popular media depicted it spitting venom, there&#8217;s no scientific evidence supporting this idea."
    },
    {
        "name": "Diplodocus",
        "image": "images/diplodocus.jpg",
        "type": "Sauropod",
        "era": "Late Jurassic",
        "diet": "Herbivore",
        "found": "North America",
        "length": "Around 25 meters (82 feet)",
        "fact": "Diplodocus, like all other sauropods, was a giant, four-legged dinosaur with a long neck and tail. It may have used its long tail as a whip for protection against predators."
    },
    {
        "name": "Edmontosaurus",
        "image": "images/edmontosaurus.jpg",
        "type": "Hadrosaurid (duck-billed dinosaur)",
        "era": "Late Cretaceous",
        "diet": "Herbivore",
        "found": "North America",
        "length": "Approximately 9-12 meters (30-40 feet)",
        "fact": "Edmontosaurus was a large herbivorous dinosaur. It was a member of the \u2018duck-billed\u2019 group of dinosaurs, so-called due to their duck-like mouths. Herds of Edmontosaurus roamed western North America in the late Cretaceous Period."
    },
    {
        "name": "Gallimimus",
        "image": "images/gallimimus.jpg",
        "type": "Ornithomimid",
        "era": "Late Cretaceous (around 70 million years ago)",
        "diet": "Herbivore",
        "found": "Mongolia",
        "length": "Up to 20 feet (6 meters)",
        "fact": "Gallimimus, with its long legs and ostrich-like build, was built for speed. It had large eyes, a long neck, and a toothless beak."
    },
    {
        "name": "Giganotosaurus",
        "image": "images/giganotosaurus.jpg",
        "type": "Theropod",
        "era": "Late Cretaceous",
        "diet": "Carnivore",
        "found": "Argentina",
        "length": "About 12-13 meters (40-43 feet)",
        "fact": "Giganotosaurus means \u2018giant southern lizard\u2019. This giant predator walked on two legs and was even bigger than Tyrannosaurus."
    },
    {
        "name": "Gorgosaurus",
        "image": "images/gorgosaurus.jpg",
        "type": "Theropod, tyrannosaurid",
        "era": "Late Cretaceous",
        "diet": "Carnivore",
        "found": "North America",
        "length": "Around 8-9 meters (26-30 feet)",
        "fact": "With a huge skull and jaws filled with sharp teeth, Gorgosaurus definitely lived up to its name, which means \u2018dreadful lizard\u2019."
    },
    {
        "name": "Herrerasaurus",
        "image": "images/herrerasaurus.jpg",
        "type": "Early theropod (carnivorous dinosaur)",
        "era": "Late Triassic",
        "diet": "Carnivore",
        "found": "South America (Argentina)",
        "length": "~4\u20136 metres (\u224813\u201320 feet)",
        "fact": "Herrerasaurus was one of the earliest known dinosaurs, living about 230 million years ago during the Late Triassic period. It was a fast, meat-eating predator with sharp teeth and long claws for catching prey."
    },
    {
        "name": "Iguanodon",
        "image": "images/iguanodon.jpg",
        "type": "Ornithopod",
        "era": "Early Cretaceous",
        "diet": "Herbivore",
        "found": "Europe, primarily Belgium and UK, but also found in other parts of the world",
        "length": "About 10 meters (33 feet)",
        "fact": "Iguanodon was the second dinosaur ever to be named. The first Iguanodon fossil was a tooth. It was discovered in England by the wife of medical doctor and geologist Dr Gideon Mantell. Mantell named the specimen Iguanodon, because the tooth resembled that of an iguana."
    },
    {
        "name": "Kentrosaurus",
        "image": "images/kentrosaurus.jpg",
        "type": "Stegosaur (armoured herbivore)",
        "era": "Late Jurassic",
        "diet": "Herbivore",
        "found": "Africa (Tanzania)",
        "length": "~4.5\u20135 metres (\u224815\u201316.5 feet)",
        "fact": "Kentrosaurus was a small, plant-eating dinosaur that lived about 150 million years ago during the Late Jurassic period. It belonged to the stegosaur group and is known for the sharp spikes covering its back and tail."
    },
    {
        "name": "Lambeosaurus",
        "image": "images/lambeosaurus.jpg",
        "type": "Hadrosaur (duck-billed herbivorous ornithopod)",
        "era": "Late Cretaceous",
        "diet": "Herbivore",
        "found": "North America (Canada \u2013 Alberta)",
        "length": "~9\u201310 metres (\u224830\u201333 feet)",
        "fact": "Lambeosaurus was a plant-eating dinosaur that lived about 75 million years ago during the Late Cretaceous period. It is famous for the large, hollow crest on its head, which may have been used for making sounds, communication, or display."
    },
    {
        "name": "Leaellynasaura",
        "image": "images/leaellynasaura.jpg",
        "type": "Small ornithopod",
        "era": "Early Cretaceous",
        "diet": "Herbivore",
        "found": "Australia",
        "length": "Approximately 2 meters (6.5 feet)",
        "fact": "This small bipedal dinosaur was just under 1 metre (3 ft.)&nbsp;in length. It was first discovered in the Australian dinosaur hotspot Dinosaur Cove."
    },
    {
        "name": "Maiasaura",
        "image": "images/maiasaura.jpg",
        "type": "Hadrosaur (duck-billed herbivorous ornithopod)",
        "era": "Late Cretaceous",
        "diet": "Herbivore",
        "found": "North America (USA \u2013 Montana)",
        "length": "~7\u20139 metres (\u224823\u201330 feet)",
        "fact": "Maiasaura was a plant-eating dinosaur that lived about 76 million years ago during the Late Cretaceous period. Its name means \u201cgood mother lizard\u201d because fossils show it cared for its young in nests. Infant Maiasaura were unable to walk at first, so parents likely brought them food."
    },
    {
        "name": "Megalosaurus",
        "image": "images/megalosaurus.jpg",
        "type": "Theropod",
        "era": "Middle Jurassic",
        "diet": "Carnivore",
        "found": "England",
        "length": "Around 6 meters (20 feet)",
        "fact": "Megalosaurus was discovered in England. It was the first dinosaur to be named. Surgeon and geologist James Parkinson identified some fossilised remains as being those of a reptile. He named it \u2018Megalosaurus\u2019, which means \u2018great lizard\u2019. This was in 1824: almost twenty years before Sir Richard Owen invented the word \u2018dinosaur\u2019!"
    },
    {
        "name": "Minmi",
        "image": "images/minmi.jpg",
        "type": "Armored herbivore, ankylosaurian",
        "era": "Early Cretaceous",
        "diet": "Herbivore",
        "found": "Australia",
        "length": "Approximately 3 meters (10 feet)",
        "fact": "Minmi was a small, heavily-armoured dinosaur of the Ankylosauria family. Its body, including its undersides, was covered with bony plates. It had longer legs than most of its relatives, suggesting that, despite being heavily armoured, it could move relatively quickly."
    },
    {
        "name": "Ornithomimus",
        "image": "images/ornithomimus.jpg",
        "type": "Theropod, ornithomimid",
        "era": "Late Cretaceous",
        "diet": "Carnivore",
        "found": "North America",
        "length": "About 3.5-4 meters (11-13 feet)",
        "fact": "Ornithomimus was an ostrich-like dinosaur. Around 3.5 metres (11.5 ft.)&nbsp;long, Ornithomimus had long legs and a long, thin neck. It would have been able to run at high speeds, possibly reaching over 40 mph (64 km/h)."
    },
    {
        "name": "Oviraptor",
        "image": "images/oviraptor.jpg",
        "type": "Theropod (oviraptorosaur, likely omnivorous)",
        "era": "Late Cretaceous",
        "diet": "Carnivore",
        "found": "Asia (Mongolia)",
        "length": "~1.5\u20132 metres (\u22485\u20136.5 feet)",
        "fact": "Oviraptor was a small, bird-like dinosaur that lived about 75 million years ago during the Late Cretaceous period. It had a toothless beak, a short skull, and likely feathers covering its body. Its name means \u201cegg thief,\u201d but scientists now believe it was actually caring for its own eggs when fossils were found."
    },
    {
        "name": "Pachycephalosaurus",
        "image": "images/pachycephalosaurus.jpg",
        "type": "Pachycephalosaur (thick-skulled herbivore/omnivore)",
        "era": "Late Cretaceous",
        "diet": "Omnivore",
        "found": "North America (USA \u2013 Montana, South Dakota)",
        "length": "~4\u20135 metres (\u224813\u201316.5 feet)",
        "fact": "Pachycephalosaurus was a plant-eating dinosaur that lived about 70 million years ago during the Late Cretaceous period. It is famous for its thick, dome-shaped skull, which could be up to 25 centimetres thick. Scientists think it may have used this dome for head-butting rivals or for display."
    },
    {
        "name": "Parasaurolophus",
        "image": "images/parasaurolophus.jpg",
        "type": "Hadrosaurid (duck-billed dinosaur)",
        "era": "Late Cretaceous",
        "diet": "Herbivore",
        "found": "North America",
        "length": "Around 9.5-10 meters (31-33 feet)",
        "fact": "Parasaurolophus was a Late Cretaceous herbivore. It was around 10 metres (33 ft.)&nbsp;in length and weighed around 3.5 metric tonnes (4 short tons)."
    },
    {
        "name": "Plateosaurus",
        "image": "images/plateosaurus.jpg",
        "type": "Sauropodomorph (early long-necked herbivore)",
        "era": "Late Triassic",
        "diet": "Herbivore",
        "found": "Europe (Germany, Switzerland, France)",
        "length": "~7\u201310 metres (\u224823\u201333 feet)",
        "fact": "Plateosaurus was a large, plant-eating dinosaur that lived about 214 million years ago during the Late Triassic period. It had a long neck and small head, which helped it reach vegetation such as leaves and plants. Plateosaurus could walk on two legs but may have used all four when feeding. It had strong, grasping hands and a long tail for balance."
    },
    {
        "name": "Protoceratops",
        "image": "images/protoceratops.jpg",
        "type": "Herbivorous ceratopsian",
        "era": "Late Cretaceous",
        "diet": "Herbivore",
        "found": "Mongolia",
        "length": "About 1.8 meters (6 feet)",
        "fact": "Protoceratops was a sheep-sized dinosaur of the late Cretaceous Period. It had jaws shaped like a parrot\u2019s bill, and a mouthful of teeth for eating tough vegetation. A frill on the back of its head may have served to protect its neck."
    },
    {
        "name": "Spinosaurus",
        "image": "images/spinosaurus.jpg",
        "type": "Theropod, spinosaurid",
        "era": "Early to mid-Cretaceous",
        "diet": "Carnivore",
        "found": "North Africa",
        "length": "Approximately 15-18 meters (49-59 feet), recent estimates suggest it might have been the largest of all known carnivorous dinosaurs",
        "fact": "Spinosaurus was a meat-eating dinosaur of the late Cretaceous Period. Growing up to 15 metres (49 ft.) in length and&nbsp;23 metric tonnes (25.35 short tons)&nbsp;in weight, it was larger than the mighty&nbsp;Tyrannosaurus Rex."
    },
    {
        "name": "Stegoceras",
        "image": "images/stegoceras.jpg",
        "type": "Pachycephalosaurid (dome-headed dinosaur)",
        "era": "Late Cretaceous",
        "diet": "Herbivore",
        "found": "North America",
        "length": "About 2 meters (6.5 feet)",
        "fact": "Stegoceras was a bipedal herbivore that lived in North America during the late Cretaceous Period. It was around 2 metres (6.5 ft.)&nbsp;in length and stood around .75m (2.5 ft.) tall."
    },
    {
        "name": "Stegosaurus",
        "image": "images/stegosaurus.jpg",
        "type": "Armored dinosaur (Thyreophoran)",
        "era": "Late Jurassic",
        "diet": "Herbivore",
        "found": "North America and Europe",
        "length": "Around 9 meters (30 feet)",
        "fact": "Stegosaurus was a large plant-eating dinosaur in the Stegosauridae family. It roamed America during the late Jurassic period."
    },
    {
        "name": "Stenonychosaurus",
        "image": "images/stenonychosaurus.jpg",
        "type": "Theropod (troodontid, likely omnivorous)",
        "era": "Late Cretaceous",
        "diet": "Carnivore",
        "found": "North America (Canada \u2013 Alberta)",
        "length": "~2.5\u20133 metres (\u22488\u201310 feet)",
        "fact": "Stenonychosaurus was a small, bird-like dinosaur that lived about 76 million years ago, during the Late Cretaceous period. It belonged to a group called troodontids and is known for its large brain relative to body size, suggesting it was quite intelligent."
    },
    {
        "name": "Suchomimus",
        "image": "images/suchomimus.jpg",
        "type": "Theropod, spinosaurid",
        "era": "Early Cretaceous",
        "diet": "Carnivore",
        "found": "Niger, Africa",
        "length": "About 11 meters (36 feet)",
        "fact": "Suchomimus was a member of the Spinosauridae family of dinosaurs, and a relative of Spinosaurus."
    },
    {
        "name": "Tarbosaurus",
        "image": "images/tarbosaurus.jpg",
        "type": "Theropod",
        "era": "Late Cretaceous (around 70 million years ago)",
        "diet": "Carnivore",
        "found": "Asia (especially Mongolia)",
        "length": "Up to 40 feet (12 meters)",
        "fact": "A close relative of Tyrannosaurus Rex, Tarbosaurus was the apex predator in its ecosystem. It had powerful jaws, sharp teeth, and tiny, almost vestigial arms. Its massive head and strong legs made it a fearsome hunter."
    },
    {
        "name": "Therizinosaurus",
        "image": "images/therizinosaurus.jpg",
        "type": "Theropod (therizinosaur, herbivorous/omnivorous)",
        "era": "Late Cretaceous",
        "diet": "Carnivore",
        "found": "Asia (Mongolia)",
        "length": "~9\u201310 metres (\u224830\u201333 feet)",
        "fact": "Therizinosaurus was a strange, plant-eating dinosaur that lived about 70 million years ago during the Late Cretaceous period. It is best known for its enormous claws, which could grow over one metre long. Despite its fearsome appearance, Therizinosaurus likely used its claws to pull down branches and defend itself."
    },
    {
        "name": "Triceratops",
        "image": "images/triceratops.jpg",
        "type": "Herbivorous ceratopsian",
        "era": "Late Cretaceous",
        "diet": "Herbivore",
        "found": "North America",
        "length": "Approximately 8-9 meters (26-30 feet)",
        "fact": "The name Triceratops means &#8216;three-horned face&#8217;. This fearsome-looking herbivore was found in western America during the late Cretaceous Period. It may have lived in herds."
    },
    {
        "name": "Troodon",
        "image": "images/troodon.jpg",
        "type": "Theropod, dromaeosaurid",
        "era": "Late Cretaceous",
        "diet": "Carnivore",
        "found": "North America",
        "length": "About 2-2.4 meters (6.5-8 feet)",
        "fact": "Troodon was a small, bird-like dinosaur of the Late Cretaceous Period. It grew to around 2 metres (6.5 ft.)&nbsp;in length, and would have stood waist-high to a man."
    },
    {
        "name": "Tyrannosaurus",
        "image": "images/tyrannosaurus.jpg",
        "type": "Theropod",
        "era": "Late Cretaceous (around 68-66 million years ago)",
        "diet": "Carnivore",
        "found": "North America",
        "length": "Up to 40 feet (12 meters)",
        "fact": "Tyrannosaurus is perhaps the most famous type of dinosaur in the world, and no list of dinosaurs would be complete without it! One species in particular, Tyrannosaurus Rex, is particularly well-known as being the archetypal \u2018killer dinosaur\u2019."
    },
    {
        "name": "Utahraptor",
        "image": "images/utahraptor.jpg",
        "type": "Dromaeosaurid",
        "era": "Early Cretaceous (around 124 million years ago)",
        "diet": "Herbivore",
        "found": "North America (Utah)",
        "length": "About 23 feet (7 meters)",
        "fact": "As a member of the raptor family, Utahraptor was a carnivorous dinosaur characterized by a large sickle-shaped claw on each foot. It was much larger than other raptors like Velociraptor. It likely used its claw to pin down prey while delivering fatal bites with its sharp teeth."
    },
    {
        "name": "Velociraptor",
        "image": "images/velociraptor.jpg",
        "type": "Theropod, dromaeosaurid",
        "era": "Late Cretaceous",
        "diet": "Carnivore",
        "found": "Mongolia and China",
        "length": "Approximately 2 meters (6.5 feet) from head to tail",
        "fact": "Velociraptor was a small, bird-like, predatory dinosaur of the late Cretaceous Period. Its name\u2013which means \u2018swift plunderer\u2019\u2013accurately describes this speedy, fierce carnivore."
    }
];

// ── Web Audio API Synthesizer ───────────────────────────────────────────────
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;

    if (type === 'click') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
    } else if (type === 'correct') {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0.2, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.2);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.2);
        });
    } else if (type === 'wrong') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    } else if (type === 'lifeline') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    } else if (type === 'fanfare') {
        const melody = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        melody.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now + idx * 0.12);
            gain.gain.setValueAtTime(0.15, now + idx * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.3);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now + idx * 0.12);
            osc.stop(now + idx * 0.12 + 0.3);
        });
    }
}

// ── SVG Dinosaur Graphic Generator ─────────────────────────────────────────
function renderDinoSVG(dino) {
    const type = dino.svgType;
    let pathContent = '';
    let accentColor = '#00f0ff';

    if (type === 'trex') {
        accentColor = '#ff073a';
        pathContent = `
            <path d="M 40 180 Q 70 120 120 100 Q 150 90 200 80 Q 240 60 270 90 Q 280 110 260 130 Q 230 140 210 135 L 230 150 L 190 155 Q 170 180 150 200 L 140 250 L 110 260 L 120 200 Q 80 210 40 180 Z" fill="url(#dinoGrad1)" stroke="${accentColor}" stroke-width="2"/>
            <circle cx="245" cy="85" r="4" fill="#fff"/>
            <path d="M 230 115 L 235 125 L 242 115 L 248 125 L 255 115" stroke="#fff" stroke-width="2" fill="none"/>
            <path d="M 180 140 Q 190 155 185 165" stroke="${accentColor}" stroke-width="4" stroke-linecap="round"/>
        `;
    } else if (type === 'triceratops') {
        accentColor = '#bd00ff';
        pathContent = `
            <path d="M 50 190 Q 80 140 140 130 Q 180 100 230 110 Q 270 120 280 160 Q 260 190 220 195 L 200 250 L 175 250 L 180 200 Q 130 205 100 240 L 75 240 L 85 190 Z" fill="url(#dinoGrad2)" stroke="${accentColor}" stroke-width="2"/>
            <path d="M 220 110 L 260 60 L 235 120" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
            <path d="M 245 130 L 285 90 L 255 140" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
            <path d="M 270 155 L 295 145 L 275 165" stroke="#fff" stroke-width="3" fill="none"/>
            <circle cx="230" cy="135" r="4" fill="#fff"/>
        `;
    } else if (type === 'stegosaurus') {
        accentColor = '#ffcc00';
        pathContent = `
            <path d="M 40 180 Q 90 140 160 140 Q 220 140 260 175 L 280 190 L 250 200 Q 200 210 160 210 Q 110 210 70 240 L 50 240 Z" fill="url(#dinoGrad3)" stroke="${accentColor}" stroke-width="2"/>
            <!-- Back plates -->
            <polygon points="90,140 105,100 120,140" fill="${accentColor}" opacity="0.8"/>
            <polygon points="130,135 150,85 170,135" fill="${accentColor}" opacity="0.9"/>
            <polygon points="180,138 200,90 220,138" fill="${accentColor}" opacity="0.9"/>
            <polygon points="225,145 240,110 255,150" fill="${accentColor}" opacity="0.8"/>
            <!-- Thagomizer spikes -->
            <line x1="40" y1="180" x2="15" y2="160" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
            <line x1="35" y1="185" x2="10" y2="180" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
        `;
    } else if (type === 'brachiosaurus') {
        accentColor = '#00f0ff';
        pathContent = `
            <path d="M 50 220 Q 90 210 120 200 L 150 70 Q 165 40 180 45 Q 190 55 175 80 L 155 190 Q 220 190 250 210 L 250 260 L 230 260 L 230 220 Q 180 220 140 220 L 140 260 L 120 260 L 120 220 Q 80 230 50 220 Z" fill="url(#dinoGrad1)" stroke="${accentColor}" stroke-width="2"/>
            <circle cx="178" cy="50" r="3" fill="#fff"/>
        `;
    } else if (type === 'spinosaurus') {
        accentColor = '#10b981';
        pathContent = `
            <path d="M 40 200 Q 80 160 140 155 Q 210 150 270 170 L 290 185 L 250 195 Q 190 205 140 200 L 120 250 L 95 250 L 105 200 Z" fill="url(#dinoGrad2)" stroke="${accentColor}" stroke-width="2"/>
            <!-- Sail -->
            <path d="M 100 160 Q 160 70 230 155 Z" fill="url(#dinoGrad1)" opacity="0.85" stroke="${accentColor}" stroke-width="2"/>
            <circle cx="265" cy="175" r="3.5" fill="#fff"/>
        `;
    } else if (type === 'ankylosaurus') {
        accentColor = '#f97316';
        pathContent = `
            <path d="M 40 180 Q 90 150 160 150 Q 230 150 270 180 L 250 210 Q 170 220 90 210 Z" fill="url(#dinoGrad3)" stroke="${accentColor}" stroke-width="2"/>
            <!-- Armor bumps -->
            <circle cx="110" cy="165" r="6" fill="${accentColor}"/>
            <circle cx="150" cy="160" r="8" fill="${accentColor}"/>
            <circle cx="190" cy="165" r="7" fill="${accentColor}"/>
            <!-- Tail Club -->
            <ellipse cx="35" cy="180" rx="14" ry="10" fill="#fff"/>
        `;
    } else if (type === 'pteranodon') {
        accentColor = '#00f0ff';
        pathContent = `
            <!-- Wings -->
            <path d="M 160 150 L 40 80 Q 100 140 160 160 L 280 80 Q 220 140 160 160 Z" fill="url(#dinoGrad1)" stroke="${accentColor}" stroke-width="2"/>
            <!-- Head crest -->
            <path d="M 160 130 L 140 90 L 165 140 L 180 150 Z" fill="${accentColor}"/>
            <circle cx="163" cy="142" r="3" fill="#fff"/>
        `;
    } else {
        // Raptor / General Theropod
        accentColor = '#bd00ff';
        pathContent = `
            <path d="M 40 210 Q 80 170 130 150 Q 180 120 230 120 L 260 135 L 220 150 Q 170 170 140 180 L 130 250 L 110 250 L 115 190 Q 70 210 40 210 Z" fill="url(#dinoGrad2)" stroke="${accentColor}" stroke-width="2"/>
            <!-- Sickle claw -->
            <path d="M 125 245 Q 140 240 135 255" stroke="#fff" stroke-width="4" fill="none"/>
            <circle cx="240" cy="128" r="3.5" fill="#fff"/>
        `;
    }

    return `
        <svg viewBox="0 0 320 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="dinoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.8"/>
                    <stop offset="100%" stop-color="#bd00ff" stop-opacity="0.4"/>
                </linearGradient>
                <linearGradient id="dinoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#bd00ff" stop-opacity="0.8"/>
                    <stop offset="100%" stop-color="#ffcc00" stop-opacity="0.4"/>
                </linearGradient>
                <linearGradient id="dinoGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffcc00" stop-opacity="0.8"/>
                    <stop offset="100%" stop-color="#00f0ff" stop-opacity="0.4"/>
                </linearGradient>
                <filter id="neonGlow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            <!-- Background Grid & Fossil Aura -->
            <circle cx="160" cy="150" r="110" fill="none" stroke="${accentColor}" stroke-width="1" stroke-dasharray="4,6" opacity="0.3"/>
            <circle cx="160" cy="150" r="85" fill="none" stroke="#fff" stroke-width="1" opacity="0.1"/>

            <g filter="url(#neonGlow)">
                ${pathContent}
            </g>

            <!-- Dinosaur Specimen Badge -->
            <rect x="20" y="240" width="120" height="24" rx="6" fill="rgba(14,17,30,0.8)" stroke="${accentColor}" stroke-width="1"/>
            <text x="30" y="256" font-family="'Orbitron', sans-serif" font-size="10" fill="${accentColor}" font-weight="700">FOSSIL #${Math.floor(Math.random()*900)+100}</text>
        </svg>
    `;
}

// ── Game State Variables ───────────────────────────────────────────────────
const TOTAL_QUESTIONS = 25;
const QUESTION_TIME_LIMIT = 15; // seconds

let currentRoundQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let streak = 0;
let bestStreak = 0;
let correctCount = 0;
let timerInterval = null;
let timeLeft = QUESTION_TIME_LIMIT;
let isAnswered = false;
let selectedMode = 'photo'; // 'photo', 'trivia', or 'mixed'

let lifelines = {
    fifty: 1,
    hint: 2,
    freeze: 1
};

// ── DOM Elements ───────────────────────────────────────────────────────────
const startScreen       = document.getElementById('startScreen');
const quizScreen        = document.getElementById('quizScreen');
const resultsScreen     = document.getElementById('resultsScreen');

const startQuizBtn      = document.getElementById('startQuizBtn');
const openLeaderboardBtn= document.getElementById('openLeaderboardBtn');
const soundToggleBtn    = document.getElementById('soundToggleBtn');

const currentScoreEl    = document.getElementById('currentScore');
const currentStreakEl   = document.getElementById('currentStreak');

const questionCounterEl = document.getElementById('questionCounter');
const accuracyTagEl     = document.getElementById('accuracyTag');
const progressBarFill   = document.getElementById('progressBarFill');

const timerBadge        = document.getElementById('timerBadge');
const timerCircle       = document.getElementById('timerCircle');
const timerText         = document.getElementById('timerText');

const lifelineFifty     = document.getElementById('lifelineFifty');
const lifelineHint      = document.getElementById('lifelineHint');
const lifelineFreeze    = document.getElementById('lifelineFreeze');

const countFifty        = document.getElementById('countFifty');
const countHint         = document.getElementById('countHint');
const countFreeze       = document.getElementById('countFreeze');

const dinoVisual        = document.getElementById('dinoVisual');
const hintOverlay       = document.getElementById('hintOverlay');
const hintText          = document.getElementById('hintText');
const choicesGrid       = document.getElementById('choicesGrid');

const factModal         = document.getElementById('factModal');
const factStatusBadge   = document.getElementById('factStatusBadge');
const factDinoName      = document.getElementById('factDinoName');
const factEra           = document.getElementById('factEra');
const factDiet          = document.getElementById('factDiet');
const factSize          = document.getElementById('factSize');
const factTextEl        = document.getElementById('factText');
const nextQuestionBtn   = document.getElementById('nextQuestionBtn');

const resFinalScore     = document.getElementById('resFinalScore');
const resAccuracy       = document.getElementById('resAccuracy');
const resBestStreak     = document.getElementById('resBestStreak');
const resCorrect        = document.getElementById('resCorrect');
const rankIcon          = document.getElementById('rankIcon');
const rankTitle         = document.getElementById('rankTitle');
const playerNameInput   = document.getElementById('playerNameInput');
const submitScoreBtn    = document.getElementById('submitScoreBtn');
const submitFeedback    = document.getElementById('submitFeedback');
const playAgainBtn      = document.getElementById('playAgainBtn');
const viewLeaderboardResultsBtn = document.getElementById('viewLeaderboardResultsBtn');

const leaderboardModal  = document.getElementById('leaderboardModal');
const closeLeaderboardBtn= document.getElementById('closeLeaderboardBtn');
const closeLeaderboardFooterBtn = document.getElementById('closeLeaderboardFooterBtn');
const leaderboardTbody  = document.getElementById('leaderboardTbody');

// ── Initialize Event Listeners ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    startQuizBtn.addEventListener('click', () => {
        playSound('click');
        startNewRound();
    });

    openLeaderboardBtn.addEventListener('click', () => {
        playSound('click');
        openLeaderboard();
    });

    viewLeaderboardResultsBtn.addEventListener('click', () => {
        playSound('click');
        openLeaderboard();
    });

    closeLeaderboardBtn.addEventListener('click', () => {
        playSound('click');
        leaderboardModal.classList.add('hidden');
    });

    closeLeaderboardFooterBtn.addEventListener('click', () => {
        playSound('click');
        leaderboardModal.classList.add('hidden');
    });

    playAgainBtn.addEventListener('click', () => {
        playSound('click');
        startNewRound();
    });

    nextQuestionBtn.addEventListener('click', () => {
        playSound('click');
        factModal.classList.add('hidden');
        advanceToNextQuestion();
    });

    soundToggleBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggleBtn.innerHTML = soundEnabled 
            ? '<i class="fa-solid fa-volume-high"></i>'
            : '<i class="fa-solid fa-volume-xmark"></i>';
    });

    submitScoreBtn.addEventListener('click', handleScoreSubmission);

    let currentLbTab = 'photo';

    document.querySelectorAll('.lb-tab-btn').forEach(tabBtn => {
        tabBtn.addEventListener('click', () => {
            playSound('click');
            document.querySelectorAll('.lb-tab-btn').forEach(b => b.classList.remove('active'));
            tabBtn.classList.add('active');
            currentLbTab = tabBtn.getAttribute('data-lb-mode');
            openLeaderboard(currentLbTab);
        });
    });

    playerNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleScoreSubmission();
        }
    });

    playerNameInput.addEventListener('input', () => {
        submitScoreBtn.disabled = false;
        submitScoreBtn.style.opacity = '1';
        submitScoreBtn.style.pointerEvents = 'auto';
        submitScoreBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> SUBMIT SCORE';
    });

    document.querySelectorAll('.mode-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        playSound('click');
        document.querySelectorAll('.mode-card-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedMode = btn.getAttribute('data-mode');
    });
});


    // Lifeline buttons
    lifelineFifty.addEventListener('click', useFiftyFifty);
    lifelineHint.addEventListener('click', useHint);
    lifelineFreeze.addEventListener('click', useTimeFreeze);
});

// ── Game Logic ─────────────────────────────────────────────────────────────

function startNewRound() {
    score = 0;
    streak = 0;
    bestStreak = 0;
    correctCount = 0;
    currentQuestionIndex = 0;

    lifelines = { fifty: 1, hint: 2, freeze: 1 };
    updateLifelineUI();

    let pool = [];

    if (selectedMode === 'photo') {
        const shuffled = [...DINOSAURS].sort(() => 0.5 - Math.random());
        pool = shuffled.slice(0, TOTAL_QUESTIONS).map(dino => ({
            type: 'photo',
            dino: dino,
            questionText: 'WHICH DINOSAUR IS THIS?',
            correctAnswer: dino.name,
            image: dino.image,
            options: generateOptions(dino.name),
            fact: dino.fact,
            era: dino.era,
            diet: dino.diet,
            size: dino.length
        }));
    } else if (selectedMode === 'trivia') {
        const shuffled = [...GENERAL_TRIVIA].sort(() => 0.5 - Math.random());
        pool = shuffled.slice(0, 20).map(item => ({
            type: 'trivia',
            questionText: item.question,
            correctAnswer: item.correct,
            image: item.image,
            options: [...item.options].sort(() => 0.5 - Math.random()),
            fact: item.fact,
            era: item.era,
            diet: item.diet,
            size: 'Trivia Specimen'
        }));
    } else {
        // Mixed mode: 15 photo questions + 10 general trivia questions
        const shuffledPhotos = [...DINOSAURS].sort(() => 0.5 - Math.random()).slice(0, 15).map(dino => ({
            type: 'photo',
            dino: dino,
            questionText: 'WHICH DINOSAUR IS THIS?',
            correctAnswer: dino.name,
            image: dino.image,
            options: generateOptions(dino.name),
            fact: dino.fact,
            era: dino.era,
            diet: dino.diet,
            size: dino.length
        }));

        const shuffledTrivia = [...GENERAL_TRIVIA].sort(() => 0.5 - Math.random()).slice(0, 10).map(item => ({
            type: 'trivia',
            questionText: item.question,
            correctAnswer: item.correct,
            image: item.image,
            options: [...item.options].sort(() => 0.5 - Math.random()),
            fact: item.fact,
            era: item.era,
            diet: item.diet,
            size: 'Trivia Specimen'
        }));

        pool = [...shuffledPhotos, ...shuffledTrivia].sort(() => 0.5 - Math.random());
    }

    currentRoundQuestions = pool;

    updateHeaderUI();

    startScreen.classList.remove('active');
    resultsScreen.classList.remove('active');
    quizScreen.classList.add('active');

    loadQuestion(0);
}

function generateOptions(correctName) {
    const distractors = DINOSAURS
        .filter(d => d.name !== correctName)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(d => d.name);

    return [correctName, ...distractors].sort(() => 0.5 - Math.random());
}



function loadQuestion(index) {
    const totalQInRound = currentRoundQuestions.length || 20;
    if (index < 0 || index >= totalQInRound || !currentRoundQuestions[index]) {
        endRound();
        return;
    }

    isAnswered = false;
    currentQuestionIndex = index;
    const currentQ = currentRoundQuestions[index];

    // Update Progress UI
    questionCounterEl.textContent = index + 1;
    document.querySelector('.progress-info span').innerHTML = `<i class="fa-solid fa-list-check"></i> QUESTION <strong>${index + 1}</strong> / ${totalQInRound}`;
    const pct = ((index + 1) / totalQInRound) * 100;
    progressBarFill.style.width = `${pct}%`;
    const accuracy = index > 0 ? Math.round((correctCount / index) * 100) : 100;
    accuracyTagEl.textContent = `${accuracy}% Accuracy`;

    // Render Dino Visual or Question Text
    dinoVisual.style.display = 'flex';
    if (currentQ.image) {
        dinoVisual.innerHTML = `<img src="${currentQ.image}" alt="Nano Banana Dinosaur Trivia" class="dino-activewild-img">`;
    } else {
        dinoVisual.innerHTML = '';
    }

    if (currentQ.type === 'photo') {
        document.querySelector('.question-prompt h3').textContent = 'WHICH DINOSAUR IS THIS?';
        document.querySelector('.question-prompt h3').className = '';
    } else {
        document.querySelector('.question-prompt h3').textContent = currentQ.questionText;
        document.querySelector('.question-prompt h3').className = 'question-text-heading';
    }

    hintOverlay.classList.add('hidden');

    // Render Options Grid
    choicesGrid.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    currentQ.options.forEach((optText, i) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.setAttribute('data-letter', letters[i]);
        btn.setAttribute('data-name', optText);
        btn.textContent = optText;
        btn.addEventListener('click', () => handleAnswerSelect(optText, currentQ.correctAnswer, btn));
        choicesGrid.appendChild(btn);
    });

    startTimer();
}


function startTimer() {
    clearInterval(timerInterval);
    timeLeft = QUESTION_TIME_LIMIT;
    timerBadge.classList.remove('warning');
    updateTimerUI();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI();

        if (timeLeft <= 3) {
            timerBadge.classList.add('warning');
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeOut();
        }
    }, 1000);
}

function updateTimerUI() {
    timerText.textContent = timeLeft;
    const dash = (timeLeft / QUESTION_TIME_LIMIT) * 100;
    timerCircle.setAttribute('stroke-dasharray', `${dash}, 100`);
}

function handleAnswerSelect(selectedName, correctName, btn) {
    if (isAnswered) return;
    isAnswered = true;
    clearInterval(timerInterval);

    const isCorrect = (selectedName === correctName);

    // Disable all choice buttons
    const allBtns = choicesGrid.querySelectorAll('.choice-btn');
    allBtns.forEach(b => {
        b.disabled = true;
        if (b.getAttribute('data-name') === correctName) {
            b.classList.add('correct');
        }
    });

    if (isCorrect) {
        btn.classList.add('correct');
        playSound('correct');
        correctCount++;
        streak++;
        if (streak > bestStreak) bestStreak = streak;

        // Base points (100) + Time bonus (timeLeft * 10) + Streak bonus (streak * 20)
        const roundPoints = 100 + (timeLeft * 10) + (streak * 20);
        score += roundPoints;
    } else {
        btn.classList.add('incorrect');
        playSound('wrong');
        streak = 0;
    }

    updateHeaderUI();

    // Delay 1s then show Fact Modal
    setTimeout(() => {
        showFactModal(currentRoundQuestions[currentQuestionIndex], isCorrect);
    }, 1000);
}

function handleTimeOut() {
    if (isAnswered) return;
    isAnswered = true;

    playSound('wrong');
    streak = 0;
    updateHeaderUI();

    const currentQ = currentRoundQuestions[currentQuestionIndex];
    const allBtns = choicesGrid.querySelectorAll('.choice-btn');
    allBtns.forEach(b => {
        b.disabled = true;
        if (b.getAttribute('data-name') === currentQ.correctAnswer) {
            b.classList.add('correct');
        }
    });

    setTimeout(() => {
        showFactModal(currentQ, false, true);
    }, 1000);
}


function showFactModal(qObj, isCorrect, isTimeout = false) {
    if (isCorrect) {
        factStatusBadge.className = 'fact-status-badge correct-bg';
        factStatusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> CORRECT!';
    } else if (isTimeout) {
        factStatusBadge.className = 'fact-status-badge incorrect-bg';
        factStatusBadge.innerHTML = '<i class="fa-solid fa-hourglass-end"></i> TIME EXPIRED!';
    } else {
        factStatusBadge.className = 'fact-status-badge incorrect-bg';
        factStatusBadge.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> INCORRECT!';
    }

    factDinoName.textContent = qObj.correctAnswer;
    factEra.textContent = qObj.era || 'Mesozoic Era';
    factDiet.textContent = qObj.diet || 'Dino Fact';
    factSize.textContent = qObj.size || 'Prehistoric Specimen';
    factTextEl.textContent = qObj.fact || 'Great job testing your dinosaur knowledge!';

    factModal.classList.remove('hidden');
}


function advanceToNextQuestion() {
    const totalQInRound = currentRoundQuestions.length || TOTAL_QUESTIONS;
    if (currentQuestionIndex + 1 < totalQInRound) {
        loadQuestion(currentQuestionIndex + 1);
    } else {
        endRound();
    }
}

function endRound() {
    quizScreen.classList.remove('active');
    resultsScreen.classList.add('active');

    playSound('fanfare');

    const totalQInRound = currentRoundQuestions.length || TOTAL_QUESTIONS;
    const accuracyPct = Math.round((correctCount / totalQInRound) * 100);

    resFinalScore.textContent = score.toLocaleString();
    resAccuracy.textContent = `${accuracyPct}%`;
    resBestStreak.textContent = `${bestStreak}🔥`;
    resCorrect.textContent = `${correctCount} / ${totalQInRound}`;

    // Calculate Rank
    if (accuracyPct >= 95) {
        rankIcon.textContent = '👑';
        rankTitle.textContent = 'S+ RANK — APEX PALEONTOLOGIST';
    } else if (accuracyPct >= 80) {
        rankIcon.textContent = '🏆';
        rankTitle.textContent = 'S RANK — DINO MASTER';
    } else if (accuracyPct >= 60) {
        rankIcon.textContent = '🥇';
        rankTitle.textContent = 'A RANK — FOSSIL EXPERT';
    } else if (accuracyPct >= 40) {
        rankIcon.textContent = '🥈';
        rankTitle.textContent = 'B RANK — DINO EXPLORER';
    } else {
        rankIcon.textContent = '🦕';
        rankTitle.textContent = 'C RANK — DINO NOVICE';
    }

    // Save High Score to localStorage
    const stored = parseInt(localStorage.getItem('dino_quiz_high_score') || '0', 10);
    if (score > stored) {
        localStorage.setItem('dino_quiz_high_score', score.toString());
    }

    // Pre-fill Player Name if signed in or saved
    const savedName = localStorage.getItem('dino_quiz_player_name') || window.parent._arcadeUser?.displayName || 'Guest Dino Hunter';
    playerNameInput.value = savedName;

    // Reset submit button & feedback for every round
    submitScoreBtn.disabled = false;
    submitScoreBtn.style.opacity = '1';
    submitScoreBtn.style.pointerEvents = 'auto';
    submitScoreBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> SUBMIT SCORE';
    submitFeedback.textContent = '';
}

// ── Lifelines Implementation ───────────────────────────────────────────────
function useFiftyFifty() {
    if (lifelines.fifty <= 0 || isAnswered) return;
    lifelines.fifty--;
    updateLifelineUI();
    playSound('lifeline');

    const currentQ = currentRoundQuestions[currentQuestionIndex];
    const allBtns = Array.from(choicesGrid.querySelectorAll('.choice-btn'));
    const incorrectBtns = allBtns.filter(b => b.getAttribute('data-name') !== currentQ.correctAnswer);
    // Remove 2 incorrect buttons
    const toRemove = incorrectBtns.sort(() => 0.5 - Math.random()).slice(0, 2);
    toRemove.forEach(b => {
        b.disabled = true;
        b.classList.add('dimmed');
    });
}

function useHint() {
    if (lifelines.hint <= 0 || isAnswered) return;
    lifelines.hint--;
    updateLifelineUI();
    playSound('lifeline');

    const currentQ = currentRoundQuestions[currentQuestionIndex];
    hintText.textContent = `HINT — ERA: ${currentQ.era} | DIET: ${currentQ.diet}`;
    hintOverlay.classList.remove('hidden');
}

function useTimeFreeze() {
    if (lifelines.freeze <= 0 || isAnswered) return;
    lifelines.freeze--;
    updateLifelineUI();
    playSound('lifeline');

    timeLeft += 10;
    updateTimerUI();
}

function updateLifelineUI() {
    countFifty.textContent = lifelines.fifty;
    countHint.textContent = lifelines.hint;
    countFreeze.textContent = lifelines.freeze;

    lifelineFifty.disabled = lifelines.fifty <= 0;
    lifelineHint.disabled = lifelines.hint <= 0;
    lifelineFreeze.disabled = lifelines.freeze <= 0;
}

function updateHeaderUI() {
    currentScoreEl.textContent = score.toLocaleString();
    currentStreakEl.textContent = `${streak}×`;
}

function withTimeout(promise, ms = 2500) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
    ]);
}

// ── Leaderboard Submission & Fetching ──────────────────────────────────────
async function handleScoreSubmission() {
    if (submitScoreBtn.disabled) return;

    const playerName = playerNameInput.value.trim() || 'Anonymous Explorer';
    localStorage.setItem('dino_quiz_player_name', playerName);
    
    submitScoreBtn.disabled = true;
    submitScoreBtn.style.opacity = '0.6';
    submitScoreBtn.style.pointerEvents = 'none';
    submitScoreBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> SUBMITTING...';
    submitFeedback.textContent = "Submitting score to Leaderboard...";

    const totalQInRound = currentRoundQuestions.length || TOTAL_QUESTIONS;
    const entry = {
        name: playerName,
        score: score,
        accuracy: Math.round((correctCount / totalQInRound) * 100),
        mode: selectedMode || 'photo',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: Date.now()
    };

    // 1. Save to Local High Scores
    const REAL_HISTORICAL_ENTRIES = [
        { name: "Eric", score: 3860, accuracy: 64, mode: "photo", date: "Aug 15, 2026", timestamp: 1786850152921 },
        { name: "Eric", score: 3280, accuracy: 52, mode: "photo", date: "Aug 15, 2026", timestamp: 1786850936332 },
        { name: "Henry", score: 2090, accuracy: 36, mode: "photo", date: "Aug 15, 2026", timestamp: 1786851227320 },
        { name: "Markus", score: 1950, accuracy: 28, mode: "photo", date: "Aug 15, 2026", timestamp: 1786852616260 }
    ];

    let localLb = JSON.parse(localStorage.getItem('dino_quiz_leaderboard') || '[]');
    let combined = [...allEntries, ...localLb];

    // Seed real historical entries if not already present
    REAL_HISTORICAL_ENTRIES.forEach(real => {
        if (!combined.some(e => e.name === real.name && e.score === real.score && (e.mode || 'photo') === real.mode)) {
            combined.push(real);
        }
    });

    // Filter entries for targetMode (Older entries without mode tag default to 'photo'!)
    const filtered = combined.filter(item => {
        const itemMode = item.mode || 'photo';
        return itemMode === targetMode;
    });

    filtered.sort((a, b) => b.score - a.score);

    renderLeaderboardRows(filtered);
}

function renderLeaderboardRows(entries) {
    if (entries.length === 0) {
        leaderboardTbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;">No high scores yet! Be the first to play!</td></tr>`;
        return;
    }

    const rows = entries.map((item, index) => {
        let rankBadge = `${index + 1}`;
        if (index === 0) rankBadge = '🥇 1st';
        else if (index === 1) rankBadge = '🥈 2nd';
        else if (index === 2) rankBadge = '🥉 3rd';

        return `
            <tr>
                <td><strong>${rankBadge}</strong></td>
                <td>${escapeHTML(item.name)}</td>
                <td><strong style="color:var(--cyan);">${item.score.toLocaleString()}</strong></td>
                <td>${item.accuracy}%</td>
                <td style="color:var(--text-dim);font-size:0.8rem;">${item.date || 'Today'}</td>
            </tr>
        `;
    }).join('');

    leaderboardTbody.innerHTML = rows;
}

function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, match => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[match]));
}


// ── General Dinosaur Knowledge Questions ──────────────────────────────────
const GENERAL_TRIVIA = [
    {
        "id": "gen_1",
        "question": "What does the word 'Dinosaur' actually mean?",
        "options": [
            "Giant Dragon",
            "Terrible Lizard",
            "Big Monster",
            "Scaly Beast"
        ],
        "correct": "Terrible Lizard",
        "era": "Mesozoic Era",
        "diet": "Science Fact",
        "fact": "Sir Richard Owen coined the word 'Dinosauria' in 1842, combining Greek words meaning 'terrible' (or fearfully great) and 'lizard'!",
        "image": "images/gen_1.png"
    },
    {
        "id": "gen_2",
        "question": "What giant space rock crashed into Earth and ended the time of the dinosaurs 66 million years ago?",
        "options": [
            "A Comet",
            "An Asteroid",
            "A Moon Fragment",
            "A Shooting Star"
        ],
        "correct": "An Asteroid",
        "era": "66 Million Years Ago",
        "diet": "Extinction Event",
        "fact": "The 6-mile-wide Chicxulub asteroid crashed near Mexico, triggering earthquakes, tsunamis, and a global dust cloud!",
        "image": "images/gen_2.png"
    },
    {
        "id": "gen_3",
        "question": "Which animal alive today is actually a direct living relative of dinosaurs like T-Rex?",
        "options": [
            "Crocodiles",
            "Birds",
            "Lizards",
            "Sharks"
        ],
        "correct": "Birds",
        "era": "Present Day",
        "diet": "Evolution Fact",
        "fact": "Birds are modern avian theropod dinosaurs! Chickens and hummingbirds are closer relatives to T-Rex than lizards!",
        "image": "images/gen_3.png"
    },
    {
        "id": "gen_4",
        "question": "What did giant plant-eating dinosaurs like Brachiosaurus eat every day?",
        "options": [
            "Leaves, ferns, and tree branches",
            "Fish and seaweed",
            "Insects and bugs",
            "Meat and bones"
        ],
        "correct": "Leaves, ferns, and tree branches",
        "era": "Jurassic Period",
        "diet": "Herbivore",
        "fact": "Giant sauropods like Brachiosaurus needed up to 800 pounds of tree leaves every single day to fuel their massive bodies!",
        "image": "images/gen_4.png"
    },
    {
        "id": "gen_5",
        "question": "What do scientists call fossilized dinosaur poop?",
        "options": [
            "Coprolite",
            "Amber",
            "Geode",
            "Fossil Mud"
        ],
        "correct": "Coprolite",
        "era": "Prehistoric Fossils",
        "diet": "Fossil Fact",
        "fact": "Coprolites help paleontologists figure out exactly what prehistoric dinosaurs ate for dinner millions of years ago!",
        "image": "images/gen_5.png"
    },
    {
        "id": "gen_6",
        "question": "Which of these prehistoric creatures flew in the sky, but was actually a flying reptile\u2014NOT a dinosaur?",
        "options": [
            "Pteranodon",
            "Allosaurus",
            "Triceratops",
            "Velociraptor"
        ],
        "correct": "Pteranodon",
        "era": "Cretaceous Period",
        "diet": "Piscivore",
        "fact": "Pteranodons were flying reptiles called Pterosaurs. Dinosaurs were land-dwelling animals with straight legs under their bodies!",
        "image": "images/gen_6.png"
    },
    {
        "id": "gen_7",
        "question": "How big was a real Velociraptor in real life?",
        "options": [
            "As tall as a 2-story building",
            "About the size of a turkey or big dog",
            "As large as an elephant",
            "The size of a hamster"
        ],
        "correct": "About the size of a turkey or big dog",
        "era": "Late Cretaceous",
        "diet": "Carnivore",
        "fact": "Real Velociraptors were only about 1.6 feet tall and covered in feathers! Movie raptors were actually modeled after Utahraptor!",
        "image": "images/gen_7.png"
    },
    {
        "id": "gen_8",
        "question": "Which armored dinosaur had a heavy bone club on the end of its tail to smash away predators?",
        "options": [
            "Ankylosaurus",
            "Stegosaurus",
            "Diplodocus",
            "Triceratops"
        ],
        "correct": "Ankylosaurus",
        "era": "Late Cretaceous",
        "diet": "Herbivore",
        "fact": "Ankylosaurus used its heavy bone tail club like a bowling ball to break the legs of attacking predators!",
        "image": "images/gen_8.png"
    },
    {
        "id": "gen_9",
        "question": "On which continents have scientists discovered dinosaur fossils?",
        "options": [
            "North America only",
            "Europe and Asia only",
            "All 7 continents, even Antarctica!",
            "Australia only"
        ],
        "correct": "All 7 continents, even Antarctica!",
        "era": "Global Geography",
        "diet": "Fossil Record",
        "fact": "Dinosaurs lived everywhere on Earth! Millions of years ago, Antarctica was warm with rainforests full of dinosaurs!",
        "image": "images/gen_9.png"
    },
    {
        "id": "gen_10",
        "question": "Why did plant-eating dinosaurs swallow smooth stones called gastroliths?",
        "options": [
            "To crush and grind up tough plants in their stomach",
            "To float in deep rivers",
            "To clean their teeth",
            "To cool down"
        ],
        "correct": "To crush and grind up tough plants in their stomach",
        "era": "Digestion Fact",
        "diet": "Herbivore",
        "fact": "Sauropods didn't chew their food! They swallowed swallowed stones that tumbled inside their gizzard to grind up leaves!",
        "image": "images/gen_10.png"
    },
    {
        "id": "gen_11",
        "question": "Which famous dinosaur had 3 sharp horns on its face and a giant neck shield for protection?",
        "options": [
            "Triceratops",
            "Spinosaurus",
            "Pachycephalosaurus",
            "Brachiosaurus"
        ],
        "correct": "Triceratops",
        "era": "Late Cretaceous",
        "diet": "Herbivore",
        "fact": "Triceratops' name means 'Three-Horned Face'. Its skull alone was as long as an adult human!",
        "image": "images/gen_11.png"
    },
    {
        "id": "gen_12",
        "question": "What is a scientist who digs up and studies dinosaur fossils called?",
        "options": [
            "Archaeologist",
            "Paleontologist",
            "Geologist",
            "Astronomer"
        ],
        "correct": "Paleontologist",
        "era": "Science Career",
        "diet": "Fossil Science",
        "fact": "Paleontologists use brushes, chisels, and scanners to carefully unearth fossilized bones and reconstruct ancient life!",
        "image": "images/gen_12.png"
    },
    {
        "id": "gen_13",
        "question": "Which giant predator was even longer than T-Rex and lived in rivers hunting fish?",
        "options": [
            "Spinosaurus",
            "Stegosaurus",
            "Velociraptor",
            "Carnotaurus"
        ],
        "correct": "Spinosaurus",
        "era": "Cretaceous Period",
        "diet": "Piscivore / Carnivore",
        "fact": "Spinosaurus was 50 feet long and featured a giant 6-foot sail on its back, swimming in ancient North African rivers!",
        "image": "images/gen_13.png"
    },
    {
        "id": "gen_14",
        "question": "What is the hardened tree sap that preserved ancient prehistoric bugs and feathers called?",
        "options": [
            "Amber",
            "Crystal",
            "Diamond",
            "Lava Glass"
        ],
        "correct": "Amber",
        "era": "Preservation",
        "diet": "Fossil Gem",
        "fact": "Sticky tree resin trapped ancient insects and dinosaur feathers 100 million years ago, hardening into golden amber!",
        "image": "images/gen_14.png"
    },
    {
        "id": "gen_15",
        "question": "Which dinosaur had 4 sharp spikes on its tail and 17 giant plates along its back?",
        "options": [
            "Stegosaurus",
            "Ankylosaurus",
            "Parasaurolophus",
            "Carnotaurus"
        ],
        "correct": "Stegosaurus",
        "era": "Late Jurassic",
        "diet": "Herbivore",
        "fact": "Stegosaurus' 4 tail spikes are called a 'thagomizer', which it swung at predators like Allosaurus!",
        "image": "images/gen_15.png"
    },
    {
        "id": "gen_16",
        "question": "Why did Parasaurolophus have a long hollow tube on top of its head?",
        "options": [
            "To store extra water",
            "To trumpet loud sounds like a horn to its herd",
            "To dig holes in the dirt",
            "To fly"
        ],
        "correct": "Parasaurolophus",
        "era": "Late Cretaceous",
        "diet": "Herbivore",
        "fact": "Parasaurolophus used its 6-foot hollow head crest like a musical brass instrument to send long-distance foghorn signals!",
        "image": "images/gen_16.png"
    },
    {
        "id": "gen_17",
        "question": "Which dinosaur had a thick dome of solid bone on its head up to 10 inches thick for head-butting?",
        "options": [
            "Pachycephalosaurus",
            "Triceratops",
            "Gallimimus",
            "Iguanodon"
        ],
        "correct": "Pachycephalosaurus",
        "era": "Late Cretaceous",
        "diet": "Herbivore",
        "fact": "Pachycephalosaurus had a skull made of 10-inch-thick solid bone surrounded by tiny bone spikes!",
        "image": "images/gen_17.png"
    },
    {
        "id": "gen_18",
        "question": "Which dinosaur had the longest claws ever discovered\u2014measuring over 3 feet long!",
        "options": [
            "Therizinosaurus",
            "T-Rex",
            "Velociraptor",
            "Ankylosaurus"
        ],
        "correct": "Therizinosaurus",
        "era": "Late Cretaceous",
        "diet": "Herbivore",
        "fact": "Therizinosaurus had giant giant giant giant scythe-like claws used for pulling down high tree branches and defending itself!",
        "image": "images/gen_18.png"
    },
    {
        "id": "gen_19",
        "question": "How fast could ostrich-like dinosaurs like Gallimimus run to escape predators?",
        "options": [
            "5 miles per hour",
            "Up to 30 to 40 miles per hour!",
            "100 miles per hour",
            "They could only crawl"
        ],
        "correct": "Up to 30 to 40 miles per hour!",
        "era": "Late Cretaceous",
        "diet": "Omnivore",
        "fact": "Gallimimus was lightweight with long hollow bones, allowing it to sprint as fast as a racehorse across open plains!",
        "image": "images/gen_19.png"
    },
    {
        "id": "gen_20",
        "question": "What is the name of the final dinosaur period when T-Rex and Triceratops lived right before extinction?",
        "options": [
            "Ice Age",
            "Cretaceous Period",
            "Stone Age",
            "Modern Age"
        ],
        "correct": "Cretaceous Period",
        "era": "145-66 Mya",
        "diet": "Time Period",
        "fact": "The Cretaceous Period was the last chapter of the Mesozoic Era, ending with the asteroid impact 66 million years ago!",
        "image": "images/gen_20.png"
    }
];
