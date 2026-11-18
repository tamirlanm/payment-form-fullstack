
import { useState } from "react";
import type { SubmitEvent } from "react";
import { paymentApi } from "./api";
import type {
  CreatePaymentRequest,
  PaymentResponse,
  PaymentStatistics,
} from "./types";
import "./App.css";

type Tab = "create" | "history" | "stats";

type PaymentForm = Omit<CreatePaymentRequest, "amount"> & {
  amount: string;
};

const emptyForm: PaymentForm = {
  walletNumber: "",
  account: "",
  email: "",
  phone: "",
  amount: "",
  currency: "USD",
  comment: "",
};

function App() {
  const [tab, setTab] = useState<Tab>("create");
  const [keyInput, setKeyInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [form, setForm] = useState<PaymentForm>(emptyForm);

  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [stats, setStats] = useState<PaymentStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData(key: string) {
    const [history, statistics] = await Promise.all([
      paymentApi.getAll(key),
      paymentApi.getStatistics(key),
    ]);

    setPayments(history);
    setStats(statistics);
  }

  async function connect() {
    const key = keyInput.trim();

    if (!key) {
      setError("Enter your API Key.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await loadData(key);
      setApiKey(key);
      setKeyInput("");
      setSuccess("Connected successfully.");
    } catch (err) {
      setApiKey("");
      setError(err instanceof Error ? err.message : "Connection failed.");
    } finally {
      setLoading(false);
    }
  }

  async function createPayment(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!apiKey) {
      setError("Connect with your API Key first.");
      return;
    }

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    const request: CreatePaymentRequest = {
      walletNumber: form.walletNumber.trim(),
      account: form.account.trim(),
      email: form.email.trim(),
      amount,
      currency: form.currency,
      phone: form.phone?.trim() || null,
      comment: form.comment?.trim() || null,
    };

    setLoading(true);
    setError("");
    setSuccess("");

    
try {
  // 1. Create the payment
  const payment = await paymentApi.create(request, apiKey);

  // 2. Payment was successfully saved
  setForm({ ...emptyForm });
  setSuccess(`Payment ${payment.id} created successfully.`);
  setTab("history");

  try {
      await loadData(apiKey);
    } catch (refreshError) {
      console.error("Failed to refresh payment data:", refreshError);

      setError(
        "Payment was created successfully, " +
        "but history could not be refreshed. " +
        "Please click Refresh."
      );
    }
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to create payment."
    );
  } finally {
    setLoading(false);
  }

  }

  async function refresh() {
    if (!apiKey) return;

    setLoading(true);
    setError("");

    try {
      await loadData(apiKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed.");
    } finally {
      setLoading(false);
    }
  }

  const formatAmount = (value: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <main className="app">
      <header className="page-header">
        <div>
          <h1>Payments</h1>
          <p>Manage your transactions in one place.</p>
        </div>

        <span className={`status ${apiKey ? "connected" : ""}`}>
          {apiKey ? "Connected" : "Not connected"}
        </span>
      </header>

      <section className="panel">
        <h2>API Connection</h2>
        <div className="connection">
          <input
            type="password"
            placeholder="Enter demo API Key"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
          />
          <button type="button" onClick={connect} disabled={loading}>
            Connect
          </button>
        </div>
        <small>
          The key is kept in memory only. Do not use a production key.
        </small>
      </section>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      {apiKey && (
        <>
          <nav className="tabs">
            <button
              className={tab === "create" ? "active" : ""}
              onClick={() => setTab("create")}
            >
              Create Payment
            </button>
            <button
              className={tab === "history" ? "active" : ""}
              onClick={() => setTab("history")}
            >
              History
            </button>
            <button
              className={tab === "stats" ? "active" : ""}
              onClick={() => setTab("stats")}
            >
              Statistics
            </button>
          </nav>

          {tab === "create" && (
            <section className="panel">
              <h2>Create Payment</h2>
              <form onSubmit={createPayment} className="payment-form">
                <label>
                  <span>Wallet Number</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]+"
                    required
                    maxLength={50}
                    value={form.walletNumber}
                    onChange={(e) =>
                      setForm({ ...form, walletNumber: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span>Account</span>
                  <input
                    required
                    maxLength={100}
                    value={form.account}
                    onChange={(e) =>
                      setForm({ ...form, account: e.target.value })
                    }
                  />
                </label>

                <label>
                 <span>Email</span>
                  <input
                    type="email"
                    required
                    maxLength={254}
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span>Phone (optional)</span>
                  <input
                    type="tel"
                    placeholder="+77771234567"
                    maxLength={20}
                    pattern="\+[1-9][0-9]{1,14}"
                    value={form.phone ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span>Amount</span>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span>Currency</span>
                  <select
                    value={form.currency}
                    onChange={(e) =>
                      setForm({ ...form, currency: e.target.value })
                    }
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="RUB">RUB</option>
                  </select>
                </label>

                <label className="full-width">
                  <span>Comment (optional)</span>
                  <textarea
                    maxLength={500}
                    value={form.comment ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, comment: e.target.value })
                    }
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="full-width"
                >
                  {loading ? "Processing..." : "Create Payment"}
                </button>
              </form>
            </section>
          )}

          {tab === "history" && (
            <section className="panel">
              <div className="section-heading">
                <h2>Payment History</h2>
                <button onClick={refresh} disabled={loading}>
                  Refresh
                </button>
              </div>

              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Account</th>
                      <th>Email</th>
                      <th>Amount</th>
                      <th>Currency</th>
                      <th>Status</th>
                      <th>Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...payments]
                      .sort(
                        (a, b) =>
                          Date.parse(b.createdAt) - Date.parse(a.createdAt)
                      )
                      .map((payment) => (
                        <tr key={payment.id}>
                          <td>
                            {new Date(payment.createdAt).toLocaleString()}
                          </td>
                          <td>{payment.account}</td>
                          <td>{payment.email}</td>
                          <td>{formatAmount(payment.amount)}</td>
                          <td>{payment.currency}</td>
                          <td>{payment.status}</td>
                          <td>{payment.comment || "—"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {payments.length === 0 && <p>No payments yet.</p>}
            </section>
          )}

          {tab === "stats" && (
            <section className="panel">
              <div className="section-heading">
                <h2>Payment Statistics</h2>
                <button onClick={refresh} disabled={loading}>
                  Refresh
                </button>
              </div>

              <div className="stat-card">
                <span>Total Payments</span>
                <strong>{stats?.totalCount ?? 0}</strong>
              </div>

              {stats?.byCurrency.map((group) => (
                <div key={group.currency} className="currency-group">
                  <h3>{group.currency}</h3>
                  <p>
                    Total: {formatAmount(group.totalAmount)}{" "}
                    {group.currency} · {group.count} payments
                  </p>

                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Date (UTC)</th>
                          <th>Count</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.dailyStats.map((day) => (
                          <tr key={day.date}>
                            <td>{day.date}</td>
                            <td>{day.count}</td>
                            <td>{formatAmount(day.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {stats?.totalCount === 0 && <p>No statistics yet.</p>}
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default App;
