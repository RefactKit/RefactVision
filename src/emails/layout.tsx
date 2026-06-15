import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'
import type React from 'react'
import { tailwindConfig } from './theme'
import { EmailFonts } from './theme-fonts'

interface EmailLayoutProps {
  preview: string
  children: React.ReactNode
  companyName?: string
}

import { getBaseURL } from '../../lib/env'

const baseUrl = getBaseURL()

export const EmailLayout = ({ preview, children, companyName = 'RefactKit' }: EmailLayoutProps) => (
  <Tailwind config={tailwindConfig}>
    <Html>
      <Head>
        <EmailFonts />
      </Head>
      <Body className="bg-bg-2 m-0 font-sans text-center">
        <Preview>{preview}</Preview>
        <Container className="mx-auto mt-8 w-full max-w-[640px]">
          <Section className="bg-bg px-6 py-4">
            {/* Header */}
            <Section className="mb-3 px-6">
              <Row>
                <Column className="py-[7px] w-1/2 align-middle">
                  <Img
                    src={`${baseUrl}/static/logo.png`}
                    alt="RefactKit"
                    width={100}
                    className="block"
                  />
                </Column>
                <Column align="right" className="py-[7px] w-1/2 align-middle">
                  <Text className="m-0 font-font-13 text-fg-3">{companyName}</Text>
                </Column>
              </Row>
            </Section>

            {/* Main Content Boxed */}
            <Section className="bg-bg-2 rounded-[10px] px-[40px] py-[64px] text-center border border-stroke-strong">
              {children}
            </Section>

            {/* Footer */}
            <Section className="py-10 text-center">
              <Text className="mx-auto mt-0 mb-8 max-w-[280px] font-font-13 text-fg-3">
                {companyName} — The high-performance SaaS boilerplate built with React 19 and
                TanStack.
              </Text>

              <Section className="mb-8">
                <Link href="https://twitter.com/refactkit" className="inline-block px-2">
                  <Text className="text-primary font-font-13 font-semibold m-0">Twitter</Text>
                </Link>
                <Link href="https://github.com/refactkit" className="inline-block px-2">
                  <Text className="text-primary font-font-13 font-semibold m-0">GitHub</Text>
                </Link>
              </Section>
              <Text className="m-0 font-font-11 text-fg-3">
                You're receiving this because you signed up for {companyName}.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
)
