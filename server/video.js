// video.js
boxborderw: 10
}
}
])
.frames(1)
.output(out)
.on('end', () => resolve(out))
.on('error', (err) => reject(err));


cmd.run();
});
}


async function createVideoFromText({ text, outName = 'out.mp4', size = 'landscape' }) {
// Create 2–4 slides from the text
const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
const parts = sentences.length > 3 ? sentences.slice(0, 3) : sentences;
const slides = [];
for (let i = 0; i < parts.length; i++) {
const s = parts[i].trim();
const fname = `slide_${shortid.generate()}.png`;
const slidePath = await createSlide(s, fname, 1280, 720);
slides.push({ path: slidePath, duration: 3 });
}


// Create TTS audio
const audioPath = path.join(TMP, `tts_${shortid.generate()}.mp4`);
await ttsToFile(text, audioPath);


// Create slideshow concat file
const concatTxt = path.join(TMP, `slides_${shortid.generate()}.txt`);
const concatLines = [];
slides.forEach(s => {
concatLines.push(`file '${s.path.replace(/'/g, "'\\''")}'
`);
concatLines.push(`duration ${s.duration}
`);
});
// repeat last file to ensure ffmpeg accepts final duration
concatLines.push(`file '${slides[slides.length - 1].path.replace(/'/g, "'\\''")}'\n`);
fs.writeFileSync(concatTxt, concatLines.join(''));


const outPath = path.join(TMP, outName);


await new Promise((resolve, reject) => {
ffmpeg()
.input(concatTxt)
.inputOptions(['-f concat', '-safe 0'])
.input(audioPath)
.outputOptions(['-c:v libx264', '-c:a aac', '-pix_fmt yuv420p', '-shortest'])
.save(outPath)
.on('end', () => resolve(outPath))
.on('error', (err) => reject(err));
});


return { path: outPath };
}


module.exports = { createVideoFromText };
