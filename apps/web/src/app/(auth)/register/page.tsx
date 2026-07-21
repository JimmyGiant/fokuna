"use client";

import { Button, InputGroup } from "@fokuna/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import styles from "../auth.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const response = await fetch("/api/auth/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sign-up", name, email, password }),
    });

    setPending(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: { message?: string } };
      setError(payload.error?.message ?? "Registrierung fehlgeschlagen");
      return;
    }

    router.replace("/app/aufgaben");
    router.refresh();
  }

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={onSubmit}>
        <div>
          <p className={styles.eyebrow}>Fokuna</p>
          <h1>Konto erstellen</h1>
          <p className={styles.lead}>E-Mail und Passwort — Verifizierung folgt mit Resend.</p>
        </div>
        <InputGroup
          controlSize="lg"
          label="Name"
          onChange={(event) => setName(event.target.value)}
          value={name}
        />
        <InputGroup
          autoComplete="email"
          controlSize="lg"
          label="E-Mail"
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          value={email}
        />
        <InputGroup
          autoComplete="new-password"
          controlSize="lg"
          label="Passwort"
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          value={password}
        />
        {error ? <p className={styles.error}>{error}</p> : null}
        <Button disabled={pending} size="lg" type="submit">
          {pending ? "Wird erstellt…" : "Registrieren"}
        </Button>
        <p className={styles.meta}>
          Bereits registriert? <Link href="/login">Anmelden</Link>
        </p>
      </form>
    </main>
  );
}
