import type {
  CreatePaymentRequest,
  PaymentResponse,
  PaymentStatistics,
} from "./types";

const API_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5190";


function getErrorMessage(data: unknown, status: number): string {
  if (!data || typeof data !== "object") {
    return `HTTP ${status}: Request failed`;
  }

  const body = data as Record<string, unknown>;

  if (typeof body.error === "string") {
    return body.error;
  }

  if (
    body.errors &&
    typeof body.errors === "object" &&
    !Array.isArray(body.errors)
  ) {
    const messages = Object.values(body.errors)
      .flatMap((value) =>
        Array.isArray(value)
          ? value.filter(
              (message): message is string =>
                typeof message === "string"
            )
          : []
      );

    if (messages.length > 0) {
      return messages.join(", ");
    }
  }

  if (typeof body.detail === "string") {
    return body.detail;
  }

  if (typeof body.title === "string") {
    return body.title;
  }

  return `HTTP ${status}: Request failed`;
}

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
    throw new Error(getErrorMessage(data, response.status));
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
