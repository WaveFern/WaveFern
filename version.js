/* ---------- version ----------
   Version code: vMAJOR.MINOR.PATCH
   - MAJOR/MINOR: feature builds (MINOR goes up for a new feature)
   - PATCH: every bug fix, however small
   Bump GAME_VERSION and add a VERSION_HISTORY entry in the same commit as the change. */
const GAME_VERSION='v26.8.2';
const VERSION_HISTORY=[
 {v:'v26.8.2',n:'Fixed a black screen that could stay forever after going to sleep (from day 2 on). Waking up is now protected so a problem in one new-day step can never leave you stuck. If you were stuck, just reload the page.'},
 {v:'v26.8.1',n:'If you tell an artist they hit you up first ("you hit me up", "you dmed me first", "you should pay me"), chats from older versions switch to the artist paying you, and any fee you already paid in that chat is refunded. If you really messaged them first, they will say so and the fee stays.'},
 {v:'v26.8.0',n:'Artists understand your messages much better: hundreds of new slang words, abbreviations, emoji and music-industry phrases for yes and no, plus swearing at an artist (f off, shut up, insults) makes them block you, while "f--- yeah" still means yes. Artists now chat more casually. If an artist messages you first and you agree, they pay you; if you message them, you pay their fee.'},
 {v:'v26.7.5',n:'The inside of the front (south) wall of the house now uses the same colour as the outside walls.'},
 {v:'v26.7.4',n:'Recording: each hit now speeds the bar up by 5% instead of 15%. You get 3 goes per recording and a miss uses one up; run out and the take is scrapped.'},
 {v:'v26.7.3',n:'Loading a save code now fully resets the game first, so nothing from the previous game carries over and missing fields fall back to defaults.'},
 {v:'v26.7.2',n:'The custom colour button in the colour pickers now shows a plus icon instead of a pencil.'},
 {v:'v26.7.1',n:'Renamed Fernwave Records, Spotifly and the .fw sites to WaveFern and .wf.'},
 {v:'v26.7.0',n:'The game now pauses automatically when you switch tabs or the window loses focus.'},
 {v:'v26.6.0',n:'City: roads are wider (6.4 m) with a wider far-side pavement, and buildings, junctions and the map follow. Traffic now drives on a road network: cars keep to their lane, turn at crossroads and T-junctions, U-turn only at dead ends, and wait instead of piling up. Many more cars and pedestrians across the whole map. You can no longer walk through people or cars, but you can always step away. Sprinting eases in, and cars are now much faster than running.'},
 {v:'v26.5.0',n:'House: the gap in the right-hand (east) wall is patched. The front of the house has a proper front door with frame, panels and handle, inside and out. The garage does not exist at all (no building, pad, sign, collision, prompt or map marker) until you buy it.'},
 {v:'v26.4.0',n:'A red dot sits on the Messages icon while you have unread messages and disappears when they are all read. Upload all uploads every titled draft at once. Your artist page shows your top 5 songs by streams, with a Show all button.'},
 {v:'v26.3.0',n:'Fame stars are replaced by fame levels based on monthly listeners. Level 1 is 1 to 10 listeners and each level after is about 5% harder. Every fame reward and unlock (song reach, fan tips, bodyguards, followers) now uses levels, with the same rewards as before.'},
 {v:'v26.2.0',n:"Streams now build up through the day, faster at night, instead of all at once overnight. The day's earnings are paid once when you wake up. The clock keeps running while you use the computer, and the taskbar clock keeps up."},
 {v:'v26.1.0',n:'Collab recording costs half the energy of a solo song. The diss track option is now an Off/On dropdown, Off at the start of every session. The recording marker speeds up 15% after each hit (misses do not speed it up). Energy slowly refills during the day. Footsteps use one sound system, so walking diagonally no longer stacks or pops.'},
 {v:'v26.0.0',n:"Artist collabs redone: you pay the artist's fee (shown on a confirm button) to book a session. Meeting in person is a short chat with three reply choices that change the artist's opinion, and that opinion sets the song's quality and streams. Red or blue dots on artist pictures show who really wants a collab. A few artists message you on your first day. Collab songs get one (feat. NAME) tag. Artists understand more slang."},
 {v:'v25.1.0',n:'Settings button removed from the bottom-right corner. The map sits a little lower. New games start with the Charcoal wallpaper.'},
 {v:'v24.4.2',n:'Upstairs stairs now drop down into a cut-out in the floor. The new floor is split into four empty rooms.'},
 {v:'v24.4.1',n:'Fixed: the ground floor had a visible opening along the front edge. It is now a continuous low wall while you are inside the house.'},
 {v:'v24.4.0',n:'House tiers: the suburban house is the original four rooms, the Hillside Villa adds two plain rooms on the back, the Penthouse Loft adds a whole new floor (empty, for your own furniture). Upstairs stairs now go down. Removed the Instagrime stories row. The garage hides while you are inside the house. The map thumbnail is smaller and blurs behind the pause menu.'},
 {v:'v24.3.0',n:'Added a third background track to the music rotation.'},
 {v:'v24.2.0',n:'Added a Wipe save button in Settings to start a new game (asks for confirmation).'},
 {v:'v24.1.2',n:'Fixed: progress reset on refresh. The game now autosaves in the browser and restores on reload. Fixed a duplicate variable name (CP) that stopped the clothes and catalogue script from running.'},
 {v:'v24.1.1',n:'Fixed: computer could not be opened (syntax error). Fixed Buzz hair showing a front fringe, and Buzz/Short hair showing stray strands by the face.'},
 {v:'v24.1.0',n:'Version code and a full version history page. Settings links to it.'},
 {v:'v24',n:'Upstairs redesign'},
 {v:'v21',n:'Build v21'},
 {v:'v19',n:'Flat previews'},
 {v:'v18',n:'Build v18'},
 {v:'v8',n:'Clothes, wardrobe, big catalogues, pixel-art posts, more faces'},
 {v:'v7',n:'Albums, rivals, Instagrime profiles, sites, companions, tower'},
 {v:'v6',n:'Fade, garage room, endgame, natural chat'}
];
