import { createFileRoute } from '@tanstack/react-router'
import { env } from '#/env'
import { Http, unwrap } from '#/lib/http'
import { AuthApi } from '#/lib/api-routes'
import { useAppSession } from '#/server/auth/session'

export const Route = createFileRoute('/api/auth/google/start')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const intent = url.searchParams.get('intent') === 'link' ? 'link' : 'auth'
        const qs = new URLSearchParams({ intent })

        if (intent === 'link') {
          const session = await useAppSession()
          const accessToken = session.data.accessToken
          if (!accessToken) {
            return new Response('Must be signed in to link an account', {
              status: 401,
            })
          }

          const response = await Http.post(AuthApi.googleLinkIntent, undefined, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          const { linkCode } = unwrap<{ linkCode: string }>(response)
          qs.set('linkCode', linkCode)
        }

        return Response.redirect(
          `${env.PUBLIC_API_BASE_URL}${AuthApi.google}?${qs.toString()}`,
        )
      },
    },
  },
})
