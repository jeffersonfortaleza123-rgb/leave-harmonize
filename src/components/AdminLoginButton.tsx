import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, LogOut, ShieldCheck } from "lucide-react";
import { useAdmin } from "@/lib/admin-auth";
import { toast } from "sonner";

export function AdminLoginButton() {
  const { isAdmin, login, logout } = useAdmin();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (login(user, pass)) {
      toast.success("Login efetuado");
      setOpen(false);
      setUser("");
      setPass("");
    } else {
      toast.error("Usuário ou senha inválidos");
    }
  }

  if (isAdmin) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => { logout(); toast.success("Sessão encerrada"); }}
        className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white"
      >
        <ShieldCheck className="h-4 w-4" /> Admin
        <LogOut className="h-3.5 w-3.5 ml-1 opacity-80" />
      </Button>
    );
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white"
      >
        <Lock className="h-4 w-4" /> Entrar
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Acesso restrito</DialogTitle>
            <DialogDescription>Informe usuário e senha de administrador.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="adm-user">Usuário</Label>
              <Input id="adm-user" autoFocus value={user} onChange={(e) => setUser(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="adm-pass">Senha</Label>
              <Input id="adm-pass" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
            </div>
            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit">Entrar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
