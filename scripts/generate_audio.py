import os
import asyncio
import edge_tts

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TEXT_FILE = os.path.join(SCRIPT_DIR, "episode1_text.txt")
OUTPUT_MP3 = os.path.join(SCRIPT_DIR, "episode-001.mp3")
VOICE = "en-US-AndrewMultilingualNeural"  # Natural HD Studio Male Narrator

async def main():
    with open(TEXT_FILE, "r", encoding="utf-8") as f:
        text = f.read()

    # Clean markdown headers, hashtags, and formatting
    text = text.replace("#", "").replace("**", "").replace("__", "").replace("*", "").replace("_", "").replace("---", "").replace("`", "")

    print(f"Generating studio Neural MP3 narration using {VOICE}...")
    communicate = edge_tts.Communicate(text, VOICE, rate="-4%", pitch="-2Hz")
    await communicate.save(OUTPUT_MP3)
    print(f"Done! Generated studio MP3: {OUTPUT_MP3}")

if __name__ == "__main__":
    asyncio.run(main())
