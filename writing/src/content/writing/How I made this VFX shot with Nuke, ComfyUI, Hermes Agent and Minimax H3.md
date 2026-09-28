---
title: "How I made this VFX shot with Nuke, ComfyUI, Hermes Agent and Minimax H3"
description: "A work-in-progress case study of a VFX shot built through Nuke, ComfyUI, Hermes Agent, and MiniMax H3."
created: 2026-09-01
modified: 2026-09-01
tags:
  - note-type/writing/case-study
  - domain/vfx
draft: true
---

> WIP draft: This case study is still being written. The shot breakdown, images, and technical details may change before publication.

### how Hermes set up the project

the job came in over Discord from the EP at EditPostHouse: a Frame.io link labeled **“CLIPS FOR NICHOLAI,”** containing 15 GB of Alexa plates. i forwarded it to Hermes with one line: “set this up, please.”

that was the entire brief. Hermes already knew the rest from Signet, our shared knowledge base: the client, the project, and the temp v1 due the following Tuesday. it created the project directory in the studio’s Nextcloud, updated Signet with the new details, added the day’s tasks to my personal Obsidian, downloaded the plates, inspected each file with `ffprobe`, and logged the specs in `00_admin`.

Frame.io share pages are awkward for agents, so Hermes worked through its in-app browser. it clicked download on each asset, found the signed CloudFront URL in the network log, and handed it to `curl`.

none of this was bespoke scripting, which is the point. Hermes selected the relevant pieces from the VFX skill stack it had built across earlier jobs and handled the entire intake in about twenty minutes while i worked on something else.

![Dark-themed coding workspace showing a Python Nuke render babysitter script, a table of five Write nodes with frame ranges and durations, storage estimates, and terminal output from probing Nuke command-line behavior.](./How%20I%20made%20this%20VFX%20shot%20with%20Nuke,%20ComfyUI,%20Hermes%20Agent%20and%20Minimax%20H3-1787597683582.webp)

by the time i opened Nuke, the project was local, organized, and documented. 

### dolly-in

i started by generating a depth sequence with Depth Anything V2. in Nuke, i used it to displace a card, then keyframed a camera to dolly into the subject’s eye.

for anyone who hasn’t done projection work, this is why the shot looks like shit at this stage. a displaced card is still just a flat image stretched over approximate geometry. as the camera moves, each texel smears along the direction of travel; wherever the depth estimate is wrong—hair, eyelashes, the edge of the hand—the geometry wobbles between frames. the flicker and stretching aren’t bugs in the setup. they’re the cost of getting free parallax out of a single plate.

![3D graphics viewport showing a close-up facial image on a dark scene with perspective grids, wireframe guides, and a labeled Camera2 object.](./How%20I%20made%20this%20VFX%20shot%20with%20Nuke,%20ComfyUI,%20Hermes%20Agent%20and%20Minimax%20H3-1787597898816.webp)

![Close-up video frame of a person holding both hands in front of their face beside a partially visible color-editing interface.](./How%20I%20made%20this%20VFX%20shot%20with%20Nuke,%20ComfyUI,%20Hermes%20Agent%20and%20Minimax%20H3-1787597929000.webp)

the setup gave me the parallax and camera move i wanted, but not an image i could finish with. i used `gpt-image-2` to repair the worst artifacts and rebuild the frame at a higher resolution. it took a few attempts and some visual annotations for ChatGPT to follow.

no batch pipeline or anything clever here: i fed it a single frame and yelled at it until i got what i wanted.

![Krita editing window showing a close-up face photo with fingers over the face and red brush marks around the eyes, nose, and hands.](./How%20I%20made%20this%20VFX%20shot%20with%20Nuke,%20ComfyUI,%20Hermes%20Agent%20and%20Minimax%20H3-1787598220690.webp)

![Close-up portrait of a tearful person partly covering their face with both hands, wearing a large dark ring, against a black background.](./How%20I%20made%20this%20VFX%20shot%20with%20Nuke,%20ComfyUI,%20Hermes%20Agent%20and%20Minimax%20H3-1787597943591.webp)

i reprojected the cleaned frame onto the original geometry, rendered the second half through the same camera, blended the two passes with a `MorphDissolve`, added depth of field from the depth pass, and cached the result.

that fixed the large spatial distortions, but the move still had temporal problems: flicker, crawling detail, and instability inherited from the low-resolution projection geometry. i passed the cache through ComfyUI to repair what was still breaking from frame to frame.

![ComfyUI node graph for a reference-to-video workflow with a close-up eye preview and a Failed notification.](./How%20I%20made%20this%20VFX%20shot%20with%20Nuke,%20ComfyUI,%20Hermes%20Agent%20and%20Minimax%20H3-1787597969948.webp)

that pass ran `MiniMax-H3-REF2VA` as a `Q4_K_M` GGUF with the `qwen3vl` text encoder: 16 steps at 1536 × 864, using SageAttention, all on a single RTX 3090.

