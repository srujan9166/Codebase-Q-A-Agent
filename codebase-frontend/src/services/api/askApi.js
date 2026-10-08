/**
 * API service for Codebase Q&A Agent
 */

const getBaseUrl = () => import.meta.env.VITE_API_BASE_URL || '';

export async function askQuestion(question) {
  const baseUrl = getBaseUrl();
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
    throw new Error("Unable to get an answer. Please make sure the backend is running and try again.");
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getSourceCode(id) {
  const baseUrl = getBaseUrl();
  let response;

  try {
    response = await fetch(`${baseUrl}/api/sources/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
  } catch (error) {
    console.error("Network error calling sources API:", error);
    throw new Error("Unable to load source code.");
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Source code was not found.");
    }
    throw new Error("Unable to load source code.");
  }

  return response.json();
}

export async function checkIngestionStatus() {
  const baseUrl = getBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/ingest/status`);
    if (!response.ok) return { indexed: false, chunksCount: 0 };
    return response.json();
  } catch (e) {
    console.error("Failed to check status:", e);
    return { indexed: false, chunksCount: 0 };
  }
}
