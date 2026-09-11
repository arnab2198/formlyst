import { TanStackDevtools } from '@tanstack/react-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { env } from '#/env'

type TanstackDevtoolsPanelProps = {}

export default function TanstackDevtoolsPanel({}: TanstackDevtoolsPanelProps) {
  if (env.NODE_ENV === 'production') {
    return null
  }

  return (
    <TanStackDevtools
      config={{
        position: 'bottom-right',
      }}
      plugins={[
        {
          name: 'Tanstack Router',
          render: <TanStackRouterDevtoolsPanel />,
        },
        {
          name: 'Tanstack Query',
          render: <ReactQueryDevtoolsPanel />,
        },
      ]}
    />
  )
}
