#!/usr/bin/env node
/* Regenerates audio/cars/manifest.json from the audio files in audio/cars/.  Usage: node tools/make-cars-manifest.js */
const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'..','audio','cars');
fs.mkdirSync(dir,{recursive:true});
const files=fs.readdirSync(dir).filter(f=>/\.(ogg|mp3|m4a|wav|opus)$/i.test(f)).sort();
fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(files)+'\n');
console.log('audio/cars/manifest.json: '+files.length+' clip'+(files.length==1?'':'s'));
