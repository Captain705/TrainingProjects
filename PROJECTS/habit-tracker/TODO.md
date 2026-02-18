# Habit Tracker App - Implementation Plan

## Project Overview
- **Project Name**: Habit Tracker with Calendar Heatmap
- **Type**: Single Page Web Application
- **Core Functionality**: Track daily habits with GitHub-style calendar heatmap visualization
- **Target Users**: Anyone looking to build and track daily habits

## File Structure
- PROJECTS/habit-tracker/index.html
- PROJECTS/habit-tracker/style.css
- PROJECTS/habit-tracker/script.js

## Features to Implement

### 1. Habit Management
- Add new habit with name
- Display list of habits
- Delete habit
- Select active habit
- Each habit has: name, creation date

### 2. Calendar Heatmap
- Show last 365 days
- GitHub-style grid layout
- Each day is a small square
- Color intensity based on completion count
- Colors: Light gray (no activity) → Light green → Green → Dark green

### 3. Mark Habit Completion
- Click on any day to toggle completion
- Update heatmap instantly
- Save in localStorage

### 4. Statistics
- Total completed days
- Current streak
- Longest streak
- Completion percentage

### 5. Local Storage
- Save habits list
- Save completion history
- Structure: { "HabitName": { "2026-02-18": true, ... } }

### 6. UI Features
- Dark/light theme toggle
- Hover tooltips showing date and status
- Smooth color transitions
- Responsive design (mobile, tablet, desktop)

## Implementation Order
1. Create index.html with structure
2. Create style.css with glassmorphism theme
3. Create script.js with all functionality
4. Test the application

## Acceptance Criteria
- [ ] Can add new habits
- [ ] Can delete habits
- [ ] Calendar heatmap shows 365 days
- [ ] Clicking a day toggles completion
- [ ] Statistics update correctly
- [ ] Data persists after page refresh
- [ ] Theme toggle works
- [ ] Responsive on mobile/tablet/desktop
