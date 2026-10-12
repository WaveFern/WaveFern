# Car clips

Optional audio for passing cars with music. Drop a few clips (.ogg or .mp3, 30-60 seconds each) in this folder and run

    node tools/make-cars-manifest.js

to rewrite `manifest.json` (a JSON list of file names, for example `["groove.ogg","bounce.mp3"]`).
Each car that drives past the player has a fixed 0.5% chance to play one of these clips. It sounds muffled, with extra bass,
panned and louder as it comes closer, and the main soundtrack dips while it plays. Cars can also play the player's own
released songs (chance = monthly listeners / 1,000,000); that needs no files.

An empty or missing manifest is fine: the game skips this part silently. Supported: .ogg, .mp3, .m4a, .wav, .opus.
