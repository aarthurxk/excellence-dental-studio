import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import logoSmall from "@/assets/logo-small.png";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const { signIn, role, user, loading } = useAuth();
  const navigate = useNavigate();

  // Navigate when role resolves after login
  useEffect(() => {
    if (loading) return;
    if (user && role) {
      navigate("/admin", { replace: true });
    }
  }, [user, role, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error("Credenciais inválidas");
      setSubmitting(false);
    }
    // If no error, the useEffect above will handle navigation once role loads
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Informe seu e-mail");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Erro ao enviar e-mail. Tente novamente.");
    } else {
      toast.success("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      setForgotMode(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <img src={logoSmall} alt="Odonto Excellence" className="h-12 mx-auto" />
          <CardTitle className="text-xl">
            {forgotMode ? "Recuperar Senha" : "Painel Administrativo"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {forgotMode ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Enviando..." : "Enviar Link de Recuperação"}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setForgotMode(false)}>
                Voltar ao login
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={submitting || loading}>
                {submitting ? "Entrando..." : "Entrar"}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => setForgotMode(true)}
                >
                  Esqueci minha senha
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
