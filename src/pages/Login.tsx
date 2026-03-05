import React, { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'

interface LoginProps {
  isLoading?: boolean
  onSubmit: (email: string, password: string) => Promise<void>
}

export const Login: React.FC<LoginProps> = ({ isLoading, onSubmit }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    try {
      await onSubmit(email.trim(), password)
    } catch (err: any) {
      setError(err?.message ?? 'Falha no login. Verifique e-mail e senha.')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-5 bg-[var(--bg)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>🔐 Acesso interno</CardTitle>
          <p className="text-xs text-[var(--txt3)] mt-1.5">
            Entre com seu e-mail e senha para acessar o painel Professor+LA.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--txt2)]">E-mail</label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seuemail@dominio.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--txt2)]">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Sua senha"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-[var(--red)]/30 bg-[rgba(166,28,28,0.10)] p-2.5 text-xs text-[var(--txt)]">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
