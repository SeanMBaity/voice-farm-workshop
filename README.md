# 🌾 Voice Farm Game - Alexa Skill

A cozy, voice-first farming game for Amazon Alexa devices where users plant, water, and harvest crops using natural voice commands. Designed for relaxing daily gameplay sessions on Echo Show, Echo Dot, and Fire TV devices.

## 🎯 Game Overview

Voice Farm Game creates a joyful farming experience tailored for women aged 30-65 who enjoy casual games like FarmVille, Hay Day, or Animal Crossing. Players use voice commands to:

- 🌱 **Plant crops** - "Alexa, plant tomatoes"
- 💧 **Water plants** - "Alexa, water my crops" 
- 🌾 **Harvest crops** - "Alexa, harvest my strawberries"
- 📊 **Check farm status** - "Alexa, check my farm"

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- AWS Account
- Alexa Developer Account
- ASK CLI (Alexa Skills Kit Command Line Interface)

### Installation

1. **Clone and Install Dependencies**
   ```bash
   cd voice-farm-workshop
   npm install
   ```

2. **Install ASK CLI** (if not already installed)
   ```bash
   npm install -g ask-cli
   ask configure
   ```

3. **Deploy the Skill**
   ```bash
   ask deploy
   ```

4. **Test Locally**
   ```bash
   npm test
   ```

## 🎮 How to Play

### Getting Started
1. Say: **"Alexa, open Voice Farm"**
2. Follow the welcome prompts to start farming!

### Core Commands

| Action | Voice Commands | Example |
|--------|---------------|---------|
| **Plant** | "plant [crop]" | "plant tomatoes" |
| **Water** | "water my crops" | "water my carrots" |
| **Harvest** | "harvest my crops" | "harvest my strawberries" |
| **Check Farm** | "check my farm" | "how is my farm" |
| **Help** | "help" | "what can I do" |

### Available Crops
- 🍅 **Tomatoes** - 4 hours to grow, 10 XP
- 🥕 **Carrots** - 3 hours to grow, 8 XP  
- 🌽 **Corn** - 6 hours to grow, 15 XP
- 🍓 **Strawberries** - 5 hours to grow, 12 XP
- 🥬 **Lettuce** - 2 hours to grow, 6 XP

## 🏗️ Technical Architecture

### Project Structure
```
voice-farm-workshop/
├── lambda/
│   ├── index.js                 # Main Lambda entry point
│   ├── handlers/                # Intent handlers
│   ├── services/                # Game logic services
│   └── interceptors/            # Request/response logging
├── skill-package/
│   ├── skill.json              # Skill configuration
│   └── interactionModels/      # Voice interaction model
└── package.json                # Dependencies
```

### Core Components

#### 🎯 Intent Handlers
- **LaunchRequestHandler** - Welcome and onboarding
- **PlantCropIntentHandler** - Crop planting logic
- **WaterCropsIntentHandler** - Watering with audio feedback
- **HarvestCropsIntentHandler** - Harvesting with XP rewards
- **CheckFarmIntentHandler** - Farm status reporting

#### 🧠 FarmService
- **Crop Management** - Plant, water, harvest logic
- **Growth Timers** - Real-time crop maturation
- **XP System** - Experience points and leveling
- **Farm State** - In-memory storage (MVP)

#### 🎵 Audio Features
- **SSML Audio** - Water and harvest sound effects
- **Randomized Responses** - Varied, enthusiastic feedback
- **Emotional Design** - Cozy, encouraging tone

## 🧪 Testing

### Local Testing
```bash
# Run unit tests
npm test

# Test with ASK CLI simulator
ask dialog --locale en-US
```

### Echo Device Testing
1. Deploy skill to development stage
2. Enable skill in Alexa app
3. Test on physical Echo Show/Dot device

### Test Scenarios
```
User: "Alexa, open Voice Farm"
Alexa: "Welcome to Voice Farm! �� I'm so excited you're here!..."

User: "plant tomatoes"
Alexa: "Perfect! I've planted tomatoes in your farm! 🌱..."

User: "water my crops"  
Alexa: "[water sound] Ahh, perfect! Your crops are getting a lovely drink..."

User: "check my farm"
Alexa: "Welcome to your cozy farm! 🌾 You're level 1 with 0 experience points..."
```

## 📊 Development Milestones

### ✅ Milestone 1: Core Voice Loop (COMPLETE)
- Basic Alexa Skill with Plant/Water/Harvest intents
- FarmService with crop management logic
- Voice responses with audio feedback
- In-memory data storage

### 🔄 Milestone 2: Visual Farm Experience (NEXT)
- APL templates for Echo Show
- Visual crop states and animations
- Enhanced multimodal experience

### 📅 Milestone 3: Growth & Persistence
- DynamoDB integration
- Real-time growth timers
- User session persistence
- Push notifications

### 🚀 Milestone 4: Progression & Polish
- XP and leveling system
- Multiple crop varieties
- Subscription features
- GPT-4o mascot integration

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Deploy skill
ask deploy

# Test locally
npm test

# View logs
ask logs

# Update interaction model only
ask deploy --target skill-package

# Update Lambda only  
ask deploy --target lambda
```

## 🎨 Design Principles

### Voice-First Design
- **Natural Language** - Conversational, not robotic
- **Emotional Resonance** - Cozy, encouraging, joyful
- **Clear Feedback** - Immediate audio confirmation
- **Error Recovery** - Graceful handling of misunderstandings

### Casual Game Mechanics
- **Low Pressure** - No time stress or failure states
- **Daily Ritual** - 5-10 minute engagement sessions
- **Progress Persistence** - Real-time crop growth
- **Meaningful Rewards** - XP, levels, new crops

## 🔧 Configuration

### Environment Variables
```bash
# AWS Configuration (for production)
AWS_REGION=us-east-1
DYNAMODB_TABLE=voice-farm-users

# Skill Configuration
SKILL_ID=your-skill-id-here
```

### Crop Configuration
Modify crop settings in `lambda/services/FarmService.js`:
```javascript
this.cropConfig = {
  tomatoes: { growthTime: 4, xpReward: 10, name: 'tomatoes' },
  // Add new crops here
};
```

## 📝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions

---

**Happy Farming! 🌾** Enjoy building your cozy voice-controlled farm! 