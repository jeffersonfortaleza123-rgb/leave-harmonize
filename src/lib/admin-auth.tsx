import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const ADMIN_USER = "SP";
const ADMIN_PASS = "12345678";
const STORAGE_KEY = "ferias_admin_v1";

type Ctx = {
  isAdmin: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
};

const AdminCtx = createContext<Ctx>({ isAdmin: false, login: () => false, logout: () => {} });

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY) === "1") {
        setIsAdmin(true);
      }
    } catch {}
  }, []);

  function login(user: string, pass: string) {
    if (user.trim() === ADMIN_USER && pass === ADMIN_PASS) {
      setIsAdmin(true);
      try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch {}
      return true;
    }
    return false;
  }

  function logout() {
    setIsAdmin(false);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  }

  return <AdminCtx.Provider value={{ isAdmin, login, logout }}>{children}</AdminCtx.Provider>;
}

export function useAdmin() {
  return useContext(AdminCtx);
}
