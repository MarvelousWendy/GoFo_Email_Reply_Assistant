# 📧 邮件回复决策助手 · GOFO 电邮服务组

> **Email Reply Decision Assistant** — a guided decision-tree tool for GOFO customer service email operations.  
> Available in **Chinese (中文)** and **Italian (Italiano)**.

[![Made with ❤️](https://img.shields.io/badge/made%20by-Wendy-ff69b4.svg)](https://github.com/MarvelousWendy)

---

## 🎯 What it does

This tool walks customer service agents through a structured decision tree to handle inbound emails. Based on the **GOFO Email Reply SOP** and **Inbound Classification Table**, it guides operators step-by-step to determine:

- ✅ **Reply template** (which canned response to use)
- 🏷️ **Registration category** (how to classify the case)
- 🚨 **Escalation** (whether to escalate)
- 📋 **Problem report** (whether to file a problem ticket)
- 📎 **Required attachments or evidence**

All you need is the email open in Udesk and the tracking info in CPS.

---

## ✨ Features

- **Interactive decision tree** — 22 question nodes leading to 61 result nodes
- **83 total nodes** covering the full SOP classification table
- **5 top-level categories**: Security (`安全类`) > Service (`服务类`) > Timeliness (`时效类`) > Requests (`需求类`) > Others (`其他类`)
- **Grid layout** for main scenario selection — 4×3 grid avoids excessive scrolling
- **Urgency-based color coding** — red (`danger`) · orange (`warn`) · green (`ok`) on critical options
- **One-click copy** of the conclusion to clipboard
- **Breadcrumb navigation** with back/restart controls
- **Deep & light mode** support — follows system `prefers-color-scheme`
- **Multi-language** — Chinese (中文) ↔ Italian (Italiano) with one-click switching, state preserved

---

## 🚀 Quick Start

Just open `index.html` in any modern browser — no build step, no dependencies.

```bash
# Clone or download
git clone <your-repo-url>
cd 邮件回复小工具

# Open in browser
open index.html   # macOS
# or simply double-click index.html
```

---

## 📁 Project Structure

```
邮件回复小工具/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Stylesheet (CSS variables, dark mode, responsive)
└── js/
    ├── data.js          # Decision tree data (Chinese)
    ├── data-it.js       # Decision tree data (Italian)
    └── app.js           # Application logic (routing, i18n, rendering)
```

---

## 🔧 How It Works

1. The user answers a series of guided questions about the email case
2. Each answer navigates the decision tree to the next question
3. At the end, a result card shows:
   - The appropriate reply template
   - Category classification
   - Whether to escalate
   - Whether to file a problem report
   - Operational notes and SOP references
4. Results can be copied to clipboard with one click

### Decision Flow

```
Start
  ├─ Step 1: Is this a local-country email?
  ├─ Step 2: Valid tracking number?
  ├─ Step 3: Ticket association check
  └─ Step 4: Main scenario (12 options in 4×3 grid)
       ├─ Unreceived → Status check (5×2 grid)
       ├─ Delivered not received → POD check
       ├─ Modify info → Address / Phone / Name
       ├─ Damage → Type + POD check
       ├─ Wrong/missing items → Verify waybill
       ├─ Thanks / Notification
       ├─ Service complaints → 11 types by urgency
       └─ Other requests
```

---

## 🌐 Language Support

| Language | Button Label | Data File |
|----------|-------------|-----------|
| Chinese (简体中文) | `中文` | `js/data.js` |
| Italian (Italiano) | `Italiano` | `js/data-it.js` |

Language preference is persisted via `localStorage`. Switching languages preserves your current position in the decision tree.

---

## 🎨 Dark Mode

Automatically adapts to your system preference (`prefers-color-scheme: dark`). All colors are defined via CSS custom properties on `:root`.

---

## 📊 Classification Coverage

Based on the GOFO Inbound Classification Table (CSV):

| Category | Coverage |
|----------|----------|
| Security (`安全类`) | 100% — Loss, Damage, Missing, Wrong items |
| Service (`服务类`) | 100% — Courier complaints, System feedback, Positive feedback |
| Timeliness (`时效类`) | 100% — Delivery tracking, Stall monitoring |
| Requests (`需求类`) | 100% — Info changes, Returns, Claims, Cancellations |
| Others (`其他类`) | 100% — Consultations, Wrong country, No tracking |

---

## 🛠️ Tech Stack

- **Vanilla JavaScript** (ES5-compatible IIFE) — zero dependencies
- **CSS Grid** for scenario selection layouts
- **CSS Custom Properties** for theming (light/dark)
- **localStorage** for language persistence
- **Clipboard API** with fallback for copy functionality

---

## 📝 License

MIT — see [LICENSE](LICENSE) for details.

---

## 👩‍💻 Author

Created by **[Wendy](https://github.com/MarvelousWendy)** 🧑🏼‍💻

---

> ⚠️ **Disclaimer**: This tool provides decision support based on the SOP and Classification Table. **Every case must be evaluated individually.** The tool does not replace human judgment.
