# 🧬 HL7 Visualizer

![HL7 Visualizer Preview](./screenshots/app_preview.png)

## 🩺 Overview
**HL7 Visualizer** is a specialized tool for healthcare integration developers and clinicians. It transforms raw, human-unfriendly pipe-delimited HL7 v2 messages into an interactive, hierarchical data structure.

## ✨ Key Features
- **Instant Raw Parsing**: Paste any HL7 v2 message and see it decomposed in milliseconds.
- **Deep Hierarchical Tree**: Navigate through segments, fields, components, and sub-components.
- **Context-Aware Definitions**: Click any node to instantly view the industry-standard definition for that field (e.g., PID-3, MSH-9).
- **Premium UI/UX**: Dark mode by default, glassmorphism design, and smooth animations using Framer Motion.

## 🏗️ Architecture
The project follows a clean, component-based architecture:
- `hl7Parser.ts`: The "engine" that handles splitting by separators and building the recursive node tree.
- `definitions.ts`: A metadata repository for HL7 version 2.x segments and fields.
- `App.tsx`: The primary dashboard coordinating input, tree state, and definition rendering.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## 🛠️ Technical Stack
- **React 18** (Vite-powered)
- **TypeScript** for type safety
- **Framer Motion** for state transitions
- **Lucide React** for clinical iconography
- **Pure CSS** for the design system

---
*Built with precision for the healthcare industry.*
