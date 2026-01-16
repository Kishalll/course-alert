# SpawnTrap (VTOP Monitor)

SpawnTrap is a Chrome extension designed to assist students with course registration on VTOP. It automates the process of checking for available seats and provides immediate notifications when a slot opens up.

## Tech Stack

The extension is built to be lightweight and efficient:

*   **HTML & CSS**: Provides the settings popup and the injected control panel interface.
*   **Vanilla JavaScript**: Handles all logic and DOM manipulation directly for optimal performance, without external frameworks.
*   **Chrome Extension API (Manifest V3)**:
    *   `content.js`: Interacts with the VTOP page to detect course and faculty availability.
    *   `background.js`: Manages system notifications.
    *   `storage`: Persists user configuration settings.

## Installation Guide

1.  **Download** or clone this repository to your local machine.
2.  Open Google Chrome and navigate to `chrome://extensions`.
3.  Enable **Developer mode** using the toggle in the top right corner.
4.  Click **Load unpacked**.
5.  Select the directory containing the extension files (`course-alert`).

## Usage

1.  **Configuration**:
    *   Click the extension icon in the toolbar.
    *   Enter the **Course Code** (e.g., `BCSE302L`), **Faculty Name** (e.g., `Sivaraja`), and **Preferred Slots**.
    *   (Optional) Configure Twilio settings for SMS alerts.
    *   Click **SAVE & APPLY**.

2.  **Operation**:
    *   Log in to the VTOP registration portal.
    *   The SpawnTrap control panel will appear in the bottom right corner.
    *   Navigate to the course list. The tool will automatically locate the course, check the specific faculty, and alert you if a seat is found.

---
*Made with ❤️ by Kishall*
