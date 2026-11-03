import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

// Maps the short admin username to its login email. Authorization is enforced by database RLS (admin role).
const toEmail = (user: string) => `${user.trim().toLowerCase()}@3gb.local`;

type Ctx = {
  isAdmin: boolean;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
};

const AdminCtx = createContext<Ctx>({ isAdmin: false, login: async () => false, logout: () => {} });

async function checkAdmin(userId: string | undefined) {
  if (!userId) return false;
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  return !!data;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setTimeout(() => { checkAdmin(session?.user.id).then(setIsAdmin); }, 0);
    });
    supabase.auth.getSession().then(({ data }) => checkAdmin(data.session?.user.id).then(setIsAdmin));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function login(user: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: toEmail(user), password: pass });
    if (error || !data.user) return false;
    const ok = await checkAdmin(data.user.id);
    if (!ok) { await supabase.auth.signOut(); return false; }
    setIsAdmin(true);
    return true;
  }

  function logout() {
    setIsAdmin(false);
    supabase.auth.signOut();
  }

  return <AdminCtx.Provider value={{ isAdmin, login, logout }}>{children}</AdminCtx.Provider>;
}

export function useAdmin() {
  return useContext(AdminCtx);
}
