import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("study_auth_token");
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const registerApi = async (email: string, password: string) => {
  const response = await api.post("/auth/register", { email, password });
  return response.data;
};

export const loginApi = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const getMeApi = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// User Management
export const getUserId = (): string => {
  let userId = localStorage.getItem("study_user_id");
  if (!userId) {
    userId = `user_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("study_user_id", userId);
  }
  return userId;
};

// Session Management
export const createSession = async () => {
  const userId = getUserId();
  const response = await api.post("/session/create", { user_id: userId });
  return response.data;
};

export const deleteSession = async (sessionId: string) => {
  const response = await api.delete(`/session/${sessionId}`);
  return response.data;
};

export const getSessionHistory = async () => {
  const userId = getUserId();
  const response = await api.get(`/session/history/${userId}`);
  return response.data;
};

export const clearSessionHistory = async () => {
  const userId = getUserId();
  const response = await api.delete(`/session/history/${userId}`);
  return response.data;
};

// Study Material Processing
export const uploadFile = async (file: File, sessionId: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("session_id", sessionId);

  const response = await api.post("/upload/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// RAG Features
export const sendChatMessage = async (query: str, sessionId: string) => {
  const response = await api.post("/chat/", {
    query,
    session_id: sessionId,
  });
  return response.data;
};

export const generateSummary = async (
  sessionId: string,
  summaryType: string = "detailed",
  sourceFilter?: string
) => {
  const response = await api.post("/quiz/summary", {
    session_id: sessionId,
    summary_type: summaryType,
    source_filter: sourceFilter,
  });
  return response.data;
};

export const generateQuiz = async (
  sessionId: string,
  topic: string = "general",
  difficulty: string = "medium",
  numQuestions: number = 5
) => {
  const response = await api.post("/quiz/generate", {
    session_id: sessionId,
    topic,
    difficulty,
    num_questions: numQuestions,
  });
  return response.data;
};

export const analyzeWeakSpots = async (
  sessionId: string,
  questions: any[],
  userAnswers: Record<string, string>
) => {
  const response = await api.post("/quiz/analyze", {
    session_id: sessionId,
    questions,
    user_answers: userAnswers,
  });
  return response.data;
};

// PYQ Features
export const generatePyqSample = async (file: File, sessionId: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("session_id", sessionId);

  const response = await api.post("/quiz/pyq-generator", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const downloadSamplePaperDocx = async (paperData: any) => {
  const response = await api.post("/quiz/download-paper", paperData, {
    responseType: "blob",
  });
  return response.data;
};

// AI Teacher & Audio
export const interactTeacher = async (
  sessionId: string,
  textInput?: string,
  language: string = "English",
  audioFile?: Blob
) => {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("language", language);
  if (textInput) formData.append("text_input", textInput);
  if (audioFile) formData.append("audio_file", audioFile, "recording.webm");

  const response = await api.post("/audio/interact", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Slide Presentation Generator
export const generateSlidesPptx = async (
  sessionId: string,
  topic: string,
  numSlides: number = 5
) => {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("topic", topic);
  formData.append("num_slides", numSlides.toString());

  const response = await api.post("/slides/generate", formData, {
    responseType: "blob",
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Diagram & Image Generator
export const generateEducationalDiagram = async (
  prompt: string,
  topic?: string
) => {
  const response = await api.post("/image/generate", {
    prompt,
    topic: topic || "Educational Diagram",
  });
  return response.data;
};

// System Models Status
export const getModelsStatus = async () => {
  const response = await api.get("/models/");
  return response.data;
};

export default api;
