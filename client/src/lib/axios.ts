// import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// const BASE_URL = "http://localhost:4002";

// const api: AxiosInstance = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true,
// });

// api.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     if (typeof window !== "undefined") {
//       const accessToken = localStorage.getItem("accessToken");

//       if (accessToken) {
//         config.headers = config.headers || {};
//         config.headers.Authorization = `Bearer ${accessToken}`;
//       }
//     }
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (
//       error.response?.status === 401 &&
//       originalRequest &&
//       !originalRequest._retry &&
//       !originalRequest.url?.includes("refresh-token")
//     ) {
//       originalRequest._retry = true;

//       try {
//         const response = await axios.get(`${BASE_URL}/refresh-token`, {
//           withCredentials: true,
//         });

//         const { accessToken } = response.data;

//         localStorage.setItem("accessToken", accessToken);

//         originalRequest.headers = originalRequest.headers || {};
//         originalRequest.headers.Authorization = `Bearer ${accessToken}`;

//         return api(originalRequest);
//       } catch (refreshError) {
//         localStorage.removeItem("accessToken");

//         if (typeof window !== "undefined") {
//           window.location.href = "/login";
//         }

//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   },
// );

// export default api;

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const BASE_URL = "http://localhost:4002";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach bearer tokens dynamically
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Intercept 401 and handle token refreshing
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        // Use standard global axios here to prevent interceptor looping
        const refreshResponse = await axios.get(`${BASE_URL}/refresh-token`, {
          withCredentials: true,
        });

        const newAccessToken = refreshResponse.data?.accessToken;

        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          // Retry the original request with the fresh token using the instance
          return api(originalRequest);
        }

        throw new Error("No access token received");
      } catch (refreshError) {
        // Token refresh fully failed (Session truly expired or user switched)
        localStorage.removeItem("accessToken");

        if (typeof window !== "undefined") {
          // Clean wipe to ensure no stale dashboards remain in memory
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;