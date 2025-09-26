import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Use a newer model that's available and has quota
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.4,
  }
});

export const generateResult = async (prompt) => {
  try {
    console.log("AI generating response for prompt:", prompt);
    console.log("Google AI API Key available:", !!process.env.GOOGLE_AI_API_KEY);
    console.log("Google AI API Key length:", process.env.GOOGLE_AI_API_KEY?.length);
    console.log(
      "Google AI API Key starts with:",
      process.env.GOOGLE_AI_API_KEY?.substring(0, 10)
    );

    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY environment variable is not set");
    }

    if (process.env.GOOGLE_AI_API_KEY.length < 20) {
      throw new Error("GOOGLE_AI_API_KEY appears to be invalid (too short)");
    }

    // Create a prompt with system instructions
    const systemPrompt = `You are an expert in MERN and Development. You have an experience of 10 years in the development. 
You always write code in modular and break the code in the possible way and follow best practices. 
You use understandable comments in the code, you create files as needed, you write code while maintaining the working of previous code. 
You always follow the best practices of the development. 
You never miss the edge cases and always write code that is scalable and maintainable. 
In your code you always handle the errors and exceptions.

IMPORTANT: For WebContainer compatibility, you MUST follow these rules:
1. NEVER create nested directories (no src/, routes/, middleware/ folders)
2. ALL files must be in the root directory only
3. Use flat file structure with descriptive names (e.g., "routes.js", "middleware.js", "utils.js")
4. Keep file names simple and avoid special characters
5. Always include a working server.js that can run immediately
6. Make sure all require() paths work with flat structure

When asked to create code, respond with a JSON object containing:
- "text": A description of what you created
- "fileTree": An object with file paths as keys and file contents as values

Example response format:
{
  "text": "I've created a simple Express server with a Hello World route.",
  "fileTree": {
    "server.js": {
      "file": {
        "contents": "const express = require('express');\n\nconst app = express();\n\napp.get('/', (req, res) => {\n  res.send('<h1>Hello World!</h1><p>Welcome to your Express server!</p>');\n});\n\napp.listen(3000, () => {\n  console.log('Server running on port 3000');\n});"
      }
    },
    "package.json": {
      "file": {
        "contents": "{\n  \"name\": \"simple-server\",\n  \"version\": \"1.0.0\",\n  \"main\": \"server.js\",\n  \"scripts\": {\n    \"start\": \"node server.js\"\n  },\n  \"dependencies\": {\n    \"express\": \"^4.18.2\"\n  }\n}"
      }
    }
  }
}

User request: ${prompt}`;

    // Send the user prompt
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    console.log("AI raw response:", responseText);

    // Try to parse the response as JSON
    try {
      // Clean the response text - remove markdown code blocks if present
      let cleanResponse = responseText.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const parsedResponse = JSON.parse(cleanResponse);
      console.log("AI parsed response:", parsedResponse);

      if (parsedResponse.fileTree && typeof parsedResponse.fileTree === "object") {
        console.log("AI fileTree keys:", Object.keys(parsedResponse.fileTree));
      }

      return JSON.stringify(parsedResponse);
    } catch (parseError) {
      console.log("AI response is not JSON, wrapping in format:", parseError.message);
      return JSON.stringify({
        text: responseText,
        fileTree: null,
      });
    }
  } catch (error) {
    console.error("AI generation error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      apiKeyAvailable: !!process.env.GOOGLE_AI_API_KEY,
      apiKeyLength: process.env.GOOGLE_AI_API_KEY?.length,
    });
    
    // Fallback to mock AI response for development
    console.log("Using mock AI response due to API error");
    return JSON.stringify({
      text: `I understand you want me to help with: "${prompt}". However, I'm currently experiencing issues with the AI service. Please check your Google AI API key configuration. For now, here's a simple Express server example:`,
      fileTree: {
        "server.js": {
          "file": {
            "contents": `const express = require('express');

const app = express();

// Root route
app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1><p>Welcome to your Express server!</p>');
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`
          }
        },
        "package.json": {
          "file": {
            "contents": `{
  "name": "simple-server",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}`
          }
        }
      }
    });
  }
};