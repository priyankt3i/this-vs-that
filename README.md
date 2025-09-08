# This vs. That: AI Product Comparator

An intelligent web application that takes two product names and generates a detailed side-by-side comparison table and a contextual AI-powered analysis, all powered by the Google Gemini API.

---

![This vs. That Screenshot](https://storage.googleapis.com/aistudio-project-co-lab-assets/this-vs-that-screenshot.png)

## ✨ Core Features

*   **Dynamic Product Comparison**: Enter any two products, from smartphones and electric scooters to more abstract concepts, and get an instant comparison.
*   **AI-Generated Comparison Table**: A detailed, side-by-side table of features and specifications is generated on the fly. The AI intelligently determines the relevant comparison criteria based on the product category.
*   **Contextual AI Analysis**: Beyond raw specs, the app provides a witty, insightful, and easy-to-read summary explaining the key differences, pros, cons, and a final recommendation.
*   **Product Image Display**: Fetches and displays high-quality images for each product to make the comparison more visual. Includes graceful fallbacks to a placeholder.
*   **Smart Auto-Suggestions**: As you type, the app suggests relevant product names to speed up your search.
*   **Category Sanity Check**: Try to compare "My Mom" vs. "My Dad"? The app features a witty error handler that gently tells you why the comparison is absurd.
*   **Sleek, Responsive UI**: A modern, clean interface built with Tailwind CSS.
*   **Light & Dark Mode**: A beautiful, themeable interface that respects your system preference and can be toggled manually.

## 🛠️ Tech Stack

*   **Frontend**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **AI Engine**: [Google Gemini API](https://ai.google.dev/) via the `@google/genai` SDK.
*   **Bundler**: This project is set up to run in an environment like Google AI Studio, which handles bundling and dependencies via import maps.

## 🚀 How It Works

The magic of this application lies in its advanced prompt engineering and the ability of the Gemini API to return structured JSON data.

1.  **User Input**: The user enters two product names into the input form.
2.  **Prompt Construction**: The `fetchComparison` function in `services/geminiService.ts` constructs a detailed prompt. This prompt instructs the AI to:
    *   First, perform a sanity check to see if the products are comparable.
    *   If they are not, generate a witty remark and stop.
    *   If they *are* comparable, identify the product category.
    *   Generate a detailed list of features and specs relevant to that category.
    *   Find high-quality, public image URLs for both products.
    *   Write a concluding analysis.
3.  **Structured Output**: Crucially, the prompt tells the AI to format its entire response as a single, clean JSON object that matches a predefined `responseSchema`. This eliminates the need for fragile string parsing on the frontend.
4.  **Frontend Rendering**: The React application receives this structured JSON. It then breaks the data down and passes it to the relevant components (`ComparisonHeader`, `ComparisonTable`, `AiAnalysis`) to render the results in a user-friendly format.

## 📦 Local Setup and Installation

To run this project on your local machine, follow these steps:

**1. Prerequisites**
*   [Node.js](https://nodejs.org/) (v18 or later recommended)
*   A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

**2. Clone the Repository**
```bash
git clone https://github.com/your-username/this-vs-that.git
cd this-vs-that
```

**3. Install Dependencies**
This project uses an `importmap` for dependencies, so a standard `npm install` for them is not required. However, you'll need a local server to run the `index.html` file. We recommend using `vite` for a simple and fast development experience.

```bash
npm install -g vite
```

**4. Set Up Environment Variables**
The API key is managed through an environment variable. When running locally with a tool like Vite, you can create a `.env.local` file in the root of your project:

**.env.local**
```
VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
```
> **Note:** The `VITE_` prefix is important for Vite to expose the variable to the frontend code. You will need to adjust the code in `geminiService.ts` to read `import.meta.env.VITE_GEMINI_API_KEY` instead of `process.env.API_KEY`.

**5. Run the Development Server**
```bash
vite
```
This will start a local development server, and you can view the application by navigating to the URL provided in your terminal (usually `http://localhost:5173`).

## 📁 Codebase Structure

A brief overview of the key files and directories:

```
/
├── components/           # Reusable React components
│   ├── AiAnalysis.tsx
│   ├── ComparisonTable.tsx
│   ├── ErrorDisplay.tsx
│   ├── Header.tsx
│   ├── Loader.tsx
│   └── ProductInputForm.tsx
├── services/             # Logic for interacting with external APIs
│   └── geminiService.ts  # All Gemini API calls and prompt logic
├── utils/                # Helper functions and static data
│   ├── funnyErrors.ts
│   └── wittyIntros.ts
├── App.tsx               # Main application component, state management
├── index.html            # The entry point of the web app
├── index.tsx             # The React root renderer
├── metadata.json         # Project metadata for AI Studio
├── types.ts              # TypeScript type definitions for data structures
└── README.md             # You are here!
```

## ⚖️ License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

*Built with passion and a lot of prompts in Google AI Studio.*
