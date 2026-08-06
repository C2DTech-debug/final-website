import nodemailer, { Transporter } from "nodemailer";
import { env, isEmailConfigured } from "../config/env";
import { logger } from "../utils/logger";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!isEmailConfigured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP.HOST,
      port: env.SMTP.PORT,
      secure: env.SMTP.SECURE,
      auth: env.SMTP.USER
        ? { user: env.SMTP.USER, pass: env.SMTP.PASS }
        : undefined,
    });
  }
  return transporter;
}

interface MailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendMail(payload: MailPayload): Promise<{ queued: boolean; error?: string }> {
  const t = getTransporter();
  if (!t) {
    logger.warn("[mail] SMTP not configured — email not sent:", payload.subject);
    return { queued: false, error: "SMTP_NOT_CONFIGURED" };
  }
  try {
    await t.sendMail({
      from: env.SMTP.FROM,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
    logger.info(`[mail] sent "${payload.subject}" -> ${payload.to}`);
    return { queued: true };
  } catch (error) {
    logger.error("[mail] send failed", error);
    return { queued: false, error: "SEND_FAILED" };
  }
}

const layout = (title: string, body: string) => `
<div style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f9;padding:32px 16px;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e9f0;">
    <div style="background:#0b1120;padding:24px 32px;">
      <h1 style="color:#fff;margin:0;font-size:20px;">${title}</h1>
    </div>
    <div style="padding:32px;color:#1f2937;font-size:15px;line-height:1.6;">${body}</div>
    <div style="padding:20px 32px;background:#f8fafc;color:#64748b;font-size:12px;border-top:1px solid #e5e9f0;">
      C2D Tech (Concept to Deploy) &middot; Trichy, Tamil Nadu, India<br/>
      <a href="https://c2dtech.example.com" style="color:#2563eb;">c2dtech.example.com</a>
    </div>
  </div>
</div>`;

export function contactAcknowledgement(name: string): string {
  return layout(
    "We received your message",
    `<p>Hi <strong>${name}</strong>,</p>
     <p>Thanks for reaching out to <strong>C2D Tech (Concept to Deploy)</strong>. Our developer squad in Trichy has received your message and will get back to you within 24 hours.</p>
     <p>While you wait, feel free to explore our <a href="https://c2dtech.example.com/portfolio" style="color:#2563eb;">portfolio</a> or try our <a href="https://c2dtech.example.com/estimator" style="color:#2563eb;">project estimator</a> to get a ballpark cost instantly.</p>
     <p>— Team C2D Tech</p>`
  );
}

export function contactAdminNotification(details: {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  budget?: string;
  timeline?: string;
  message: string;
}): string {
  const rows = [
    ["Name", details.name],
    ["Email", details.email],
    ["Phone", details.phone],
    ["Service", details.service],
    ["Budget", details.budget],
    ["Timeline", details.timeline],
    ["Message", details.message],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:8px 12px;border:1px solid #e5e9f0;font-weight:bold;width:140px;">${k}</td><td style="padding:8px 12px;border:1px solid #e5e9f0;">${v}</td></tr>`)
    .join("");

  return layout(
    "New contact message",
    `<p>A new enquiry just landed on the C2D Tech website.</p>
     <table style="border-collapse:collapse;width:100%;">${rows}</table>
     <p style="margin-top:20px;"><a href="https://c2dtech.example.com/admin/contacts" style="background:#2563eb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">Open in Admin Panel</a></p>`
  );
}

export function estimateAdminNotification(details: {
  name: string;
  email: string;
  totalCost: string;
  timeline: string;
  services: string[];
}): string {
  return layout(
    "New project estimate",
    `<p>A visitor requested a project estimate.</p>
     <ul>
       <li><strong>Name:</strong> ${details.name}</li>
       <li><strong>Email:</strong> ${details.email}</li>
       <li><strong>Services:</strong> ${details.services.join(", ")}</li>
       <li><strong>Estimated cost:</strong> ${details.totalCost}</li>
       <li><strong>Timeline:</strong> ${details.timeline}</li>
     </ul>`
  );
}
