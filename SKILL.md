# Skill: Auto-Sync to GitHub
## Context
- Project: eric-website
- Trigger: File modification within this repository.

## Instructions
1. When modifying files in this repository, the agent must ensure that changes are version-controlled. Update the "Updated" date on the main section to the current date for the game you are changing.
2. After implementing a code change, perform the following sequence:
   - `git add .`
   - `git commit -m "feat: automated update via Antigravity agent"`
   - `git push origin main`
3. Safety Clause: If the code change involves critical refactoring or structural changes, the agent must ask for confirmation ("Ready to push?") before executing the push command.
