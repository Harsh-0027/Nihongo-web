🏯 NIHONGO DASH (日本語ダッシュ)
I built this because I found most Japanese learning apps either too cluttered or too slow. I wanted a clean, "no-nonsense" dashboard where I could switch between Hiragana and Kanji instantly and test myself without 50 extra clicks.

🛠 Why I built this
When I started learning, I kept forgetting the stroke order and the "why" behind the shapes. I built this app to solve three problems:

The "Everything at Once" Problem: Most quizzes mix everything. Mine lets you focus on one tab at a time.

Visual Memory: Every character has a mnemonic (memory aid) right next to its stroke order.

Speed: Using the Wanakana library, you can type your answers naturally, and the app handles the conversion.

📸 What it looks like
(Pro-tip: Drop a screenshot of your split-view modal here!)

🧩 The Cool Parts
The Smart Filter: The quiz logic checks which tab you're currently viewing and builds a custom deck on the fly. No manual setup needed.

KanjiVG Integration: I’m pulling live SVG data for stroke orders so you can see exactly how to draw the characters, not just a static image.

Master Mode: For when you're feeling brave—combines all 142 characters into one session.

🏗 Setup
If you want to play with the code:

npm install

npm start
Note: Make sure you have wanakana installed, as that handles the input magic.

🗺 Roadmap / Future Plans
[ ] Add "Dark Mode" for late-night study sessions.

[ ] Track "Wrong Answer" streaks to show users which characters they struggle with most.

[ ] Add audio pronunciation clips.