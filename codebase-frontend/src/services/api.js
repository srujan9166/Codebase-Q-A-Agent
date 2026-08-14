/**
 * API service for Codebase Q&A Agent
 */

export async function askQuestion(question) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  
  let response;
  try {
    response = await fetch(`${baseUrl}/api/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });
  } catch (error) {
    console.error("Network error calling codebase backend:", error);
    throw new Error("Unable to connect to the Codebase Agent backend. Make sure the Spring Boot application is running.");
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignored, fallback to generic HTTP status
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
