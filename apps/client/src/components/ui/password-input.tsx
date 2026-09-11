import { useState } from 'react'
import { Input } from './input'
import { Button } from './button'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

function PasswordInput({
  className,
  type,
  ...props
}: React.ComponentProps<'input'>) {
  const [showPassword, setShowPassword] = useState(false)
  return (
    <div className="w-full max-w-sm space-y-2">
      <div className="relative">
        <Input
          className="bg-background"
          id="password-toggle"
          type={showPassword ? 'text' : 'password'}
          {...props}
        />
        <Button
          tabIndex={-1}
          className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          size="icon"
          type="button"
          variant="ghost"
        >
          {showPassword ? (
            <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
          ) : (
            <EyeIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  )
}

export { PasswordInput }
