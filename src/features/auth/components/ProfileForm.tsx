"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveCurrentProfile } from "@/features/auth/actions/profileActions";
import { requestEmailChange } from "@/services/authService";

type ProfileFormProps = {
  email: string;
  fullName: string;
  phone: string | null;
  dni: string | null;
  birthDate: string | null;
  gender: string | null;
};

function getToday() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export function ProfileForm({ email: initialEmail, fullName, phone, dni, birthDate, gender }: ProfileFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [emailPending, setEmailPending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [name, setName] = useState(fullName);
  const [telephone, setTelephone] = useState(phone ?? "");
  const [documentNumber, setDocumentNumber] = useState(dni ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(birthDate ?? "");
  const [selectedGender, setSelectedGender] = useState(gender ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailPending(true);
    setEmailError(null);
    setEmailSuccess(null);
    try {
      const result = await requestEmailChange(email);
      setEmailSuccess(
        result.requiresConfirmation
          ? "Te enviamos un enlace para confirmar el cambio. El correo actual seguirá activo hasta que lo confirmes."
          : "El correo se actualizó.",
      );
      if (!result.requiresConfirmation) router.refresh();
    } catch (caught) {
      setEmailError(caught instanceof Error ? caught.message : "No se pudo solicitar el cambio de correo.");
    } finally {
      setEmailPending(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await saveCurrentProfile({
        full_name: name,
        phone: telephone,
        dni: documentNumber,
        birth_date: dateOfBirth,
        gender: selectedGender,
      });
      setName(updated.full_name);
      setTelephone(updated.phone ?? "");
      setDocumentNumber(updated.dni ?? "");
      setDateOfBirth(updated.birth_date ?? "");
      setSelectedGender(updated.gender ?? "");
      setSuccess(true);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar el perfil. Inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <section className="profile-section" aria-labelledby="profile-email-heading">
        <h3 id="profile-email-heading">Correo electrónico</h3>
        <p>Para cambiarlo, confirma la nueva dirección desde el enlace que enviaremos.</p>
        {emailError && <div className="auth-message error" role="alert">{emailError}</div>}
        {emailSuccess && <div className="auth-message success" role="status">{emailSuccess}</div>}
        <form className="profile-email-form" onSubmit={handleEmailSubmit}>
          <div className="profile-field">
            <label htmlFor="profile-email">Correo electrónico</label>
            <input id="profile-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => { setEmail(event.target.value); setEmailSuccess(null); }} />
          </div>
          <Button type="submit" disabled={emailPending || email.trim().toLowerCase() === initialEmail.trim().toLowerCase()}>
            {emailPending ? "Solicitando cambio…" : "Actualizar correo"}
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </form>
      </section>

      <section className="profile-section" aria-labelledby="profile-details-heading">
        <h3 id="profile-details-heading">Datos personales</h3>
        {error && <div className="auth-message error" role="alert">{error}</div>}
        {success && <div className="auth-message success" role="status">Los cambios del perfil se guardaron.</div>}
        <form className="profile-details-form" onSubmit={handleSubmit}>
          <div className="profile-field">
            <label htmlFor="profile-phone">Teléfono <span className="auth-optional">(opcional)</span></label>
            <input id="profile-phone" type="tel" autoComplete="tel" maxLength={30} value={telephone} onChange={(event) => { setTelephone(event.target.value); setSuccess(false); }} />
          </div>
          <div className="profile-field">
            <label htmlFor="profile-dni">DNI <span className="auth-optional">(opcional)</span></label>
            <input id="profile-dni" type="text" inputMode="numeric" autoComplete="off" maxLength={8} pattern="[0-9]{8}" aria-describedby="profile-dni-hint" value={documentNumber} onChange={(event) => { setDocumentNumber(event.target.value); setSuccess(false); }} />
            <span id="profile-dni-hint" className="auth-field-hint">Ingresa los 8 dígitos del DNI.</span>
          </div>
          <div className="profile-field profile-field-wide">
            <label htmlFor="profile-name">Nombre completo</label>
            <input id="profile-name" type="text" autoComplete="name" required minLength={2} maxLength={120} value={name} onChange={(event) => { setName(event.target.value); setSuccess(false); }} />
          </div>
          <div className="profile-field">
            <label htmlFor="profile-birth-date">Fecha de nacimiento <span className="auth-optional">(opcional)</span></label>
            <input id="profile-birth-date" type="date" autoComplete="bday" max={getToday()} value={dateOfBirth} onChange={(event) => { setDateOfBirth(event.target.value); setSuccess(false); }} />
          </div>
          <div className="profile-field">
            <label htmlFor="profile-gender">Género <span className="auth-optional">(opcional)</span></label>
            <select id="profile-gender" value={selectedGender} onChange={(event) => { setSelectedGender(event.target.value); setSuccess(false); }}>
              <option value="">Selecciona una opción</option>
              <option value="female">Mujer</option>
              <option value="male">Hombre</option>
              <option value="non_binary">No binario</option>
              <option value="prefer_not_to_say">Prefiero no decirlo</option>
            </select>
          </div>
          <div className="profile-form-actions profile-field-wide">
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando cambios…" : "Guardar perfil"}
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>
        </form>
      </section>
    </>
  );
}
