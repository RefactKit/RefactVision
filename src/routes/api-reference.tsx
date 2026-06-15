import { createFileRoute } from '@tanstack/react-router'
import { ApiReferenceReact } from '@scalar/api-reference-react'
import '@scalar/api-reference-react/style.css'

export const Route = createFileRoute('/api-reference')({
  component: ApiReferencePage,
})

function ApiReferencePage() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <ApiReferenceReact
        configuration={{
          spec: {
            url: '/api/auth/openapi.json',
          },
        }}
      />
    </div>
  )
}
