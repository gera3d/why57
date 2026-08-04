import { env } from "cloudflare:workers";
import { createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "../src/index";

type DeliveryRecord = {
  lead_id: string;
  mode: string;
  outcomes: Array<{ channel: string; status: string; provider?: string }>;
};

const basePayload = {
  event_type: "lead_submission",
  source: "qualification_quiz",
  contact: {
    name: "Test Lead",
    email: "lead-test@example.com",
    company: "Example Test Co"
  },
  interest: "workflow automation",
  message: "We are copying the same order data between three systems.",
  context: {
    session_id: "test-session",
    utm_source: "test-suite",
    utm_medium: "integration",
    utm_campaign: "thread-1"
  },
  form_context: {
    pain: "manual_work",
    team: "small",
    goal: "automate"
  },
  page_url: "https://why57.com/#start-here"
};

function request(
  payload: Record<string, unknown>,
  path = "/v1/leads",
  origin = "https://why57.com",
  testToken: string | null = "test-submission-token"
): Request {
  const headers = new Headers({
    "Content-Type": "application/json",
    Origin: origin
  });
  if (testToken) headers.set("X-Why57-Test-Token", testToken);
  return new Request(`https://worker.test${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
}

function installDeliveryMock() {
  const mock = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url === "https://api.resend.com/emails") {
      return Response.json({ id: "email-test-id" }, { status: 200 });
    }
    if (url === "https://hooks.slack.test/services/test") {
      return new Response("ok", { status: 200 });
    }
    if (url === "https://sheets.test/lead-log") {
      return Response.json({ ok: true }, { status: 200 });
    }
    return new Response("unexpected URL", { status: 500 });
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("why57 lead intake worker", () => {
  it("reports health without exposing secret configuration", async () => {
    const ctx = createExecutionContext();
    const response = await worker.fetch(new Request("https://worker.test/health"), env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ok: true,
      service: "why57-lead-intake",
      delivery_mode: "test"
    });
  });

  it("accepts an identified lead, stores it, and dispatches all three Thread 1 channels", async () => {
    const fetchMock = installDeliveryMock();
    const ctx = createExecutionContext();
    const payload = { ...basePayload, submission_id: crypto.randomUUID() };
    const response = await worker.fetch(request(payload), env, ctx);
    const body = (await response.json()) as { id: string; received_at: string };
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(202);
    expect(body.id).toBeTruthy();
    expect(Date.parse(body.received_at)).not.toBeNaN();
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const delivery = await env.ROI_LEADS.get<DeliveryRecord>(`delivery:${body.id}`, "json");
    expect(delivery).not.toBeNull();
    expect(delivery?.outcomes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ channel: "auto_response", status: "sent", provider: "resend" }),
        expect.objectContaining({ channel: "founder_alert", status: "sent", provider: "slack" }),
        expect.objectContaining({ channel: "lead_log", status: "logged", provider: "google_sheets" })
      ])
    );

    const resendCall = fetchMock.mock.calls.find(([input]) => String(input) === "https://api.resend.com/emails");
    const resendInit = resendCall?.[1] as RequestInit | undefined;
    expect(new Headers(resendInit?.headers).get("Idempotency-Key")).toBe(`why57-lead-${payload.submission_id}`);
    const resendBody = JSON.parse(String(resendInit?.body)) as { to: string[]; subject: string };
    expect(resendBody.to).toEqual(["lead-test@example.com"]);
    expect(resendBody.subject).toContain("Test");

    const slackCall = fetchMock.mock.calls.find(([input]) => String(input) === "https://hooks.slack.test/services/test");
    const slackInit = slackCall?.[1] as RequestInit | undefined;
    const slackBody = JSON.parse(String(slackInit?.body)) as { mrkdwn?: boolean };
    expect(slackBody.mrkdwn).toBe(false);

    const sheetCall = fetchMock.mock.calls.find(([input]) => String(input) === "https://sheets.test/lead-log");
    const sheetInit = sheetCall?.[1] as RequestInit | undefined;
    const sheetBody = JSON.parse(String(sheetInit?.body)) as { webhook_secret: string; lead: { source: string } };
    expect(sheetBody.webhook_secret).toBe("test-log-secret");
    expect(sheetBody.lead.source).toBe("qualification_quiz");
  });

  it("blocks auto-response email outside the test allowlist while still alerting and logging", async () => {
    const fetchMock = installDeliveryMock();
    const ctx = createExecutionContext();
    const payload = {
      ...basePayload,
      submission_id: crypto.randomUUID(),
      contact: { ...basePayload.contact, email: "real-prospect@example.com" }
    };
    const response = await worker.fetch(request(payload), env, ctx);
    const body = (await response.json()) as { id: string };
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(202);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const delivery = await env.ROI_LEADS.get<DeliveryRecord>(`delivery:${body.id}`, "json");
    expect(delivery?.outcomes).toContainEqual(
      expect.objectContaining({ channel: "auto_response", status: "blocked" })
    );
  });

  it("marks a receiver-level Sheet rejection as failed even when Apps Script returns HTTP 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL): Promise<Response> => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        if (url === "https://api.resend.com/emails") return Response.json({ id: "email-test-id" });
        if (url === "https://hooks.slack.test/services/test") return new Response("ok");
        if (url === "https://sheets.test/lead-log") return Response.json({ ok: false, error: "unauthorized" });
        return new Response("unexpected URL", { status: 500 });
      })
    );
    const ctx = createExecutionContext();
    const response = await worker.fetch(request({ ...basePayload, submission_id: crypto.randomUUID() }), env, ctx);
    const body = (await response.json()) as { id: string };
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(202);
    const delivery = await env.ROI_LEADS.get<DeliveryRecord>(`delivery:${body.id}`, "json");
    expect(delivery?.outcomes).toContainEqual(
      expect.objectContaining({ channel: "lead_log", status: "failed", provider: "google_sheets" })
    );
  });

  it("persists every provider outcome when one provider throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL): Promise<Response> => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        if (url === "https://api.resend.com/emails") throw new TypeError("simulated network failure");
        if (url === "https://hooks.slack.test/services/test") return new Response("ok");
        if (url === "https://sheets.test/lead-log") return Response.json({ ok: true });
        return new Response("unexpected URL", { status: 500 });
      })
    );
    const ctx = createExecutionContext();
    const response = await worker.fetch(request({ ...basePayload, submission_id: crypto.randomUUID() }), env, ctx);
    const body = (await response.json()) as { id: string };
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(202);
    const delivery = await env.ROI_LEADS.get<DeliveryRecord>(`delivery:${body.id}`, "json");
    expect(delivery?.outcomes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ channel: "auto_response", status: "failed", provider: "resend" }),
        expect.objectContaining({ channel: "founder_alert", status: "sent", provider: "slack" }),
        expect.objectContaining({ channel: "lead_log", status: "logged", provider: "google_sheets" })
      ])
    );
  });

  it("includes the calculator result in the ROI auto-response", async () => {
    const fetchMock = installDeliveryMock();
    const ctx = createExecutionContext();
    const payload = {
      ...basePayload,
      submission_id: crypto.randomUUID(),
      source: "roi_calculator_result",
      context: {
        ...basePayload.context,
        recommendation: "hybrid",
        readiness_score: 53,
        break_even_months: 10
      }
    };
    const response = await worker.fetch(request(payload), env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(202);
    const resendCall = fetchMock.mock.calls.find(([input]) => String(input) === "https://api.resend.com/emails");
    const resendInit = resendCall?.[1] as RequestInit | undefined;
    const resendBody = JSON.parse(String(resendInit?.body)) as { subject: string; text: string };
    expect(resendBody.subject).toContain("ROI result");
    expect(resendBody.text).toContain("Your calculator result: hybrid");
    expect(resendBody.text).toContain("Directional break-even: 10 months");
  });

  it("deduplicates a repeated submission before sending a second message", async () => {
    const fetchMock = installDeliveryMock();
    const submissionId = crypto.randomUUID();
    const payload = { ...basePayload, submission_id: submissionId };

    const firstCtx = createExecutionContext();
    const first = await worker.fetch(request(payload), env, firstCtx);
    const firstBody = (await first.json()) as { id: string };
    await waitOnExecutionContext(firstCtx);

    const secondCtx = createExecutionContext();
    const second = await worker.fetch(request(payload), env, secondCtx);
    const secondBody = (await second.json()) as { id: string; duplicate: boolean; delivery_mode: string };
    await waitOnExecutionContext(secondCtx);

    expect(first.status).toBe(202);
    expect(second.status).toBe(200);
    expect(secondBody.duplicate).toBe(true);
    expect(secondBody.id).toBe(firstBody.id);
    expect(secondBody.delivery_mode).toBe("test");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("rejects invalid contact data without dispatching it", async () => {
    const fetchMock = installDeliveryMock();
    const ctx = createExecutionContext();
    const payload = {
      ...basePayload,
      submission_id: crypto.randomUUID(),
      contact: { name: "Bad Email", email: "not-an-email" }
    };
    const response = await worker.fetch(request(payload), env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({ ok: false, error: "valid_email_required" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects identified test submissions without the staging token", async () => {
    const fetchMock = installDeliveryMock();
    const ctx = createExecutionContext();
    const response = await worker.fetch(request(basePayload, "/v1/leads", "https://why57.com", null), env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ ok: false, error: "staging_authorization_required" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps the existing anonymous ROI click contract without sending messages", async () => {
    const fetchMock = installDeliveryMock();
    const ctx = createExecutionContext();
    const response = await worker.fetch(
      request(
        {
          event_type: "generate_lead",
          sent_at: new Date().toISOString(),
          context: {
            session_id: `roi-${crypto.randomUUID()}`,
            site_source: "roi_calculator",
            recommendation: "hybrid",
            readiness_score: 53,
            utm_source: "main-site"
          },
          detail: { cta_location: "results_panel" }
        },
        "/"
      ),
      env,
      ctx
    );
    const body = (await response.json()) as { id: string };
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(202);
    expect(body.id).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects unapproved browser origins", async () => {
    const ctx = createExecutionContext();
    const response = await worker.fetch(request(basePayload, "/v1/leads", "https://attacker.example"), env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ ok: false, error: "forbidden_origin" });
  });
});
