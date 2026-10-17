import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  const mailer = getTransporter();
  if (!mailer || !to) {
    console.log(`Email skipped: ${subject}`);
    return false;
  }
  await mailer.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text, html });
  return true;
}

export function todayISO() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.APP_TIMEZONE || "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function currentTimeISO() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: process.env.APP_TIMEZONE || "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.hour}:${values.minute}`;
}

export function isSlotInPast(date, startTime) {
  const today = todayISO();
  if (date < today) return true;
  if (date > today) return false;
  return startTime <= currentTimeISO();
}

export function calendarUrl({ title, start, end, details = "", location = "" }) {
  const format = (value) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const params = new URLSearchParams({ action: "TEMPLATE", text: title, dates: `${format(start)}/${format(end)}`, details, location });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
