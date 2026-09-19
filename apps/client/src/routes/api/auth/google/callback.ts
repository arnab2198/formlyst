import { createFileRoute } from '@tanstack/react-router'
import type { User } from '#/types/user'
import { Http, unwrap } from '#/lib/http'
import { AuthApi } from '#/lib/api-routes'
import { useAppSession } from '#/server/auth/session'

export const Route = createFileRoute('/api/auth/google/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const handoff = url.searchParams.get('handoff')
        if (!handoff) {
          return new Response('Missing handoff code', { status: 400 })
        }

        const response = await Http.post(AuthApi.googleHandoffExchange, {
          code: handoff,
        })
        const { accessToken, refreshToken } = unwrap<{
          accessToken: string
          refreshToken: string
          user: User
        }>(response)

        const session = await useAppSession()
        await session.update({
          accessToken,
          refreshToken,
          registrationToken: undefined,
        })

        return Response.redirect('/')
      },
    },
  },
})
