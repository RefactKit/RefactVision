import { Button, Heading, Img, Section, Text } from '@react-email/components'
import { EmailLayout } from './layout'

interface VerifyEmailProps {
  url: string
}

import { getBaseURL } from '../../lib/env'

const baseUrl = getBaseURL()

export const VerifyEmail = ({ url }: VerifyEmailProps) => (
  <EmailLayout preview="Confirm your email address">
    <Section className="mb-3">
      <Img
        src={`${baseUrl}/static/logo.png`}
        alt="Logo"
        width={48}
        className="mx-auto mb-5 block"
      />
      <Heading as="h1" className="font-font-28 text-fg m-0 font-semibold">
        We're almost there!
      </Heading>
    </Section>

    <Text className="font-font-16 text-fg-2 mx-auto mt-0 mb-8 max-w-[380px] text-center">
      Thank you for signing up for RefactKit. To verify your account, we just need to confirm your
      email address.
    </Text>

    <Section className="mb-6 text-center">
      <Button
        href={url}
        className="bg-fg font-font-16 text-white inline-block rounded-lg px-7 py-4 text-center font-semibold leading-6"
      >
        Confirm Email
      </Button>
    </Section>

    <Text className="font-font-13 text-fg-3 mx-auto mt-8 mb-0 max-w-[400px] text-center">
      If you didn't request this, please ignore this email.
    </Text>
  </EmailLayout>
)

export default VerifyEmail
