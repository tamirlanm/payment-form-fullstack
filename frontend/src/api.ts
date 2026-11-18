import type {
  CreatePaymentRequest,
  PaymentResponse,
  PaymentStatistics,
} from "./types";

const API_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5190";

async function request<T>(
  path: string,
  apiKey: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      "X-API-Key": apiKey,
    },
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data !== null &&
      typeof data === "object" &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : `HTTP ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

export const paymentApi = {
  create(payment: CreatePaymentRequest, apiKey: string) {
    return request<PaymentResponse>("/api/payments", apiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payment),
    });
  },

  getAll(apiKey: string) {
    return request<PaymentResponse[]>("/api/payments", apiKey);
  },

  getStatistics(apiKey: string) {
    return request<PaymentStatistics>("/api/payments/stats", apiKey);
  },
};
