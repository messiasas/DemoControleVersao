const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const getVersions = async (filtros = {}) => {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([key, value]) => {
    if (value && String(value).trim()) params.append(key, value);
  });
  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`${BASE_URL}/versions${query}`);
  return response.json();
};

export const login = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

export const updateVersion = async (id, data) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/versions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const createUser = async (email, password) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

export const getUsers = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const updateUser = async (id, data) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteUser = async (id) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const deleteVersion = async (id) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/versions/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const getLogsPackages = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/logs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const getVersionHistory = async (id) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/logs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const getDistinctChaves = async () => {
  const response = await fetch(`${BASE_URL}/versions/chaves/distinct`);
  return response.json();
};

export const getDistinctPlataformas = async () => {
  const response = await fetch(`${BASE_URL}/versions/plataformas/distinct`);
  return response.json();
};

export const createVersion = async (data) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/versions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const getChaveConfigs = async () => {
  const response = await fetch(`${BASE_URL}/chave-configs`);
  return response.json();
};

export const createChaveConfig = async (data) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/chave-configs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateChaveConfig = async (id, data) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/chave-configs/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const getChaveConfigLogs = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/chave-configs/logs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const deleteChaveConfig = async (id) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/chave-configs/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
