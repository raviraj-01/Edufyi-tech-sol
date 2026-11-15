# Hero asset prompts (Google Flow)

Flow's menus and model names change often, so I am going by the general idea: generate two still frames, then use "frames to video" with a first and last frame. If your version has no last-frame option, use first-frame only and trim the clip.

## 1. Is Flow a good idea?

Yes for the look, with limits you should plan around.

**Good:** glass, gems and glow are very hard to model by hand and easy for an image/video model. You get a polished hero in hours, not days.

**Limits:**
- **No transparent background.** The video has its own background baked in. This decides how you build the page (section 9).
- **Not interactive.** It is a video, not a 3D scene. Interactivity comes from CSS tilt on top.
- **Consistency.** The pedestal and card shape can drift between frames. Generate the end frame first, then derive the start frame from it.
- **No readable text.** Never ask for text on the card or in the scene. The backdrop word and headline are real HTML.
- **Credits and rate limits.** Iterations cost credits. Cap yourself.
- **File size.** Raw clips are large. You must compress them.

**Spline alternative.** You already know Spline. It gives a real interactive 3D scene that follows the mouse, but glass refraction and the glowing emerald look are much harder to get there. Use Spline only if the program wants real-time 3D. Otherwise Flow looks better with less work.

**Be ready to explain it.** A reviewer will ask what you built. Say: "The 3D visuals are generated, the page, motion, API and database are mine." And put it in the README credits.

## 2. Time box

- Budget: **one day, spread over Days 0 to 6**. Generate in the background while you code.
- Success is one good intro clip. The idle loop is a bonus.
- Fallback (section 11) means the asset can never block you.

## 3. Style bible

Paste this at the start of every image prompt so all frames share one look.

```
Premium 3D product render, dark emerald and deep teal palette, glossy glass and polished metal,
soft volumetric green glow behind the subject, studio lighting with crisp rim light,
shallow depth of field, near-black smooth gradient background, 16:9 widescreen,
high quality, detailed, no text, no logos, no watermark.
```

## 4. Frame B (END): the hero shot. Make this first.

```
[style bible]

A single floating credit-card-shaped slab of dark green glass, standing on its corner like a diamond,
rotated 45 degrees, hovering just above a stepped pedestal made of stacked translucent emerald-teal cubes.
Swirling circuit-like patterns frozen inside the glass, sharp bright edge highlights, a small embedded chip
with no numbers or text. Four polished emerald gems float around the card, two on each side, at different heights.
Soft green glow behind the card. Camera straight on, eye level, locked.
Composition: card centered horizontally and slightly above center. Empty dark space in the upper third for a large
background word. Lower left and lower right corners calm and dark for interface elements.
Background very dark green fading to near black, no floor clutter, no reflections that touch the edges.
```

Generate 4 to 8 options. Pick one by this checklist:
- [ ] Card edges are clean, no melted corners
- [ ] No text or numbers anywhere
- [ ] Pedestal is simple (easy to keep consistent)
- [ ] Background is dark and smooth, close to black at the edges
- [ ] Empty space where the headline and stats card will sit

## 5. Frame A (START): derived from B

Use the image edit / "ingredient" feature with Frame B as the reference so the pedestal, lighting and camera stay identical.

```
Same scene, same camera, same pedestal, same lighting, same background as the reference image.
Change only this: the glass card stands upright facing the camera, smaller and lower, half hidden
behind the top of the pedestal, not rotated. The four emerald gems rest on the pedestal base
instead of floating. The glow is dimmer. Keep everything else identical.
```

If the model keeps changing the pedestal, say so in the prompt: "do not change the pedestal."

## 6. Clip 1: intro (first frame A, last frame B)

```
Locked camera, no camera movement, no zoom. The dark glass card rises smoothly from behind the pedestal
while rotating into a diamond orientation, and settles into the final pose with a tiny ease-out.
As it lifts, the four emerald gems detach from the pedestal and drift upward into their floating positions.
One soft light sweep glides across the glass surface. The green glow gradually brightens.
Smooth, weighty, elegant motion. 6 seconds. No cuts.
```

Negative prompt (if there is a field for it):

