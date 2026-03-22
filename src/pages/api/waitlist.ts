import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { email } = await request.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
  }

  const resend = new Resend(import.meta.env.RESEND_API_KEY);
  const from = import.meta.env.RESEND_FROM_EMAIL ?? 'Stoic Ledger <onboarding@resend.dev>';

  try {
    const promises: Promise<unknown>[] = [];

    // Add to audience — fetch ID automatically if not configured
    let audienceId = import.meta.env.RESEND_AUDIENCE_ID;
    if (!audienceId) {
      const audiencesRes = await resend.audiences.list();
      const list = (audiencesRes?.data as any)?.data ?? audiencesRes?.data;
      audienceId = Array.isArray(list) ? list[0]?.id : undefined;
    }
    if (audienceId) {
      promises.push(
        resend.contacts.create({
          email,
          unsubscribed: false,
          audienceId,
        })
      );
    }

    // Confirmation email to the user
    promises.push(
      resend.emails.send({
        from,
        to: email,
        subject: "You're on the list — Stoic Ledger",
        html: `
          <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#f8f9fa;color:#2b3437;">
            <h1 style="font-family:Manrope,sans-serif;font-size:28px;font-weight:800;margin-bottom:8px;color:#2b3437;">
              You're on the list.
            </h1>
            <p style="font-size:16px;color:#586064;line-height:1.6;margin-bottom:32px;">
              Thanks for joining the Stoic Ledger early access waitlist.<br/>
              We'll reach out as soon as your spot opens up.
            </p>
            <div style="background:#c7eade;border-radius:8px;padding:20px 24px;margin-bottom:32px;">
              <p style="margin:0;font-size:14px;font-weight:600;color:#39584e;">
                In the meantime, start thinking about this:<br/>
                <span style="font-size:18px;font-weight:800;color:#45655b;">What's your real number?</span>
              </p>
            </div>
            <p style="font-size:12px;color:#abb3b7;">
              © 2025 Stoic Ledger. You received this because you signed up at stoic-ledger.vercel.app.
            </p>
          </div>
        `,
      })
    );

    // Notification email to the product owner
    if (import.meta.env.RESEND_NOTIFY_EMAIL) {
      promises.push(
        resend.emails.send({
          from,
          to: import.meta.env.RESEND_NOTIFY_EMAIL,
          subject: `New waitlist signup: ${email}`,
          html: `
            <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8f9fa;color:#2b3437;">
              <p style="font-size:14px;color:#586064;margin-bottom:8px;">New signup on Stoic Ledger</p>
              <p style="font-size:24px;font-weight:800;color:#45655b;margin:0;">${email}</p>
            </div>
          `,
        })
      );
    }

    await Promise.allSettled(promises);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Waitlist error:', err);
    return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
  }
};
