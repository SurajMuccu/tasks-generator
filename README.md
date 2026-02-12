# Tasks Generator – Mini Planning Tool

## Overview

This is a full-stack web application that generates structured feature specifications using an LLM.

The app allows users to:
- Enter a feature idea (goal, users, constraints)
- Generate user stories and engineering tasks
- Edit and reorder tasks via drag-and-drop
- Export results as Markdown
- View the last 5 generated specs
- Check system health (backend, database, LLM)
- Toggle between light and dark mode

---

## Live Demo

Frontend: (Add your Vercel link here)  
Backend API: (Add your Render link here)

---

## Tech Stack

Frontend:
- React (Vite)
- React Router
- @dnd-kit (drag & drop)
- Custom CSS (dark mode support)

Backend:
- Node.js
- Express
- SQLite
- Axios

LLM Provider:
- Groq API
- Model: `llama-3.3-70b-versatile`

---

## Features Implemented

- Structured prompt-based task generation
- JSON validation for LLM output
- Persistent SQLite storage
- Drag-and-drop reordering
- Markdown export
- Recent history (last 5 specs)
- System health status page
- Dark mode toggle
- Environment-based configuration

---

## Basic Input Validation

- Goal and Users fields are required
- Backend handles LLM errors gracefully
- JSON parsing validation before saving

---

## How to Run Locally

### Backend

```bash
cd server
npm install
node index.js
