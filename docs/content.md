# 🌸 Flowers of Quran — Content & Implementation Guide

This document contains the segregated copy and step-by-step implementation instructions for the **Flowers of Quran** platform (Target Audience: **Children / School Students**).

---

## 📋 1. Official Platform Content & Copy

### 🏷️ Platform Metadata
- **Project Name:** Flowers of the Quran (*Flowers of Quran*)
- **Parent Initiative:** Part of the *'Aayaatul Quran'* Project
- **Target Audience:** Children & School Students
- **Format:** Blended learning (Printed Book + Interactive Online Quizzes)
- **Theme Emoji / Icon:** 🌸 Flower

---

### 🌟 Hero Section Copy
- **Main Heading / Headline:**
  > *Enter the Garden of the Quran, Discover Its Beautiful Flowers*
- **Welcome & Hero Description:**
  > *"Welcome to “Flowers of the Quran” — a special place for children to discover, understand, and follow the beautiful and meaningful teachings of the Quran."*
- **Badge / Tag:**
  > `✨ Official Islamic Quiz Platform`
- **Sub-tag / Metrics:**
  > `🌸 24 Blooming Levels • 72 Quizzes`

---

### 📖 About Us / About Our Project Copy
- **Section Heading:**
  > *About Flowers of Quran*
- **Subheading:**
  > *About our project:*
- **Body Paragraph 1 (Overview):**
  > *Flowers of Quran is a part of 'Aayaatul Quran' Project and it combines a printed book with online learning.*
- **Body Paragraph 2 (Audience Welcome):**
  > *We warmly welcome children to join us in learning and understanding the verses of the Quran.*
- **Body Paragraph 3 (Community & Volunteer Call to Action):**
  > *We also invite volunteers to assist in delivering the book to school students, and we welcome sponsors and supporters to help us spread the message of the Quran.*
- **Hadith Inspiration & Mission Box:**
  > *Inspired by the Hadith, “Pass on from me, even if it is only one verse” (Sahih al-Bukhari: 3461). Let us all work together to convey the message of the Quran, especially to the next generation.*

---

## 🛠️ 2. Implementation Instructions for `index.html`

Follow these instructions to apply this content into `flowers of quran/index.html`.

### A. Update Hero Section (`#home`)
Locate `<div class="hero-content">` (around lines 61–70 in `index.html`):

```html
<!-- Left Side: Intro Content -->
<div class="hero-content">
  <span class="hero-tag">✨ Official Islamic Quiz Platform</span>
  <h1 class="hero-main-title">Enter the Garden of the Quran,<br>Discover Its Beautiful Flowers</h1>
  <p class="hero-description">
    Welcome to “Flowers of the Quran” — a special place for children to discover, understand, 
    and follow the beautiful and meaningful teachings of the Quran.
  </p>

  <!-- Bottom Left Action Area -->
  <div class="hero-action-area">
    <button class="btn-hero-start" id="btn-start-quiz">
      Start Quiz ➔
    </button>
    <span class="hero-note">🌸 24 Blooming Levels • 72 Quizzes</span>
  </div>
</div>
```

---

### B. Update About Modal (`#about-modal`)
Locate `<div class="modal-overlay" id="about-modal">` (around lines 356–382 in `index.html`):

```html
<!-- About Modal -->
<div class="modal-overlay" id="about-modal">
  <div class="modal-card" style="max-width: 540px;">
    <div class="modal-header">
      <button class="btn-close-modal" id="btn-close-about">✕</button>
      <div style="font-size: 3rem; margin-bottom: 4px;">🌸</div>
      <h2 style="font-family: var(--font-heading); font-size: 1.6rem; color: #fff;">About Flowers of Quran</h2>
    </div>
    <div class="modal-body" style="padding: 24px; text-align: left; line-height: 1.6;">
      <h3 style="font-family: var(--font-heading); font-size: 1.15rem; color: var(--gold-dark); margin-bottom: 10px; font-weight: 700;">About our project:</h3>
      <p style="margin-bottom: 14px; font-weight: 600; color: var(--text-dark);">
        <strong>Flowers of Quran</strong> is a part of <em>'Aayaatul Quran'</em> Project and it combines a printed book with online learning.
      </p>
      <p style="margin-bottom: 14px; color: #4B5563;">
        We warmly welcome children to join us in learning and understanding the verses of the Quran.
      </p>
      <p style="margin-bottom: 14px; color: #4B5563;">
        We also invite volunteers to assist in delivering the book to school students, and we welcome sponsors and supporters to help us spread the message of the Quran.
      </p>
      <div style="background: var(--gold-light); border: 1.5px solid var(--gold-border); border-radius: 12px; padding: 14px; margin-top: 16px;">
        <p style="color: var(--gold-dark); font-style: italic; font-weight: 600; font-size: 0.95rem; line-height: 1.5;">
          Inspired by the Hadith, “Pass on from me, even if it is only one verse” (Sahih al-Bukhari: 3461). Let us all work together to convey the message of the Quran, especially to the next generation.
        </p>
      </div>
    </div>
  </div>
</div>
```

---

### C. Meta Tags & SEO
Ensure the `<head>` section contains the matching description:

```html
<title>Flowers of Quran - Kid-Friendly Islamic Quiz Platform</title>
<meta name="description" content="Flowers of the Quran — a special place for children to discover, understand, and follow the beautiful and meaningful teachings of the Quran. Combines printed book with online learning.">
```
