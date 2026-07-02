import os
import shutil
import subprocess

PROJECT_DIR = "C:/Users/freit/src/board.fun/games/magnet-maze"
DIST_DIR = os.path.join(PROJECT_DIR, "dist")
ZIP_OUT = os.path.join(PROJECT_DIR, "NeonMagnetMaze.webapp.zip")
NODE_EXE = "C:/Users/freit/AppData/Local/ms-playwright-go/1.57.0/node.exe"
PACK_MJS = os.path.join(PROJECT_DIR, "temp_unpack/package/pack.mjs")

def main():
    print("--- Starting Build & Package Process ---")
    
    # 1. Ensure web-pack packaging tools are unpacked
    temp_unpack_dir = os.path.join(PROJECT_DIR, "temp_unpack")
    if not os.path.exists(PACK_MJS):
        import urllib.request, tarfile
        print("web-pack packaging tool not found locally. Downloading from npm registry...")
        tar_url = 'https://registry.npmjs.org/@board.fun/web-pack/-/web-pack-1.0.0-beta.3.tgz'
        tar_path = os.path.join(PROJECT_DIR, "web-pack.tgz")
        urllib.request.urlretrieve(tar_url, tar_path)
        print("Extracting package...")
        with tarfile.open(tar_path, 'r:gz') as tar:
            tar.extractall(temp_unpack_dir)
        os.remove(tar_path)
        print("Extraction complete.")

    # 1. Clean previous dist directory
    if os.path.exists(DIST_DIR):
        print(f"Cleaning existing dist folder: {DIST_DIR}")
        shutil.rmtree(DIST_DIR)
    os.makedirs(DIST_DIR, exist_ok=True)
    
    # 2. Copy static assets
    print("Copying static assets...")
    shutil.copy2(os.path.join(PROJECT_DIR, "index.html"), os.path.join(DIST_DIR, "index.html"))
    shutil.copy2(os.path.join(PROJECT_DIR, "model.tflite"), os.path.join(DIST_DIR, "model.tflite"))
    shutil.copy2(os.path.join(PROJECT_DIR, "cover.png"), os.path.join(DIST_DIR, "cover.png"))
    
    # 3. Copy CSS folder
    css_src = os.path.join(PROJECT_DIR, "css")
    css_dst = os.path.join(DIST_DIR, "css")
    shutil.copytree(css_src, css_dst)
    
    # 4. Copy JS folder
    js_src = os.path.join(PROJECT_DIR, "js")
    js_dst = os.path.join(DIST_DIR, "js")
    shutil.copytree(js_src, js_dst)
    
    # 5. Run the web-pack CLI using node
    print("Running web-pack packager...")
    cmd = [
        NODE_EXE,
        PACK_MJS,
        DIST_DIR,
        "--package-id", "fun.board.magnetmaze",
        "--name", "Neon Magnet Maze",
        "--model", "model.tflite",
        "--sdk-version", "1.0.0-beta.6",
        "-o", ZIP_OUT
    ]
    
    print(f"Executing: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    print("STDOUT:")
    print(result.stdout)
    if result.stderr:
        print("STDERR:")
        print(result.stderr)
        
    if result.returncode == 0:
        print(f"Package successfully generated at: {ZIP_OUT}")
    else:
        print(f"Packaging failed with return code {result.returncode}")
        
    print("--- Build & Package Process Complete ---")

if __name__ == "__main__":
    main()
