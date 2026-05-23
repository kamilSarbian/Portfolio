const API_BASE = import.meta.env.VITE_API_BASE || "https://api.kamilsarbian.dev";

export const API = {
  auth: {
    login: `${API_BASE}/backend/auth/login`,
    register: `${API_BASE}/backend/auth/register`,
  },

  users: {
    profile: `${API_BASE}/backend/users/profile`,
    list: `${API_BASE}/backend/users`,
  },

  password: {
    check: `${API_BASE}/backend/password/check`,
  },

  contact: {
    send: `${API_BASE}/backend/contact/send`,
  },

  image: {
    process: `${API_BASE}/backend/image/process`,
  },

  ml: {
    classify: `${API_BASE}/backend/ml/classify`,
    info: `${API_BASE}/backend/ml/info`,
    examples: `${API_BASE}/backend/ml/examples`,
  },
};
