import json
import re

GENERAL_TRIVIA = [
    {
        "id": "gen_1",
        "question": "What does the word 'Dinosaur' actually mean?",
        "options": ["Giant Dragon", "Terrible Lizard", "Big Monster", "Scaly Beast"],
        "correct": "Terrible Lizard",
        "era": "Mesozoic Era",
        "diet": "Science Fact",
        "fact": "Sir Richard Owen coined the word 'Dinosauria' in 1842, combining Greek words meaning 'terrible' (or fearfully great) and 'lizard'!"
    },
    {
        "id": "gen_2",
        "question": "What giant space rock crashed into Earth and ended the time of the dinosaurs 66 million years ago?",
        "options": ["A Comet", "An Asteroid", "A Moon Fragment", "A Shooting Star"],
        "correct": "An Asteroid",
        "era": "66 Million Years Ago",
        "diet": "Extinction Event",
        "fact": "The 6-mile-wide Chicxulub asteroid crashed near Mexico, triggering earthquakes, tsunamis, and a global dust cloud!"
    },
    {
        "id": "gen_3",
        "question": "Which animal alive today is actually a direct living relative of dinosaurs like T-Rex?",
        "options": ["Crocodiles", "Birds", "Lizards", "Sharks"],
        "correct": "Birds",
        "era": "Present Day",
        "diet": "Evolution Fact",
        "fact": "Birds are modern avian theropod dinosaurs! Chickens and hummingbirds are closer relatives to T-Rex than lizards!"
    },
    {
        "id": "gen_4",
        "question": "What did giant plant-eating dinosaurs like Brachiosaurus eat every day?",
        "options": ["Leaves, ferns, and tree branches", "Fish and seaweed", "Insects and bugs", "Meat and bones"],
        "correct": "Leaves, ferns, and tree branches",
        "era": "Jurassic Period",
        "diet": "Herbivore",
        "fact": "Giant sauropods like Brachiosaurus needed up to 800 pounds of tree leaves every single day to fuel their massive bodies!"
    },
    {
        "id": "gen_5",
        "question": "What do scientists call fossilized dinosaur poop?",
        "options": ["Coprolite", "Amber", "Geode", "Fossil Mud"],
        "correct": "Coprolite",
        "era": "Prehistoric Fossils",
        "diet": "Fossil Fact",
        "fact": "Coprolites help paleontologists figure out exactly what prehistoric dinosaurs ate for dinner millions of years ago!"
    },
    {
        "id": "gen_6",
        "question": "Which of these prehistoric creatures flew in the sky, but was actually a flying reptile—NOT a dinosaur?",
        "options": ["Pteranodon", "Allosaurus", "Triceratops", "Velociraptor"],
        "correct": "Pteranodon",
        "era": "Cretaceous Period",
        "diet": "Piscivore",
        "fact": "Pteranodons were flying reptiles called Pterosaurs. Dinosaurs were land-dwelling animals with straight legs under their bodies!"
    },
    {
        "id": "gen_7",
        "question": "How big was a real Velociraptor in real life?",
        "options": ["As tall as a 2-story building", "About the size of a turkey or big dog", "As large as an elephant", "The size of a hamster"],
        "correct": "About the size of a turkey or big dog",
        "era": "Late Cretaceous",
        "diet": "Carnivore",
        "fact": "Real Velociraptors were only about 1.6 feet tall and covered in feathers! Movie raptors were actually modeled after Utahraptor!"
    },
    {
        "id": "gen_8",
        "question": "Which armored dinosaur had a heavy bone club on the end of its tail to smash away predators?",
        "options": ["Ankylosaurus", "Stegosaurus", "Diplodocus", "Triceratops"],
        "correct": "Ankylosaurus",
        "era": "Late Cretaceous",
        "diet": "Herbivore",
        "fact": "Ankylosaurus used its heavy bone tail club like a bowling ball to break the legs of attacking predators!"
    },
    {
        "id": "gen_9",
        "question": "On which continents have scientists discovered dinosaur fossils?",
        "options": ["North America only", "Europe and Asia only", "All 7 continents, even Antarctica!", "Australia only"],
        "correct": "All 7 continents, even Antarctica!",
        "era": "Global Geography",
        "diet": "Fossil Record",
        "fact": "Dinosaurs lived everywhere on Earth! Millions of years ago, Antarctica was warm with rainforests full of dinosaurs!"
    },
    {
        "id": "gen_10",
        "question": "Why did plant-eating dinosaurs swallow smooth stones called gastroliths?",
        "options": ["To crush and grind up tough plants in their stomach", "To float in deep rivers", "To clean their teeth", "To cool down"],
        "correct": "To crush and grind up tough plants in their stomach",
        "era": "Digestion Fact",
        "diet": "Herbivore",
        "fact": "Sauropods didn't chew their food! They swallowed swallowed stones that tumbled inside their gizzard to grind up leaves!"
    },
    {
        "id": "gen_11",
        "question": "Which famous dinosaur had 3 sharp horns on its face and a giant neck shield for protection?",
        "options": ["Triceratops", "Spinosaurus", "Pachycephalosaurus", "Brachiosaurus"],
        "correct": "Triceratops",
        "era": "Late Cretaceous",
        "diet": "Herbivore",
        "fact": "Triceratops' name means 'Three-Horned Face'. Its skull alone was as long as an adult human!"
    },
    {
        "id": "gen_12",
        "question": "What is a scientist who digs up and studies dinosaur fossils called?",
        "options": ["Archaeologist", "Paleontologist", "Geologist", "Astronomer"],
        "correct": "Paleontologist",
        "era": "Science Career",
        "diet": "Fossil Science",
        "fact": "Paleontologists use brushes, chisels, and scanners to carefully unearth fossilized bones and reconstruct ancient life!"
    },
    {
        "id": "gen_13",
        "question": "Which giant predator was even longer than T-Rex and lived in rivers hunting fish?",
        "options": ["Spinosaurus", "Stegosaurus", "Velociraptor", "Carnotaurus"],
        "correct": "Spinosaurus",
        "era": "Cretaceous Period",
        "diet": "Piscivore / Carnivore",
        "fact": "Spinosaurus was 50 feet long and featured a giant 6-foot sail on its back, swimming in ancient North African rivers!"
    },
    {
        "id": "gen_14",
        "question": "What is the hardened tree sap that preserved ancient prehistoric bugs and feathers called?",
        "options": ["Amber", "Crystal", "Diamond", "Lava Glass"],
        "correct": "Amber",
        "era": "Preservation",
        "diet": "Fossil Gem",
        "fact": "Sticky tree resin trapped ancient insects and dinosaur feathers 100 million years ago, hardening into golden amber!"
    },
    {
        "id": "gen_15",
        "question": "Which dinosaur had 4 sharp spikes on its tail and 17 giant plates along its back?",
        "options": ["Stegosaurus", "Ankylosaurus", "Parasaurolophus", "Carnotaurus"],
        "correct": "Stegosaurus",
        "era": "Late Jurassic",
        "diet": "Herbivore",
        "fact": "Stegosaurus' 4 tail spikes are called a 'thagomizer', which it swung at predators like Allosaurus!"
    },
    {
        "id": "gen_16",
        "question": "Why did Parasaurolophus have a long hollow tube on top of its head?",
        "options": ["To store extra water", "To trumpet loud sounds like a horn to its herd", "To dig holes in the dirt", "To fly"],
        "correct": "Parasaurolophus",
        "era": "Late Cretaceous",
        "diet": "Herbivore",
        "fact": "Parasaurolophus used its 6-foot hollow head crest like a musical brass instrument to send long-distance foghorn signals!"
    },
    {
        "id": "gen_17",
        "question": "Which dinosaur had a thick dome of solid bone on its head up to 10 inches thick for head-butting?",
        "options": ["Pachycephalosaurus", "Triceratops", "Gallimimus", "Iguanodon"],
        "correct": "Pachycephalosaurus",
        "era": "Late Cretaceous",
        "diet": "Herbivore",
        "fact": "Pachycephalosaurus had a skull made of 10-inch-thick solid bone surrounded by tiny bone spikes!"
    },
    {
        "id": "gen_18",
        "question": "Which dinosaur had the longest claws ever discovered—measuring over 3 feet long!",
        "options": ["Therizinosaurus", "T-Rex", "Velociraptor", "Ankylosaurus"],
        "correct": "Therizinosaurus",
        "era": "Late Cretaceous",
        "diet": "Herbivore",
        "fact": "Therizinosaurus had giant giant giant giant scythe-like claws used for pulling down high tree branches and defending itself!"
    },
    {
        "id": "gen_19",
        "question": "How fast could ostrich-like dinosaurs like Gallimimus run to escape predators?",
        "options": ["5 miles per hour", "Up to 30 to 40 miles per hour!", "100 miles per hour", "They could only crawl"],
        "correct": "Up to 30 to 40 miles per hour!",
        "era": "Late Cretaceous",
        "diet": "Omnivore",
        "fact": "Gallimimus was lightweight with long hollow bones, allowing it to sprint as fast as a racehorse across open plains!"
    },
    {
        "id": "gen_20",
        "question": "What is the name of the final dinosaur period when T-Rex and Triceratops lived right before extinction?",
        "options": ["Ice Age", "Cretaceous Period", "Stone Age", "Modern Age"],
        "correct": "Cretaceous Period",
        "era": "145-66 Mya",
        "diet": "Time Period",
        "fact": "The Cretaceous Period was the last chapter of the Mesozoic Era, ending with the asteroid impact 66 million years ago!"
    }
]

app_js_path = r'c:\Users\freit\src\eric-website\games\dino-quiz\app.js'
with open(app_js_path, 'r', encoding='utf-8') as f:
    code = f.read()

gen_js = json.dumps(GENERAL_TRIVIA, indent=4)
new_code = code + f"\n\n// ── General Dinosaur Knowledge Questions ──────────────────────────────────\nconst GENERAL_TRIVIA = {gen_js};\n"

with open(app_js_path, 'w', encoding='utf-8') as f:
    f.write(new_code)

print("Added GENERAL_TRIVIA to app.js successfully!")
