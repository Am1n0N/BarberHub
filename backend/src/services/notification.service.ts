import nodemailer from 'nodemailer';
import { config } from '../config';

interface OwnerCredentials {
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string | null;
  shopName: string;
  password: string;
  dashboardUrl: string;
}

// ── Email ────────────────────────────────────────────────────────────────────

function createTransporter() {
  if (!config.smtp.host || !config.smtp.user) return null;
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });
}

function buildCredentialsEmail(creds: OwnerCredentials) {
  const subject = `BarberHub – Votre salon "${creds.shopName}" est activé ! 🎉`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;padding:24px;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:40px;">💈</span>
        <h1 style="margin:8px 0 0;font-size:22px;color:#1e40af;">BarberHub</h1>
      </div>

      <p style="font-size:16px;color:#374151;">
        Bonjour <strong>${creds.ownerName}</strong>,
      </p>

      <p style="font-size:15px;color:#374151;">
        Votre demande pour le salon <strong>"${creds.shopName}"</strong> a été approuvée.
        Voici vos identifiants de connexion :
      </p>

      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px;margin:20px 0;">
        <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">📞 Téléphone :</p>
        <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1e40af;">${creds.ownerPhone}</p>
        <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">🔑 Mot de passe :</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#1e40af;">${creds.password}</p>
      </div>

      <p style="font-size:14px;color:#6b7280;">
        ⚠️ Nous vous conseillons de changer votre mot de passe après votre première connexion.
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="${creds.dashboardUrl}"
           style="display:inline-block;padding:14px 32px;background:#2563eb;color:#fff;
                  font-weight:700;border-radius:12px;text-decoration:none;font-size:15px;">
          Accéder au tableau de bord →
        </a>
      </div>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
      <p style="font-size:12px;color:#9ca3af;text-align:center;">
        Cet email a été envoyé automatiquement par BarberHub.<br/>
        Si vous n'avez pas fait cette demande, ignorez cet email.
      </p>
    </div>
  `;
  const text = [
    `Bonjour ${creds.ownerName},`,
    ``,
    `Votre salon "${creds.shopName}" a été approuvé sur BarberHub !`,
    ``,
    `Vos identifiants :`,
    `  Téléphone : ${creds.ownerPhone}`,
    `  Mot de passe : ${creds.password}`,
    ``,
    `Connectez-vous ici : ${creds.dashboardUrl}`,
    ``,
    `Changez votre mot de passe après votre première connexion.`,
  ].join('\n');

  return { subject, html, text };
}

async function sendCredentialsEmail(creds: OwnerCredentials): Promise<boolean> {
  if (!creds.ownerEmail) return false;

  const transporter = createTransporter();
  if (!transporter) {
    console.warn('[notification] SMTP not configured – skipping email');
    return false;
  }

  const { subject, html, text } = buildCredentialsEmail(creds);

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: creds.ownerEmail,
      subject,
      html,
      text,
    });
    console.log('[notification] Credentials email sent successfully');
    return true;
  } catch (err) {
    console.error('[notification] Failed to send email:', err);
    return false;
  }
}

// ── WhatsApp ─────────────────────────────────────────────────────────────────

function buildWhatsAppMessage(creds: OwnerCredentials): string {
  return [
    `🎉 *BarberHub* – مرحبا ${creds.ownerName}!`,
    ``,
    `طلبك للحانوت *"${creds.shopName}"* تقبّل ✅`,
    ``,
    `بيانات الدخول متاعك:`,
    `📞 التليفون: ${creds.ownerPhone}`,
    `🔑 كلمة السر: ${creds.password}`,
    ``,
    `ادخل من هنا: ${creds.dashboardUrl}`,
    ``,
    `⚠️ بدّل كلمة السر بعد أوّل دخول.`,
  ].join('\n');
}

function getWhatsAppUrl(phone: string, message: string): string {
  // Normalize phone: strip leading 0, add Tunisia country code if needed
  let normalized = phone.replace(/\s+/g, '').replace(/^0+/, '');
  if (!normalized.startsWith('+') && !normalized.startsWith('216')) {
    normalized = `216${normalized}`;
  }
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

function logWhatsAppLink(creds: OwnerCredentials): string {
  const message = buildWhatsAppMessage(creds);
  const url = getWhatsAppUrl(creds.ownerPhone, message);
  console.log('[notification] WhatsApp link generated for owner');
  return url;
}

// ── Barber credentials helpers ────────────────────────────────────────────────

interface BarberCredentials {
  barberName: string;
  barberPhone: string;
  barberEmail?: string | null;
  shopName: string;
  password: string;
  dashboardUrl: string;
}

function buildBarberCredentialsEmail(creds: BarberCredentials) {
  const subject = `BarberHub – Bienvenue chez "${creds.shopName}" ! ✂️`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;padding:24px;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:40px;">✂️</span>
        <h1 style="margin:8px 0 0;font-size:22px;color:#7c3aed;">BarberHub</h1>
      </div>

      <p style="font-size:16px;color:#374151;">
        Bonjour <strong>${creds.barberName}</strong>,
      </p>

      <p style="font-size:15px;color:#374151;">
        Vous avez été ajouté(e) comme barbier au salon <strong>"${creds.shopName}"</strong> sur BarberHub.
        Voici vos identifiants de connexion :
      </p>

      <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:20px;margin:20px 0;">
        <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">📞 Téléphone :</p>
        <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#7c3aed;">${creds.barberPhone}</p>
        <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">🔑 Mot de passe :</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#7c3aed;">${creds.password}</p>
      </div>

      <p style="font-size:14px;color:#6b7280;">
        ⚠️ Nous vous conseillons de changer votre mot de passe après votre première connexion.
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="${creds.dashboardUrl}"
           style="display:inline-block;padding:14px 32px;background:#7c3aed;color:#fff;
                  font-weight:700;border-radius:12px;text-decoration:none;font-size:15px;">
          Accéder à mon espace →
        </a>
      </div>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
      <p style="font-size:12px;color:#9ca3af;text-align:center;">
        Cet email a été envoyé automatiquement par BarberHub.<br/>
        Si vous pensez avoir reçu cet email par erreur, veuillez contacter votre patron.
      </p>
    </div>
  `;
  const text = [
    `Bonjour ${creds.barberName},`,
    ``,
    `Vous avez été ajouté(e) comme barbier au salon "${creds.shopName}" sur BarberHub !`,
    ``,
    `Vos identifiants :`,
    `  Téléphone : ${creds.barberPhone}`,
    `  Mot de passe : ${creds.password}`,
    ``,
    `Connectez-vous ici : ${creds.dashboardUrl}`,
    ``,
    `Changez votre mot de passe après votre première connexion.`,
  ].join('\n');

  return { subject, html, text };
}

