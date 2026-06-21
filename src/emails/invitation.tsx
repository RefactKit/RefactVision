import { Button, Column, Heading, Img, Row, Section, Text } from '@react-email/components'
import { EmailLayout } from './layout'

interface InvitationEmailProps {
  orgName: string
  inviterName: string
  url: string
  orgLogo?: string
}

import { getBaseURL } from '../../lib/env'

const baseUrl = getBaseURL()

export const InvitationEmail = ({ orgName, inviterName, url, orgLogo }: InvitationEmailProps) => (
  <EmailLayout preview={`Join ${orgName} on RefactKit`}>
    <Section className="mb-8">
      <Section className="bg-black mx-auto p-3 rounded-xl w-14 text-center">
        <Img
          src={orgLogo || `${baseUrl}/static/logo-white.png`}
          alt={orgName}
          width={32}
          className="block mx-auto rounded"
        />
      </Section>
    </Section>

    <Heading as="h1" className="font-font-28 text-fg m-0 font-semibold mb-6">
      Join the Team
    </Heading>

    <Text className="font-font-16 text-fg-2 mx-auto mt-0 mb-8 max-w-[420px] text-center">
      <strong>{inviterName}</strong> has invited you to join <strong>{orgName}</strong> on
      RefactKit. Bring your team, tools, and workflows together in one place.
    </Text>

    <Row className="mb-10">
      <Column className="w-1/2 pr-2.5 align-top">
        <Text className="mt-0 mb-1 font-font-16 font-semibold text-fg text-left">
          Team workspaces
        </Text>
        <Text className="m-0 font-font-13 text-fg-2 text-left">
          Roles, guests, and access levels so the right people see the right work.
        </Text>
      </Column>
      <Column className="w-1/2 pl-2.5 align-top">
        <Text className="mt-0 mb-1 font-font-16 font-semibold text-fg text-left">
          Shared Storage
        </Text>
        <Text className="m-0 font-font-13 text-fg-2 text-left">
          Manage assets and documents in a centralized organization context.
        </Text>
      </Column>
    </Row>

    <Section className="text-center mb-6">
      <Button
        href={url}
        className="bg-primary font-font-16 text-white inline-block rounded-lg px-7 py-4 text-center font-semibold leading-6"
      >
        Accept Invitation
      </Button>
    </Section>

    <Text className="font-font-13 text-fg-3 mx-auto mt-8 mb-0 max-w-[400px] text-center">
      If you weren't expecting this invitation, you can safely ignore this email.
    </Text>
  </EmailLayout>
)

export default InvitationEmail