```
text, letters, numbers, watermark, logo, people, hands, camera movement, zoom, cut, flicker,
extra objects, extra cards, distorted card, melting, morphing pedestal, shaky motion
```

## 7. Clip 2: idle loop (first frame B, last frame B)

```
Locked camera. The glass card hovers and bobs up and down by a very small amount and sways a few degrees.
The four gems drift in slow small orbits and return to where they started.
A faint shimmer passes over the glass. Calm, seamless loop, 6 seconds. No cuts, no camera movement.
```

Using the same image for first and last frame helps the loop, but check the join by playing it on repeat. If it jumps, trim 0.3s from the end, or crossfade the end into the start in your editor.

## 8. After generating: compress

Install ffmpeg first (https://ffmpeg.org). Replace the names with your files.

```bash
# intro, mp4 (broad support)
ffmpeg -i flow-intro.mp4 -vf "scale=1920:-2,fps=30" -c:v libx264 -crf 24 -preset slow \
  -pix_fmt yuv420p -movflags +faststart -an hero-intro.mp4

# intro, webm (smaller in Chrome and Firefox)
ffmpeg -i flow-intro.mp4 -vf "scale=1920:-2,fps=30" -c:v libvpx-vp9 -crf 34 -b:v 0 -an hero-intro.webm

# loop, same settings
ffmpeg -i flow-loop.mp4 -vf "scale=1920:-2,fps=30" -c:v libx264 -crf 26 -preset slow \
  -pix_fmt yuv420p -movflags +faststart -an hero-loop.mp4
ffmpeg -i flow-loop.mp4 -vf "scale=1920:-2,fps=30" -c:v libvpx-vp9 -crf 36 -b:v 0 -an hero-loop.webm

# poster = first frame of the intro (what shows before playback)
ffmpeg -i hero-intro.mp4 -frames:v 1 hero-poster.jpg

# end frame = last frame of the intro (used as the still fallback)
ffmpeg -sseof -0.1 -i hero-intro.mp4 -update 1 -frames:v 1 hero-end.jpg
```

Convert the two JPGs to WebP (squoosh.app works) and aim for 150 KB or less for the poster.

Check sizes: intro 3 MB or less, loop 2 MB or less. If bigger, raise `-crf` by 2 to 4 or drop the intro to 1280 wide. If 720p from Flow looks soft at the card edge, that is a good reason to upscale before compressing, not after.

## 9. Putting it on the page

Layer order (back to front): background gradient, backdrop word, video, UI.

Because the video cannot be transparent, make its background near black and blend it with `screen`. In screen mode black becomes see-through, so your CSS glow and the backdrop word show through, and only the bright parts of the card and gems stay.

```css
.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  mix-blend-mode: screen;
}

.backdrop-word {
  opacity: 0.25;   /* keep it low, it will show faintly through dark parts of the card */
}
```

Known catch: the dark parts of the card are also close to black, so the backdrop word can ghost through them. Keep the word faint (0.25 or lower). That actually suits the glass look.

Fallback if screen blend looks wrong:
1. Remove the blend mode.
2. Make the page background around the card match the video's background.
3. Feather the video edges so you do not see a box:

```css
.hero-video {
  mask-image: radial-gradient(ellipse at center, #000 55%, transparent 75%);
}
```

Test on a real phone. Blend modes and large videos behave differently there.

## 10. Other assets

- **Logo mark:** draw a simple original mark in Figma (three stacked chevrons, or a rising arrow in a rounded square). Export as SVG. Do not trace the reference logo.
- **Favicon:** the same mark, as `favicon.svg`.
- **Open Graph image (1200 x 630):** screenshot of the finished hero, cropped.
- **Gems or extra 3D bits:** not needed. Skip them.
- **Social icons:** inline SVG, no icon library.

## 11. Fallback if the video is not good in time

If there is no usable clip by the end of Day 6:
1. Use `hero-end.webp` (Frame B) as a normal image in the same spot.
2. Add a gentle CSS float:

```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-12px); }
}
.hero-still { animation: float 6s ease-in-out infinite; }
```

3. Keep the mouse tilt. A still image with float and tilt still looks premium.

## 12. README line

> Hero 3D visuals generated with Google Flow and compressed with ffmpeg. All code, layout, motion, API and database are hand-written.