async function sendBarberCredentialsEmail(creds: BarberCredentials): Promise<boolean> {
  if (!creds.barberEmail) return false;

  const transporter = createTransporter();
  if (!transporter) {
    console.warn('[notification] SMTP not configured – skipping barber email');
    return false;
  }

  const { subject, html, text } = buildBarberCredentialsEmail(creds);

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: creds.barberEmail,
      subject,
      html,
      text,
    });
    console.log('[notification] Barber credentials email sent successfully');
    return true;
  } catch (err) {
    console.error('[notification] Failed to send barber email:', err);
    return false;
  }
}

function buildBarberWhatsAppMessage(creds: BarberCredentials): string {
  return [
    `✂️ *BarberHub* – مرحبا ${creds.barberName}!`,
    ``,
    `تمّت إضافتك كحجّام في حانوت *"${creds.shopName}"* ✅`,
    ``,
    `بيانات الدخول متاعك:`,
    `📞 التليفون: ${creds.barberPhone}`,
    `🔑 كلمة السر: ${creds.password}`,
    ``,
    `ادخل من هنا: ${creds.dashboardUrl}`,
    ``,
    `⚠️ بدّل كلمة السر بعد أوّل دخول.`,
  ].join('\n');
}

// ── Public API ───────────────────────────────────────────────────────────────

export interface NotificationResult {
  emailSent: boolean;
  whatsappUrl: string | null;
}

export async function notifyOwnerApproved(data: {
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string | null;
  shopName: string;
  password: string;
}): Promise<NotificationResult> {
  const dashboardUrl = `${config.appUrl}/fr/dashboard`;

  const creds: OwnerCredentials = { ...data, dashboardUrl };

  // Try email
  const emailSent = await sendCredentialsEmail(creds);

  // Always generate WhatsApp link (admin can click it to send manually, or for automation)
  let whatsappUrl: string | null = null;
  if (config.whatsappNotify) {
    whatsappUrl = logWhatsAppLink(creds);
  }

  if (!emailSent && !whatsappUrl) {
    console.warn(
      '[notification] No notification channel available – credentials were generated but could not be delivered. Configure SMTP or enable WhatsApp notifications.'
    );
  }

  return { emailSent, whatsappUrl };
}

export async function notifyBarberCreated(data: {
  barberName: string;
  barberPhone: string;
  barberEmail?: string | null;
  shopName: string;
  password: string;
}): Promise<NotificationResult> {
  const dashboardUrl = `${config.appUrl}/fr/dashboard`;

  const creds: BarberCredentials = { ...data, dashboardUrl };

  const emailSent = await sendBarberCredentialsEmail(creds);

  let whatsappUrl: string | null = null;
  if (config.whatsappNotify) {
    const message = buildBarberWhatsAppMessage(creds);
    whatsappUrl = getWhatsAppUrl(creds.barberPhone, message);
    console.log('[notification] WhatsApp link generated for barber');
  }

  if (!emailSent && !whatsappUrl) {
    console.warn(
      '[notification] No notification channel available for barber credentials.'
    );
  }

  return { emailSent, whatsappUrl };
}
