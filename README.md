# Flowers of Quran 🌸

Welcome to the **Flowers of Quran** project! This is a dedicated interactive platform designed for Quranic learning and competitions. It provides an engaging experience for users to participate in competitions, match Quranic phrases with their translations, and earn personalized certificates upon completion.

## 🌟 Features

- **Interactive Competitions**: Engaging UI where participants match Quranic phrases with their English translations.
- **Certificate Generation**: Automated, dynamic PDF certificate generation with unique, auto-incrementing certificate numbers for participants.
- **Admin Dashboard**: A comprehensive admin panel to view, manage, and verify participants and their scores.
- **Responsive Design**: Beautiful, mobile-first design with floating widgets and dynamic elements for a premium user experience.
- **Real-time Database Integration**: Powered by Supabase for secure data storage, participant tracking, and real-time updates.

## 🚀 Tech Stack

- **Frontend**: HTML5, Vanilla CSS, JavaScript
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL, Realtime, RPC functions)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) for client-side certificate generation
- **Hosting**: Designed to be hosted on any static site host (Vercel, Netlify, GitHub Pages) with Supabase as the backend.

## 📁 Project Structure

- `index.html`: The main landing page and entry point.
- `/src`: Contains core JavaScript (`quran_app.js`, `supabase-client.js`) and CSS stylesheets.
- `/assets`: Images, icons, and certificate templates.
- `/admin`: The secure admin portal to review participant data and certificates.
- `/participant`: Competition and participant forms.

## ⚙️ Setup Instructions

To run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/mohdfaizaan/flowers-of-quran.git
   ```
2. Open the project folder and launch a local development server (e.g., using VS Code Live Server or Python's `http.server`):
   ```bash
   # If using python
   python -m http.server 8000
   ```
3. Navigate to `http://localhost:8000` in your web browser.

> **Note**: For full backend functionality (like saving scores and generating certificate numbers), ensure your Supabase project URL and Anon Key are correctly configured in `src/js/supabase-client.js`.

## 🤝 Contributing

Feel free to fork the repository and submit pull requests if you have suggestions for improvements!

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
