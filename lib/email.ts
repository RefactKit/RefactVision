import { render } from '@react-email/render'
import type { ReactElement } from 'react'

export async function sendEmail({
  to,
  subject,
  html,
  template,
}: {
  to: string
  subject: string
  html?: string
  template?: ReactElement
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Missing RESEND_API_KEY in environment variables')
      return
    }

    const emailHtml = template ? await render(template) : html

    if (!emailHtml) {
      throw new Error('No email content provided (either html or template must be set)')
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'RefactKit <noreply@refactkit.com>',
        to,
        subject,
        html: emailHtml,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(`Failed to send email to ${to}:`, data)
      return
    }

    console.log(`Email sent successfully to ${to} (ID: ${data.id})`)
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error)
  }
}
