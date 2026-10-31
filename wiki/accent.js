/* The wiki follows the game's accent colour (Settings > Game). The game keeps it in localStorage fw_opt, which the wiki can read because
   both live on wavefern.com. Runs in the head so the page never flashes the wrong colour. Also draws the tab icon in the accent. */
(function(){try{var q=JSON.parse(localStorage.getItem('fw_opt')),c=q&&q.accent;if(!/^#[0-9a-fA-F]{6}$/.test(c||''))return;
var n=parseInt(c.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255,m=function(k){return'#'+[r,g,b].map(function(v){return Math.round(v*k).toString(16).padStart(2,'0')}).join('')},
s=document.documentElement.style;s.setProperty('--ga',c);s.setProperty('--gad',m(.55));s.setProperty('--gat',(.299*r+.587*g+.114*b)/255>.55?'#050505':'#fff');
var P='5,2 4,3 5,3 3,4 4,4 6,4 1,5 3,5 4,5 6,5 7,5 1,6 2,6 3,6 7,6 8,6 2,7 8,7'.split(' ').map(function(p){var a=p.split(',');return"<rect x='"+a[0]+"' y='"+a[1]+"' width='1' height='1'/>"}).join(''),
svg="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'><rect width='10' height='10' rx='2' fill='#000'/><g fill='"+c+"'>"+P+"</g></svg>",
l=document.createElement('link');l.rel='icon';l.type='image/svg+xml';l.href='data:image/svg+xml,'+encodeURIComponent(svg);
Array.prototype.forEach.call(document.querySelectorAll('link[rel=icon]'),function(e){e.remove()});document.head.appendChild(l)}catch(e){}})();
