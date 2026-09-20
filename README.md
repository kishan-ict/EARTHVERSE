# EARTHVERSE — Beyond Reality

A browser-first 3D prototype for the EARTHVERSE virtual universe. The player begins in a futuristic gaming room, chooses Guest or Official Gamer access, interacts with a virtual PC and VR headset, creates a persistent local identity, customizes a human form, and enters the EARTHVERSE gateway.

## Play

The project is a zero-build static web game. Open the GitHub Pages deployment after Pages is enabled for this repository.

## Controls

- `W A S D` — move
- Mouse — look (click the game to capture the pointer)
- `E` — interact with the PC, VR headset, or wardrobe
- `Esc` — release the mouse

## Prototype features

- 3D gaming room rendered with Three.js
- Third-person human avatar
- Guest and Official Gamer flows
- Login and registration interface
- 15-second identity initialization sequence
- Male/female body selection and outfit color selection
- Real-world seven-day body-change cooldown stored locally
- Animated transition into EARTHVERSE
- Responsive UI for desktop and mobile browsers

## Important prototype note

Authentication and profile data use browser `localStorage` in this milestone. Production accounts, OTP verification, secure passwords, and server-enforced cooldowns will require a backend in a later phase. Do not enter a real password during this prototype.

## Technology

Static HTML, CSS, JavaScript, WebGL, and Three.js. No local installation is required for players.
