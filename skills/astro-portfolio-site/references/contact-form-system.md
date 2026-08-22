# Contact Form System

## API Endpoint (src/pages/api/contact.ts)

```typescript
import type { APIRoute } from 'astro';
import { jsx } from 'react/jsx-runtime';
import { Resend } from 'resend';
import ContactNotification from '../../emails/contact-notification';
import ContactConfirmation from '../../emails/contact-confirmation';

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  _honey?: string;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;

  // Rate limiting (keyed on client IP)
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  try {
    const { success } = await env.CONTACT_RATE_LIMITER.limit({ key: ip });
    if (!success) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please wait and try again.' }),
        { status: 429, headers: JSON_HEADERS },
      );
    }
  } catch {
    // Rate limiter may not be available in dev — continue without it
  }

  let body: ContactPayload;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body.' }),
      { status: 400, headers: JSON_HEADERS },
    );
  }

  // Honeypot — silently succeed to not tip off bots
  if (body._honey) {
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: JSON_HEADERS },
    );
  }

  // Validate required fields
  const { name, email, subject, message } = body;
  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return new Response(
      JSON.stringify({ error: 'All fields are required.' }),
      { status: 400, headers: JSON_HEADERS },
    );
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(
      JSON.stringify({ error: 'Invalid email address.' }),
      { status: 400, headers: JSON_HEADERS },
    );
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const fromAddress = '{{COMPANY}} <noreply@{{DOMAIN}}>';

  // Send notification to team
  const { error: notifyError } = await resend.emails.send({
    from: fromAddress,
    to: [env.CONTACT_EMAIL],
    replyTo: email,
    subject: `[Contact] ${subject}`,
    react: jsx(ContactNotification, { name, email, subject, message }),
  });

  if (notifyError) {
    console.error('Resend notification error:', notifyError);
    return new Response(
      JSON.stringify({ error: 'Failed to send message. Please try again later.' }),
      { status: 500, headers: JSON_HEADERS },
    );
  }

  // Send confirmation to sender (non-blocking)
  resend.emails.send({
    from: fromAddress,
    to: [email],
    subject: `We got your message — ${subject}`,
    react: jsx(ContactConfirmation, { name, subject }),
  }).catch((err: unknown) => {
    console.error('Resend confirmation error:', err);
  });

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: JSON_HEADERS },
  );
};
```

## Email Template: Notification (src/emails/contact-notification.tsx)

Sent to the team when someone submits the contact form:

```tsx
import {
  Html, Head, Preview, Body, Container, Section, Heading, Text, Hr, Link,
} from '@react-email/components';

interface ContactNotificationProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactNotification({ name, email, subject, message }: ContactNotificationProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>New contact from {name}: {subject}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={tagline}>// NEW TRANSMISSION</Text>
          <Heading style={heading}>Contact Form Submission</Heading>
          <Hr style={divider} />
          <Section style={fieldSection}>
            <Text style={fieldLabel}>FROM</Text>
            <Text style={fieldValue}>{name}</Text>
          </Section>
          <Section style={fieldSection}>
            <Text style={fieldLabel}>EMAIL</Text>
            <Link href={`mailto:${email}`} style={emailLink}>{email}</Link>
          </Section>
          <Section style={fieldSection}>
            <Text style={fieldLabel}>SUBJECT</Text>
            <Text style={fieldValue}>{subject}</Text>
          </Section>
          <Hr style={divider} />
          <Section style={messageSection}>
            <Text style={fieldLabel}>MESSAGE</Text>
            <Text style={messageText}>{message}</Text>
          </Section>
          <Hr style={divider} />
          <Text style={footer}>Sent from {{DOMAIN}} contact form</Text>
        </Container>
      </Body>
    </Html>
  );
}
```

## Email Template: Confirmation (src/emails/contact-confirmation.tsx)

Sent to the user as acknowledgement:

```tsx
export default function ContactConfirmation({ name, subject }: { name: string; subject: string }) {
  return (
    <Html lang="en">
      <Head />
      <Preview>We got your message, {name}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={tagline}>// {{COMPANY_UPPER}}</Text>
          <Heading style={heading}>Transmission Received</Heading>
          <Hr style={divider} />
          <Text style={paragraph}>
            Hey {name}, we got your message and we'll get back to you as soon as we can.
          </Text>
          <Section style={recapSection}>
            <Text style={recapLabel}>YOUR SUBJECT</Text>
            <Text style={recapValue}>{subject}</Text>
          </Section>
          <Text style={paragraph}>
            If you need to follow up, just reply to this email or reach out on our socials.
          </Text>
          <Hr style={divider} />
          <Section style={socialsSection}>
            {/* Include applicable social links */}
          </Section>
          <Hr style={divider} />
          <Text style={footer}>{{COMPANY}} — {{DOMAIN}}</Text>
        </Container>
      </Body>
    </Html>
  );
}
```

## Email Inline Styles

Both templates use the same dark theme style objects:

```typescript
const body = {
  backgroundColor: '#0A0A0A',
  fontFamily: "'Space Grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  margin: '0', padding: '0',
};
const container = {
  backgroundColor: '#111111',
  border: '1px solid #222222',
  margin: '40px auto', padding: '32px', maxWidth: '560px',
};
const tagline = {
  color: '{{PRIMARY_COLOR}}',  // brand primary
  fontSize: '11px',
  fontFamily: "'Courier New', monospace",
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px 0',
};
const heading = { color: '#FFFFFF', fontSize: '24px', fontWeight: '700', margin: '0 0 24px 0' };
const divider = { borderColor: '#333333', margin: '24px 0' };
const fieldLabel = {
  color: '#666666', fontSize: '10px',
  fontFamily: "'Courier New', monospace",
  letterSpacing: '2px', textTransform: 'uppercase' as const,
  margin: '0 0 4px 0',
};
const fieldValue = { color: '#FFFFFF', fontSize: '16px', margin: '0' };
const emailLink = { color: '{{SECONDARY_COLOR}}', fontSize: '16px', textDecoration: 'none' };
const messageSection = {
  backgroundColor: '#0A0A0A', border: '1px solid #222222', padding: '16px',
};
const messageText = {
  color: '#CCCCCC', fontSize: '15px', lineHeight: '1.6',
  margin: '0', whiteSpace: 'pre-wrap' as const,
};
const footer = {
  color: '#444444', fontSize: '11px',
  fontFamily: "'Courier New', monospace", margin: '0',
};
```

Adapt `tagline.color` and `emailLink.color` to match the client's brand.

## Contact Component (React)

The frontend Contact.tsx component pattern:

- Two-column layout: left (info + socials), right (form)
- Form fields: name, email, subject, message (all required)
- Honeypot field: `<input name="_honey" type="text" style={{ display: 'none' }} aria-hidden="true" tabIndex={-1} />`
- Status states: idle → sending → success/error
- Submit: `fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) })`
- GSAP ScrollTrigger entrance: left slides from x:-50, right slides from x:+50

## Environment Setup

1. `wrangler.jsonc` vars: `"CONTACT_EMAIL": "team@example.com"`
2. Secret: `wrangler secret put RESEND_API_KEY`
3. Rate limiting: Configure in Cloudflare dashboard (Pages doesn't support `ratelimits` in config)
   - Target: 5 requests per 60 seconds per IP
   - Binding name: `CONTACT_RATE_LIMITER`
4. From address domain must be verified in Resend dashboard
