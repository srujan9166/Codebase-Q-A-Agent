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

export async function getSourceCode(id) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  
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
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  try {
    const response = await fetch(`${baseUrl}/api/ingest/status`);
    if (!response.ok) return { indexed: false, chunksCount: 0 };
    return response.json();
  } catch (e) {
    console.error("Failed to check status:", e);
    return { indexed: false, chunksCount: 0 };
  }
}

export async function uploadCodebase(file) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const formData = new FormData();
  formData.append('file', file);

  let response;
  try {
    response = await fetch(`${baseUrl}/api/ingest`, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    console.error("Network error during ingestion upload:", error);
    throw new Error("Unable to connect to backend. Make sure the Spring Boot application is running.");
  }

  if (!response.ok) {
    if (response.status === 413) {
      throw new Error("File is too large (maximum size exceeded).");
    }
    let errMsg = "Codebase ingestion failed.";
    try {
      const errData = await response.json();
      if (errData.message) errMsg = errData.message;
    } catch (e) {}
    throw new Error(errMsg);
  }

  return response.json();
}