the prompt is long because the instruction was narrow. i wasn’t asking the model to invent a new shot; i was asking it to preserve the source motion, timing, identity, and parallax while replacing only the projection failures.

this is the exact prompt i used:
```
subject_definitions:
<Video 1> is the source comp: a single continuous shot reprojected onto depth-displaced geometry, so the camera push-in carries true parallax between facial planes.
<Subject 1> is the young man in <Video 1>, with his hand held over one eye.

summary:
[reference generation + video editing] The target video is a photorealistic restoration and enhancement of <Video 1>: a microscopic camera dollies into <Subject 1>'s eye with realistic parallax, the exact motion, timing, and depth structure of the source preserved while projection artifacts are repaired and detail is rebuilt at macro-lens fidelity.

retention_analysis:
<Video 1> (whole-video temporal structure): partially_preserved - the continuous take, dolly speed, and parallax structure are retained 1:1, but the stretched textures and flickering artifacts of the projection are deliberately corrected rather than preserved.
<Subject 1> (appears in [Shot 1]): fully_preserved - the man's identity, features, and the hand-over-eye pose are retained exactly as in <Video 1>.

detailed_description:
The target video is a photorealistic cinematic macro shot with natural skin rendering and no stylization.
[Shot 1] The shot opens on <Subject 1>, the young man with his hand covering one eye, framed exactly as in <Video 1>. A microscopic camera begins a slow, unbroken dolly toward the covered eye, matching the source move beat for beat: the same starting framing, the same constant push speed, and the same growing parallax between the near and far planes of his face and hand. As the camera closes in, the hand slides away from the eye in the same motion and timing as <Video 1>. Where <Video 1> shows projection stretching, the target video renders the same surfaces with correct, undistorted proportions: skin that appeared elongated or smeared along the direction of camera travel is rebuilt at its natural scale and texture, as though photographed directly rather than projected. Pores, eyebrow hairs, lashes, and knuckle creases keep a constant size and spacing relative to the face regardless of camera speed — nothing elongates, rubber-sheets, or slides across the surface. Temporal stability is absolute: every fine detail is locked frame to frame, with no flicker, shimmer, pulsing, or detail that appears and disappears between adjacent frames; the grain and texture of the skin remain continuous and steady through the entire push-in. The enhancement is otherwise uniform: skin resolves into fine continuous texture with visible pores and micro-wrinkles; eyebrow and lash hairs separate into distinct strands with correct thickness and direction; eyelid and crease geometry reads clean and dimensional; and as the eye fills the frame, the iris shows crisp radial fiber structure, a sharply defined pupil, natural corneal specular highlights, and a moist catchlight consistent with the source lighting. The image is materially sharper than <Video 1>, free of softness, ghosting, smearing, or compression artifacts, with the original color, contrast, and lighting preserved exactly. The shot ends on the same final framing as <Video 1>.

overall_soundscape:
Quiet room tone; a faint low ambience consistent with an interior space, staying constant through the push-in.

non_diegetic_music:
N/A
```

### notes came back, the shot got simpler

the client reviewed v001 and the direction changed. the transition wasn't multiple plates anymore, it was three pieces:

- shot A: still the dolly into his eye (what the comp above already did)
- the tunnel: one CG interior of an eyeball, built in blender. no plate stitching, no morphdissolve between passes
- shot B: the camera came back out of his OTHER eye, off a different plate (`A001C036_2607293T`). notes said the exit should be smooth, not rushed. leisurely.

i also had to add a 48 frame handle on the head of what i had. and the schedule got tight: 11pm delivery, about 7 hours out from when the notes landed.

for the CG interior i had Hermes dig an eyeball model out of the archive: a human generator eyeball from a jewelry ad job in feb 2024. the blend's textures weren't packed and weren't on the server at all, but it traced the dead paths in the file to the old project folder on the 20TB drive and recovered `iris.png`, `Sclera.png`, and the vein maps, all into `04_elements/`. the interior itself got fleshy red textures generated in chatgpt, sorted by brightness so they read as a set.

worth saying in the final article: the whole "AI repairs the projection" pipeline above still shipped in v001, and it was what made v001 read well enough to get notes at all. but the finished shot ended up mostly nuke and blender with the AI passes as support, not the spine. there was also a detour through seedance 2.0 for the eye-extension pass that never worked: it wouldn't follow the comp's motion faithfully and it blended the iris reference in as a crossfade rather than routing the camera through it. H3's retention grammar was the only thing that respected the source. (cut this paragraph if the seedance thing isn't interesting to readers, but it's an honest data point about what cloud video models couldn't do.)

Notes on how this article should be written: 
- I will be appending notes from my process here as I work
- the article should start with an introduction to the shot, showing the final version and then proceed to break down how it was made. 
- should explain how Ant running on Hermes Agent set up the project directory, and manages the pipeline (using the vfx skills he has)x

Tools used: NukeX, ComfyUI, GLM 5.3, GPT-Image-2, Hermes Agent, Minimax H3, DepthAnythingv2
