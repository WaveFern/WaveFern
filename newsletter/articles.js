/* WaveFern newsletter articles, newest first. To add one: put a screenshot in newsletter/img/ (960px wide .webp),
   add an object at the TOP of this list, and add its URL to sitemap.xml if you like. Fields:
   id (url hash), v (game version it shipped in), date (YYYY-MM-DD), tag (short topic), title, img, alt, body (array of paragraphs, plain text).
   Rule: only updates that are actually big get an article. Every Monday the weekly roundup goes on top (tag 'Weekly'). */
const NEWSLETTER=[
 {id:'pause-freeze',v:'v55.5',date:'2026-11-16',tag:'Fix',title:'Pause now really pauses',img:'img/pause.webp',alt:'The WaveFern pause menu open over the game',
  body:['Quests, flights, stats, brand deals, mini-games and the spinners kept ticking behind the pause menu. Not any more: every timer and animation loop holds still and picks up where it stopped when you resume.','Saving, audio fades and online play keep running, so pausing mid-band-room will not drop you.']},
 {id:'map-club-lighthouse',v:'v55.5',date:'2026-11-16',tag:'Map',title:'The Beach Club and Lighthouse are on the map',img:'img/map-beach-club.webp',alt:'The world map zoomed on the Sunset Beach Club',
  body:['Both places are drawn on the world map and the minimap the way they look from above: teak deck, tiki bar and stage thatch roofs, fence and gate, umbrellas on the sand. The Lighthouse sits on its rock off the north shore.','Open the map, pan out and you can find the club before your first sunset gig.']},
 {id:'golf',v:'v55.4',date:'2026-11-15',tag:'Golf',title:'Golf: three courses, six clubs, one Grand Tour',img:'img/golf.webp',alt:'A golfer on a fairway in the Wavefern Golf Club with the power bar showing',
  body:['The Golf Club opened west of Central Park with three courses: Meadow Links, Dune Run and Highland Fling. Hold the mouse, pull back, push forward to swing. How hard you push is the power; the way you push is the direction.','Six clubs shoot differently and the game picks one from your lie and distance. Wind, slopes, backspin and bunkers are real. There is a daily challenge with the same wind for everyone, a practice mode, and a nine-hole Grand Tour with its own best score and a $35 prize.','The ball rolls less and the cup is bigger since v55.4, so putting is no longer a punishment.']}
];
