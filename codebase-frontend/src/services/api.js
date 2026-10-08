/**
 * Barrel export for API services
 */
import { askQuestion, getSourceCode, checkIngestionStatus } from './api/askApi';

export { askQuestion, getSourceCode, checkIngestionStatus };

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
