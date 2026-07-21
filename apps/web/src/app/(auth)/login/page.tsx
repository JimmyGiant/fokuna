"use client";

import { Button, InputGroup } from "@fokuna/ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

import styles from "../auth.module.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("demo@fokuna.app");
  const [password, setPassword] = useState("demo-password-123");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const response = await fetch("/api/auth/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sign-in", email, password }),
    });

    setPending(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: { message?: string } };
      setError(payload.error?.message ?? "Anmeldung fehlgeschlagen");
      return;
    }

    router.replace(searchParams.get("next") ?? "/app/aufgaben");
    router.refresh();
  }

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <div>
        <p className={styles.eyebrow}>Fokuna</p>
        <h1>Anmelden</h1>
        <p className={styles.lead}>
          Memory-Modus: demo@fokuna.app / demo-password-123. Mit Neon nutzt du Better Auth unter
          /api/auth.
        </p>
      </div>
      <InputGroup
        autoComplete="email"
        controlSize="lg"
        label="E-Mail"
        onChange={(event) => setEmail(event.target.value)}
        type="email"
        value={email}
      />
      <InputGroup
        autoComplete="current-password"
        controlSize="lg"
        label="Passwort"
        onChange={(event) => setPassword(event.target.value)}
        type="password"
        value={password}
      />
      {error ? <p className={styles.error}>{error}</p> : null}
      <Button disabled={pending} size="lg" type="submit">
        {pending ? "Wird angemeldet…" : "Anmelden"}
      </Button>
      <p className={styles.meta}>
        Noch kein Konto? <Link href="/register">Registrieren</Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <Suspense fallback={<div className={styles.card}>Laden…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
