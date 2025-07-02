# 🌾 Voice-First Farm Game — Product Requirements Document (PRD)

---

## 📌 Overview

### Elevator Pitch

A cozy, joyful farming game built for **Amazon Alexa** voice-first devices (Echo Show, Echo, Fire TV) where users plant, water, and harvest crops using their voice. Designed to create a relaxing daily ritual for women aged 30–65, it blends visual charm, natural soundscapes, and conversational play into a multimodal experience.

### Problem Statement

Voice-first platforms lack habit-forming, emotionally rewarding casual games for adult women. Current voice games are overly simplistic, lack visual charm, and do not provide a compelling reason to return daily. This game fills that gap with a joyful, richly designed farm simulator.

### Core User Story

> "As a casual player with an Alexa device, I want to use my voice to manage a cute, visual farm — planting crops, watering them, and coming back to harvest them later — so I feel relaxed and accomplished in short daily sessions."

---

## 🎯 Goals

- Build a prototype of a voice-first farming game using Alexa multimodal capabilities (voice + APL).
- Deliver a 5–10 minute daily gameplay loop centered around crop management.
- Create joyful emotional resonance via art, animation, audio, and character feedback.
- Include notifications, progress persistence, and a simple subscription model.

---

## 👤 Target Users

### Primary Audience

- Women aged **30–65**
- Fans of casual games like **FarmVille**, **Hay Day**, or **Animal Crossing**
- Owners of **Echo Show, Echo Dot, or Fire TV** devices

### Motivations

- Enjoy calming, cozy routines
- Want non-stressful entertainment
- Interested in light management and growth mechanics

---

## 🧩 Feature Set

### 1. 🌱 Planting Crops

- User uses voice to plant a crop: e.g., "Alexa, plant tomatoes"
- Visual feedback shows soil plot and seed animation
- Audio confirms with mascot voice: “Tomatoes planted!”

**User Story**: "As a player, I want to plant a crop using my voice, so I can start growing my farm."

### 2. 💧 Watering Crops

- Voice interaction: "Water my crops" or "Give water to the carrots"
- Plays one of several randomized watering sound effects
- Visual animation: watering can sprite over crop plots

**User Story**: "As a player, I want to water my crops with varied sound/visuals, so it feels alive and engaging."

### 3. ⏲️ Growth Timers

- Crops mature after a fixed interval (e.g., 4 hours for carrots, 6 hours for corn)
- Timers persist in DynamoDB or similar
- Alexa can remind players when crops are ready

**User Story**: "As a player, I want crops to take real time to grow so I feel excited to return later."

### 4. 🌾 Harvesting Crops

- Voice interaction: “Harvest my strawberries”
- Sound effects: harvest ‘pluck’ sound, character celebration
- Rewards: coins or XP to unlock new seeds

**User Story**: "As a player, I want to harvest mature crops for rewards, so I feel progress."

### 5. 🪙 Unlockables & Progression

- XP system tied to harvesting and watering
- New seeds unlock at level thresholds (e.g., wheat at level 3)
- Option to unlock visual upgrades (decor, tools) with subscription

**User Story**: "As a player, I want to unlock new seeds and tools so I stay motivated to progress."

### 6. 📱 Visuals (APL)

- Uses Alexa Presentation Language (APL) for animated farm screen
- Farm mascot appears to give voice lines
- Visual timer indicators over crops

**User Story**: "As a player on Echo Show, I want to see my farm, so I feel more immersed."

### 7. 🔔 Notifications & Reminders

- Alexa sends push notification: “Your sunflowers are ready to harvest!”
- Opt-in per Alexa guidelines

**User Story**: "As a player, I want reminders so I don’t forget to come back to my crops."

### 8. 💬 Conversational Mascot (GPT-4o)

- Character mascot (e.g., a scarecrow) powered by GPT-4o responds to:
  - "What should I plant today?"
  - "Tell me how my farm’s doing."
- Integrates tone-matching with the cozy theme

**User Story**: "As a player, I want a friendly mascot to talk to so the game feels alive and personal."

### 9. 💸 Subscription Tier

- $X/month via Alexa In-Skill Subscriptions
- Benefits:
  - Premium seeds
  - Visual boosters
  - Voice skin variations

**User Story**: "As a player, I want more content and cosmetics so I feel rewarded for subscribing."

---

## 🏗️ Non-MVP / Future Features

- Multiplayer / friend farms
- Mini-games (pest control, harvesting races)
- Weather events
- Seasonal cosmetics (e.g. snow farm)

---

## 🛠️ Technical Requirements

- Alexa Skill using ASK SDK v2 (Node.js preferred)
- DynamoDB or S3 for persistence
- APL visual layer for Echo Show
- In-Skill Purchasing API
- GPT-4o integration via OpenAI API (in-skill)
- Notifications opt-in via Alexa permissions
- Audio SFX stored in S3

---

## 🧪 Milestones & Deliverables

### Milestone 1 — Core Loop Prototype (Week 1–2)

- **Acceptance**: Plant, water, wait, harvest all work with clear feedback

### Milestone 2 — Visual Farm & Notifications (Week 3–4)

- **Acceptance**: User sees and is reminded of crop states without asking

### Milestone 3 — Progression + Subscription (Week 5)

- **Acceptance**: Subscription is gated and functional with working benefits

### Milestone 4 — Mascot + GPT-4o Integration (Week 6)

- **Acceptance**: User can chat with mascot and receive tailored advice

---

## 📊 Success Metrics

- Daily Active Users (DAU)
- Session length (goal: 5–10 minutes)
- Subscription conversion rate
- User retention (D1, D7, D30)
- NPS / feedback from early test group

---

## 🔍 Notes & Open Questions

- Set crop timer lengths and growth curve pacing
- Design mascot personality, voice lines
- Tune XP curve for first 7 days of retention
- Decide on number of crops and visuals for MVP

---

## 🤖 LLM & Image Gen Integrations

- **GPT-4o**: Scarecrow/maskot dialog, planting suggestions, random farm facts
- **fal.ai**: Optional visual boosters, crop label art, iconography

---

## 📦 Assets

- Pastel farm background art
- Farm crop sprites (3–5 initial crops)
- Audio library: watering, planting, harvesting (3+ variants each)
- Voice actor lines (or AI voice)

---

## 🔐 Alexa Skill Permissions

-

---

> End of PRD
