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
  const sessionId = response.data?.session_id || response.data;
  if (typeof sessionId === "string") {
    localStorage.setItem("study_session_id", sessionId);
  }
  return sessionId;
};

export const getOrCreateSession = async () => {
  return createSession();
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

export const getSessionDocuments = async (sessionId: any) => {
  const id = typeof sessionId === "string" ? sessionId : sessionId?.session_id || sessionId?.id || "";
  const response = await api.get(`/quiz/documents/${id}`);
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

export const uploadFiles = async (files: FileList | File[], sessionId: string) => {
  const fileArray = Array.from(files);
  const results = [];
  for (const file of fileArray) {
    const res = await uploadFile(file, sessionId);
    results.push(res);
  }
  return results;
};

// RAG Features
export const sendChatMessage = async (query: string, sessionId: string) => {
  const response = await api.post("/chat/", {
    query,
    session_id: sessionId,
  });
  return response.data;
};

export const chat = async (sessionId: string, query: string) => {
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

  if (typeof arg2 === "string") {
    textInput = arg2;
  } else if (arg2 instanceof Blob) {
    audioFile = arg2;
  }

  if (typeof arg3 === "string") {
    language = arg3;
  } else if (arg3 instanceof Blob) {
    audioFile = arg3;
  }

  if (arg4 instanceof Blob) {
    audioFile = arg4;
  }

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
  context_used?: string;
  note?: string;
  topic?: string;
  prompt?: string;
}

export const generateEducationalDiagram = async (
  prompt: string,
  topic?: string
): Promise<ImageGenerationResult> => {
  const response = await api.post("/image/generate", {
    prompt,
    topic: topic || "Educational Diagram",
  });
  return response.data;
};

export const generateImage = async (
  prompt: string,
  topic?: string,
  sessionId?: string
): Promise<ImageGenerationResult> => {
  return generateEducationalDiagram(prompt, topic || sessionId || "Educational Diagram");
};

export const generateImageFromContext = async (
  arg1: string,
  arg2?: string,
  arg3?: string
): Promise<ImageGenerationResult> => {
  const prompt = arg2 || arg1;
  const topic = arg3 || "Context Diagram";
  return generateEducationalDiagram(prompt, topic);
};

// System Models Status
export const getModelsStatus = async () => {
  const response = await api.get("/models/");
  return response.data;
};

export const getModels = async () => {
  return getModelsStatus();
};

export default api;
