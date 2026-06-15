import { Button, Heading, Img, Section, Text } from '@react-email/components'
import React from 'react'
import { EmailLayout } from './layout'

interface SecurityAlertProps {
  userName: string
  email: string
  loginUrl: string
}

import { getBaseURL } from '../../lib/env'

const baseUrl = getBaseURL()

export const SecurityAlert = ({ userName, email, loginUrl }: SecurityAlertProps) => (
  <EmailLayout preview="Security Alert: Sign-in attempt on your account">
    <Section className="mb-3">
      <Img
        src={`${baseUrl}/static/logo.png`}
        alt="Logo"
        width={48}
        className="mx-auto mb-5 block"
      />
      <Heading as="h1" className="font-font-28 text-fg m-0 font-semibold">
        Security Alert
      </Heading>
    </Section>

    <Text className="font-font-16 text-fg-2 mx-auto mt-0 mb-4 max-w-[380px] text-left">
      Hi {userName},
    </Text>

    <Text className="font-font-16 text-fg-2 mx-auto mt-0 mb-8 max-w-[380px] text-left">
      Someone tried to create a new account using your email address (<strong>{email}</strong>). If
      this was you and you've forgotten your password, you can reset it.
    </Text>

    <Section className="mb-8 text-center">
      <Button
        href={loginUrl}
        className="bg-fg font-font-16 text-white inline-block rounded-lg px-7 py-4 text-center font-semibold leading-6"
      >
        Go to Login
      </Button>
    </Section>

    <Section className="bg-bg p-6 rounded-lg border border-stroke-strong text-left">
      <Text className="m-0 font-font-13 text-fg-3">
        <strong>Why did I receive this?</strong>
        <br />
        RefactKit uses anti-enumeration security to protect your privacy. If a signup attempt is
        made with an existing email, we notify you instead of revealing your account status to the
        visitor.
      </Text>
    </Section>
  </EmailLayout>
)

export default SecurityAlert
