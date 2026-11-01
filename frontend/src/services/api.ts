import axios from "axios";

// Helper to reliably compute API base URL across local dev, Render, and Vercel
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl || envUrl.trim() === "") {
    return "/api";
  }
  const clean = envUrl.trim().replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
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

// Interceptor to handle auth expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || "";
      if (!url.includes("/auth/login") && !url.includes("/auth/register")) {
        console.warn("Session expired or unauthorized request");
        localStorage.removeItem("study_auth_token");
        localStorage.removeItem("study_user");
      }
    }
    return Promise.reject(error);
  }
);

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
    userId = `user_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem("study_user_id", userId);
  }
  return userId;
};

export interface SessionItem {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  documents?: string[];
  document_count?: number;
}

// Session Management
export const createSession = async (title?: string) => {
  const token = localStorage.getItem("study_auth_token");
  if (!token) {
    throw new Error("Authentication required: Please sign in or register to create a study session.");
  }
  const userId = localStorage.getItem("study_user_id") || "auth_user";
  const response = await api.post("/session/create", { user_id: userId, title: title?.trim() });
  const sessionId = response.data?.session_id || response.data;
  if (typeof sessionId === "string") {
    localStorage.setItem("study_session_id", sessionId);
  }
  return sessionId;
};

export const updateSessionTitle = async (sessionId: string, title: string) => {
  const response = await api.patch(`/session/${sessionId}`, { title: title.trim() });
  return response.data;
};

export const getOrCreateSession = async (title?: string) => {
  return createSession(title);
};

export const deleteSession = async (sessionId: string) => {
  const response = await api.delete(`/session/${sessionId}`);
  return response.data;
};

export const getSessionHistory = async (): Promise<SessionItem[]> => {
  const userId = getUserId();
  const response = await api.get(`/session/history/${userId}`);
  return response.data;
};

export const clearSessionHistory = async () => {
  const userId = getUserId();
  const response = await api.delete(`/session/history/${userId}`);
  return response.data;
};

export const getSessionDocuments = async (sessionId: any) => {
  const id = typeof sessionId === "string" ? sessionId : sessionId?.session_id || sessionId?.id || "";
  const response = await api.get(`/quiz/documents/${id}`);
  return response.data;
};

export const claimSessionsApi = async (anonUserId: string) => {
  const response = await api.post("/session/claim", { anon_user_id: anonUserId });
  return response.data;
};

// Study Material Processing
export const uploadFile = async (file: File, sessionId: string) => {
  const token = localStorage.getItem("study_auth_token");
  if (!token) {
    throw new Error("Authentication required: Please sign in or register before uploading documents.");
  }
  const formData = new FormData();
  formData.append("files", file);
  formData.append("session_id", sessionId);

  const response = await api.post("/upload/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const uploadFiles = async (files: FileList | File[], sessionId: string) => {
  const fileArray = Array.from(files);
  const results = [];
  for (const file of fileArray) {
    const res = await uploadFile(file, sessionId);
    results.push(res);
  }
  return results;
};

// Helper to check for standard UUID pattern
const isUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());

// RAG Features
export const sendChatMessage = async (query: string, sessionId: string) => {
  const response = await api.post("/chat/", {
    query,
    session_id: sessionId,
  });
  return response.data;
};

// Robust chat supporting either (sessionId, query) or (query, sessionId)
export const chat = async (arg1: string, arg2: string) => {
  let query = arg1;
  let sessionId = arg2;

  if (isUUID(arg1) && !isUUID(arg2)) {
    sessionId = arg1;
    query = arg2;
  } else if (!isUUID(arg1) && isUUID(arg2)) {
    query = arg1;
    sessionId = arg2;
  }

  return sendChatMessage(query, sessionId);
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
  arg1: any,
  arg2?: any,
  arg3?: string,
  arg4?: number
) => {
  let sessionId = typeof arg1 === "string" ? arg1 : arg1?.session_id || arg1?.sessionId;
  let topicVal = "general";
  let diffVal = "medium";
  let numQVal = 5;

  if (typeof arg2 === "object" && arg2 !== null) {
    topicVal = arg2.topic || "general";
    diffVal = arg2.difficulty || "medium";
    numQVal = arg2.num_questions || arg2.numQuestions || 5;
  } else if (typeof arg2 === "string") {
    topicVal = arg2;
    if (typeof arg3 === "string") diffVal = arg3;
    if (typeof arg4 === "number") numQVal = arg4;
  } else if (typeof arg1 === "object" && arg1 !== null) {
    topicVal = arg1.topic || "general";
    diffVal = arg1.difficulty || "medium";
    numQVal = arg1.num_questions || arg1.numQuestions || 5;
  }

  const response = await api.post("/quiz/generate", {
    session_id: sessionId,
    topic: topicVal,
    difficulty: diffVal,
    num_questions: numQVal,
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
export const generatePyqSample = async (arg1: any, arg2?: any) => {
  let file: File;
  let sessionId: string;

  if (arg1 instanceof File) {
    file = arg1;
    sessionId = typeof arg2 === "string" ? arg2 : "";
  } else {
    sessionId = String(arg1);
    file = arg2 as File;
  }

  const formData = new FormData();
  if (file) formData.append("file", file);
  formData.append("session_id", sessionId);

  const response = await api.post("/quiz/pyq-generator", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const generateSamplePaper = async (arg1: any, arg2?: any) => {
  return generatePyqSample(arg1, arg2);
};

export const downloadSamplePaperDocx = async (paperData: any) => {
  const response = await api.post("/quiz/download-paper", paperData, {
    responseType: "blob",
  });
  return response.data;
};

export const downloadSamplePaper = async (paperData: any) => {
  return downloadSamplePaperDocx(paperData);
};

// AI Teacher & Audio
export const interactTeacher = async (
  sessionId: string,
  arg2?: any,
  arg3?: any,
  arg4?: any
) => {
  let textInput: string | undefined = undefined;
  let language: string = "English";
  let audioFile: Blob | undefined = undefined;

  const parseArg = (val: any) => {
    if (!val) return;
    if (val instanceof Blob) {
      audioFile = val;
    } else if (typeof val === "string") {
      if (["English", "Hindi", "Hinglish"].includes(val)) {
        language = val;
      } else if (!textInput) {
        textInput = val;
      } else {
        language = val;
      }
    }
  };

  parseArg(arg2);
  parseArg(arg3);
  parseArg(arg4);

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

export const interactAudio = async (
  sessionId: string,
  arg2?: any,
  arg3?: any,
  arg4?: any
) => {
  return interactTeacher(sessionId, arg2, arg3, arg4);
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

export const generateSlides = async (
  sessionId: string,
  topic: string,
  numSlides: number = 5
) => {
  return generateSlidesPptx(sessionId, topic, numSlides);
};

// Diagram & Image Generator
export interface ImageGenerationResult {
  image_url?: string;
  image_data?: string;
  original_topic?: string;
  concept?: string;
  generated_prompt?: string;
  prompt_used?: string;
  context_used?: string;
  note?: string;
  topic?: string;
  prompt?: string;
}

export const generateEducationalDiagram = async (
  sessionId: string,
  topic: string,
  style: string = "educational diagram"
): Promise<ImageGenerationResult> => {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("topic", topic);
  formData.append("style", style);

  const response = await api.post("/image/generate", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const generateImage = async (
  sessionId: string,
  topic: string,
  style?: string
): Promise<ImageGenerationResult> => {
  return generateEducationalDiagram(sessionId, topic, style || "educational diagram");
};

export const generateImageFromContext = async (
  sessionId: string,
  concept: string
): Promise<ImageGenerationResult> => {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("concept", concept);

  const response = await api.post("/image/generate-from-context", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// System Models Status
export const getModelsStatus = async () => {
  const response = await api.get("/models/");
  return response.data;
};

export const getModels = async () => {
  return getModelsStatus();
};

export const selectModelApi = async (provider: string, modelId?: string) => {
  const response = await api.post("/models/select", { provider, model_id: modelId });
  return response.data;
};

export default api;
