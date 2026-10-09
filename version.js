/* ---------- version ----------
   Version code: vMAJOR.MINOR.PATCH
   - MAJOR/MINOR: feature builds (MINOR goes up for a new feature)
   - PATCH: every bug fix, however small
   Bump GAME_VERSION and add a VERSION_HISTORY entry in the same commit as the change. */
const GAME_VERSION='v24.4.2';
const VERSION_HISTORY=[
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
