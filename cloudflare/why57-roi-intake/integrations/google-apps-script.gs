const LEAD_SHEET_NAME = "Leads";
const LEAD_HEADERS = [
  "received_at",
  "lead_id",
  "source",
  "name",
  "email",
  "company",
  "phone",
  "interest",
  "message",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "page_url",
  "recommendation",
  "readiness_score",
  "break_even_months"
];

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents || "{}");
    const properties = PropertiesService.getScriptProperties();
    const expectedSecret = properties.getProperty("LEAD_WEBHOOK_SECRET") || "";

    if (!expectedSecret || !constantTimeEqual(String(payload.webhook_secret || ""), expectedSecret)) {
      return jsonResponse({ ok: false, error: "unauthorized" });
    }

    const spreadsheetId = properties.getProperty("LEAD_SPREADSHEET_ID");
    if (!spreadsheetId) throw new Error("LEAD_SPREADSHEET_ID is not configured");

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(LEAD_SHEET_NAME) || spreadsheet.insertSheet(LEAD_SHEET_NAME);
    ensureHeaders(sheet);

    const lead = payload.lead || {};
    const contact = lead.contact || {};
    const row = [
      lead.received_at || new Date().toISOString(),
      lead.id || "",
      lead.source || "",
      contact.name || "",
      contact.email || "",
      contact.company || "",
      contact.phone || "",
      lead.interest || "",
      lead.message || "",
      lead.utm_source || "",
      lead.utm_medium || "",
      lead.utm_campaign || "",
      lead.page_url || "",
      lead.recommendation || "",
      lead.readiness_score === undefined ? "" : lead.readiness_score,
      lead.break_even_months === undefined ? "" : lead.break_even_months
    ].map(asSheetLiteral);
    sheet.appendRow(row);

    return jsonResponse({ ok: true, lead_id: lead.id || null });
  } catch (error) {
    console.error(error && error.stack ? error.stack : String(error));
    return jsonResponse({ ok: false, error: "lead_log_failed" });
  }
}

function asSheetLiteral(value) {
  if (value === undefined || value === null) return "";
  if (typeof value === "number" || typeof value === "boolean") return value;
  const text = String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, LEAD_HEADERS.length).setValues([LEAD_HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function constantTimeEqual(left, right) {
  const leftHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, left);
  const rightHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, right);
  let difference = 0;
  for (let index = 0; index < leftHash.length; index += 1) {
    difference |= leftHash[index] ^ rightHash[index];
  }
  return difference === 0;
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
