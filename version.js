/* ---------- version ----------
   Version code: vMAJOR.MINOR.PATCH
   - MAJOR/MINOR: feature builds (MINOR goes up for a new feature)
   - PATCH: every bug fix, however small
   Bump GAME_VERSION and add a VERSION_HISTORY entry in the same commit as the change. */
const GAME_VERSION='v25.9.0';
const VERSION_HISTORY=[
 {v:'v25.9.0',n:'Traffic now follows the road grid: cars go straight or turn at junctions (T-junctions included) and turn round at dead ends. Driving is clearly faster than sprinting, and walking eases into sprinting smoothly.'},
 {v:'v25.8.0',n:'A proper front door now shows in the front wall from inside the house. Without a garage there is nothing on its plot: no sign, no floor pad, no locked prompt and no map marker.'},
 {v:'v25.7.0',n:'Artists: you pay the session fee when you confirm a collab (shown before you confirm). In-person meetings open a 3-choice conversation with 1 to 3 exchanges; your answers change how the artist sees you, and that changes the song quality. Red or blue dot on each artist shows if they want to collab or just want filler. On your first day, a few artists send you messages. Messages understand wassup and what\'s good.'},
 {v:'v25.6.0',n:'More pedestrians and cars around the city. You can no longer walk or drive through other people or traffic.'},
 {v:'v25.5.0',n:'The garage is not drawn until you buy it, and its wall does not block the plot. The right-hand side of the house is closed with a low wall while you are inside.'},
 {v:'v25.4.1',n:'Fixed: the game failed to start after the walking sound change (a variable name clashed with an existing one).'},
 {v:'v25.4.0',n:'Red dot on the Messages icon while you have unread messages. Upload All uploads every titled draft at once. The artist profile shows your top 5 songs by streams, with Show All to expand, and it updates as streams come in.'},
 {v:'v25.3.0',n:'Fame levels replace the stars. Level is set by monthly listeners: level 1 is 1 to 10 listeners, and each later level needs about 5% more. Bodyguards unlock at the level that matches the old 3-star point. Stream and reach bonuses follow listeners, so they stay balanced.'},
 {v:'v25.2.1',n:'Fixed: diagonal walking no longer stacks footsteps and pops. One walking timer drives the footstep sound, and the step sound fades in.'},
 {v:'v25.2.0',n:'Streams now arrive gradually through the day, faster at night, and are paid out when you wake. The game clock keeps running while you use the computer and menus. Energy slowly regenerates during the day. Collab sessions cost half the energy of a solo recording, and collab songs get a (feat. Name) title. The diss track setting is a dropdown that starts on Off. Each successful hit speeds up the timing bar by 15 percent.'},
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
