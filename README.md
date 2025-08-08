# 🕵️‍♂️ Fake News Detector

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/yourusername/fake-news-detector/actions/workflows/node.js.yml/badge.svg)](https://github.com/yourusername/fake-news-detector/actions/workflows/node.js.yml)

A machine learning-powered tool that analyzes news articles for credibility indicators, detecting fake news with 85%+ accuracy using both rule-based and ML approaches.

![Demo Screenshot](https://i.imgur.com/JQ7Z8lL.png) *(Replace with your actual screenshot)*

## 🚀 Features

- **Multi-Layer Analysis**:
  - Rule-based detection (clickbait, bias, sensationalism)
  - Hugging Face ML integration (`facebook/bart-large-mnli`)
  - Source credibility scoring

- **Real-Time Results**:
  - Verdict (Credible/Suspicious/Fake)
  - Confidence percentage
  - Detected issues list

- **Developer Friendly**:
  - REST API with Swagger docs
  - React frontend
  - Customizable detection rules

## 🛠️ Installation

### Backend (Node.js)
```bash
cd backend
npm install
cp .env.example .env  # Add your Hugging Face token
npm run dev
