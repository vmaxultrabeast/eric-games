import asyncio
import edge_tts

TEXT_FILE = "episode1_text.txt"
OUTPUT_MP3 = "episode-001.mp3"
VOICE = "en-US-AndrewMultilingualNeural"  # Natural HD Studio Male Narrator

async def main():
    with open(TEXT_FILE, "r", encoding="utf-8") as f:
        text = f.read()

    # Clean markdown
    text = text.replace("**", "").replace("__", "").replace("*", "").replace("_", "").replace("---", "")

    print(f"Generating studio Neural MP3 narration using {VOICE}...")
    communicate = edge_tts.Communicate(text, VOICE, rate="-4%", pitch="-2Hz")
    await communicate.save(OUTPUT_MP3)
    print(f"Done! Generated studio MP3: {OUTPUT_MP3}")

if __name__ == "__main__":
    asyncio.run(main())
