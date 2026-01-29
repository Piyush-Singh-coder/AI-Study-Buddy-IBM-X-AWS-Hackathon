import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Session Management
export const createSession = async () => {
  const response = await api.post("/session/create");
  return response.data;
};

export const deleteSession = async (sessionId: string) => {
  const response = await api.delete(`/session/${sessionId}`);
  return response.data;
};

export const getOrCreateSession = async () => {
  let sessionId = localStorage.getItem("study_session_id");
  if (!sessionId) {
    const data = await createSession();
    sessionId = data.session_id;
    localStorage.setItem("study_session_id", sessionId);
  }
  return sessionId;
};

// Upload
export const uploadFiles = async (
  files: File[],
  youtubeUrl: string,
  sessionId: string,
) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  if (youtubeUrl) formData.append("youtube_url", youtubeUrl);
  formData.append("session_id", sessionId);

  const response = await api.post("/upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Documents
export const getSessionDocuments = async (sessionId: string) => {
  const response = await api.get(`/quiz/documents/${sessionId}`);
  return response.data;
};

// Chat
export const chat = async (query: string, sessionId: string) => {
  const response = await api.post("/chat/", { query, session_id: sessionId });
  return response.data;
};

// Quiz
export interface QuizOptions {
  topic?: string;
  difficulty?: "easy" | "medium" | "hard";
  num_questions?: number;
}

export interface QuizResult {
  questions: any[];
  count: number;
  difficulty: string;
  requested?: number;
  warning?: string;
  error?: string;
}

export const generateQuiz = async (
  sessionId: string,
  options: QuizOptions = {},
): Promise<QuizResult> => {
  const response = await api.post("/quiz/generate", {
    session_id: sessionId,
    topic: options.topic || "general",
    difficulty: options.difficulty || "medium",
    num_questions: options.num_questions || 5,
  });
  return response.data;
};

export const analyzeWeakSpots = async (
  sessionId: string,
  questions: any[],
  userAnswers: { [key: string]: string },
) => {
  const response = await api.post("/quiz/analyze", {
    session_id: sessionId,
    questions,
    user_answers: userAnswers,
  });
  return response.data;
};

// Summary
export const generateSummary = async (
  sessionId: string,
  summaryType: "brief" | "detailed" = "detailed",
  sourceFilter?: string,
) => {
  const response = await api.post("/quiz/summary", {
    session_id: sessionId,
    summary_type: summaryType,
    source_filter: sourceFilter,
  });
  return response.data;
};

// Sample Paper
export const generateSamplePaper = async (sessionId: string, file: File) => {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("file", file);

  const response = await api.post("/quiz/pyq-generator", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const downloadSamplePaper = async (paperData: any) => {
  const response = await api.post("/quiz/download-paper", paperData, {
    responseType: "blob",
  });
  return response.data;
};

// Teacher Audio Interaction
export const interactAudio = async (
  sessionId: string,
  text?: string,
  audioBlob?: Blob,
  language: string = "English",
) => {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("language", language);

  if (text) formData.append("text_input", text);
  if (audioBlob) formData.append("audio_file", audioBlob, "recording.webm");

  const response = await api.post("/audio/interact", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Image Generation
export interface ImageGenerationResult {
  success: boolean;
  image_url?: string;
  image_data?: string; // Base64 encoded image from Nova Canvas
  original_topic?: string;
  concept?: string;
  generated_prompt: string;
  revised_prompt?: string;
  context_used?: string;
  note: string;
}

export const generateImage = async (
  sessionId: string,
  topic: string,
  style: string = "educational diagram",
): Promise<ImageGenerationResult> => {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("topic", topic);
  formData.append("style", style);

  const response = await api.post("/image/generate", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const generateImageFromContext = async (
  sessionId: string,
  concept: string,
): Promise<ImageGenerationResult> => {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("concept", concept);

  const response = await api.post("/image/generate-from-context", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const generateSlides = async (
  sessionId: string,
  topic: string,
  numSlides: number = 5,
) => {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("topic", topic);
  formData.append("num_slides", numSlides.toString());

  const response = await api.post("/slides/generate", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    responseType: "blob", // Important for file download
  });

  // Handle download
  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${topic.replace(/\s+/g, "_")}_Presentation.pptx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  return true;
};

// Models
export const getModels = async () => {
  const response = await api.get("/models/");
  return response.data;
};

export default api;
