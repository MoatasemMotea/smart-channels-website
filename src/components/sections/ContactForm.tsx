"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { services } from "@/data/services";
import { contactFields, validateContact } from "@/lib/contact-rules";
import type { ContactErrors, ContactField } from "@/lib/contact-rules";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Contact form.
 *
 * ACCESSIBILITY
 * - Every control has a real `<label>` bound by `htmlFor`/`id`. No placeholder
 *   is used as a label — placeholders vanish on focus and are invisible to
 *   many assistive tools.
 * - Invalid fields set `aria-invalid` and point `aria-describedby` at their
 *   error, so a screen reader hears the specific problem on the specific field.
 * - On a failed submit, focus moves to an error summary that lists every
 *   problem as an in-page link. This is the pattern that works for a user who
 *   cannot see the red outlines.
 * - Status changes are announced through a `role="status"` live region.
 * - Errors surface on blur and on submit, never on every keystroke — validating
 *   an email while it is still being typed just shouts at the user.
 *
 * SECURITY
 * - Validation here is purely for feedback. The API route re-validates
 *   everything; see `src/app/api/contact/route.ts`.
 * - Carries a hidden honeypot and a render timestamp for the server's checks.
 * - No key, token or secret is present in this component.
 */
export function ContactForm({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const formId = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const startedAtRef = useRef<number>(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Recorded on mount so the server can reject implausibly fast submissions.
  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  const fieldId = (field: string) => `${formId}-${field}`;
  const errorId = (field: string) => `${formId}-${field}-error`;

  function readValues(form: HTMLFormElement) {
    const data = new FormData(form);
    return {
      name: String(data.get("name") ?? ""),
      company: String(data.get("company") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      service: String(data.get("service") ?? ""),
      message: String(data.get("message") ?? ""),
      website: String(data.get("website") ?? ""),
      startedAt: startedAtRef.current,
      locale,
    };
  }

  function validateField(field: ContactField) {
    const form = formRef.current;
    if (!form) return;
    const found = validateContact(readValues(form), dict);
    setErrors((previous) => {
      const next = { ...previous };
      const message = found[field];
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = readValues(form);

    const found = validateContact(values, dict);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setTouched(
        Object.fromEntries(contactFields.map((f) => [f, true])) as Record<
          ContactField,
          boolean
        >,
      );
      setStatus("error");
      // Let the summary render before moving focus into it.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setStatus("submitting");
    setErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        setStatus("success");
        form.reset();
        setTouched({});
        requestAnimationFrame(() => successRef.current?.focus());
        return;
      }

      const payload = (await response.json().catch(() => null)) as {
        errors?: ContactErrors;
      } | null;

      setErrors(payload?.errors ?? { form: dict.contact.form.errorGeneric });
      setStatus("error");
      requestAnimationFrame(() => summaryRef.current?.focus());
    } catch {
      setErrors({ form: dict.contact.form.errorNetwork });
      setStatus("error");
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  }

  /* --- Success state ----------------------------------------------------- */
  if (status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="flex h-full flex-col items-start justify-center rounded-lg border border-border bg-surface p-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] sm:p-10"
      >
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-accent-soft text-success">
          <CheckCircle2 aria-hidden="true" className="size-6" />
        </span>
        <h3 className="mt-5 text-xl font-bold text-fg-strong">
          {dict.contact.form.successHeading}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-fg-muted">
          {dict.contact.form.successBody}
        </p>
        <Button
          variant="outline"
          className="mt-7"
          onClick={() => {
            setStatus("idle");
            startedAtRef.current = Date.now();
          }}
        >
          {dict.contact.form.sendAnother}
        </Button>
      </div>
    );
  }

  const fieldErrors = contactFields
    .filter((field) => errors[field])
    .map((field) => ({ field, message: errors[field] as string }));

  const showSummary =
    status === "error" && (fieldErrors.length > 0 || Boolean(errors.form));

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="rounded-lg border border-border bg-surface p-6 sm:p-8"
    >
      <h3 className="text-xl font-bold text-fg-strong">
        {dict.contact.form.heading}
      </h3>

      {/* --- Error summary --- */}
      {showSummary ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="mt-6 rounded-md border border-danger/40 bg-danger/8 p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
        >
          <p className="flex items-center gap-2 text-sm font-bold text-danger">
            <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
            {errors.form ?? dict.contact.form.errorSummary}
          </p>
          {fieldErrors.length > 0 ? (
            <ul className="mt-3 space-y-1.5 ps-6">
              {fieldErrors.map(({ field, message }) => (
                <li key={field} className="list-disc text-sm text-danger">
                  <a
                    href={`#${fieldId(field)}`}
                    className="underline underline-offset-2 hover:no-underline"
                    onClick={(event) => {
                      event.preventDefault();
                      document.getElementById(fieldId(field))?.focus();
                    }}
                  >
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field
          id={fieldId("name")}
          name="name"
          label={dict.contact.form.name}
          placeholder={dict.contact.form.namePlaceholder}
          autoComplete="name"
          required
          error={touched.name ? errors.name : undefined}
          errorId={errorId("name")}
          onBlur={() => {
            setTouched((t) => ({ ...t, name: true }));
            validateField("name");
          }}
        />

        <Field
          id={fieldId("company")}
          name="company"
          label={dict.contact.form.company}
          placeholder={dict.contact.form.companyPlaceholder}
          autoComplete="organization"
          optionalLabel={dict.common.optional}
          error={touched.company ? errors.company : undefined}
          errorId={errorId("company")}
          onBlur={() => {
            setTouched((t) => ({ ...t, company: true }));
            validateField("company");
          }}
        />

        <Field
          id={fieldId("email")}
          name="email"
          type="email"
          label={dict.contact.form.email}
          placeholder={dict.contact.form.emailPlaceholder}
          autoComplete="email"
          inputMode="email"
          dir="ltr"
          required
          error={touched.email ? errors.email : undefined}
          errorId={errorId("email")}
          onBlur={() => {
            setTouched((t) => ({ ...t, email: true }));
            validateField("email");
          }}
        />

        <Field
          id={fieldId("phone")}
          name="phone"
          type="tel"
          label={dict.contact.form.phone}
          placeholder={dict.contact.form.phonePlaceholder}
          autoComplete="tel"
          inputMode="tel"
          dir="ltr"
          required
          error={touched.phone ? errors.phone : undefined}
          errorId={errorId("phone")}
          onBlur={() => {
            setTouched((t) => ({ ...t, phone: true }));
            validateField("phone");
          }}
        />

        {/* --- Service --- */}
        <div className="sm:col-span-2">
          <FieldLabel
            htmlFor={fieldId("service")}
            label={dict.contact.form.service}
            required
          />
          <select
            id={fieldId("service")}
            name="service"
            defaultValue=""
            required
            aria-invalid={touched.service && errors.service ? true : undefined}
            aria-describedby={
              touched.service && errors.service ? errorId("service") : undefined
            }
            onBlur={() => {
              setTouched((t) => ({ ...t, service: true }));
              validateField("service");
            }}
            onChange={() => validateField("service")}
            className={cn(
              controlClasses,
              selectClasses,
              touched.service && errors.service && controlErrorClasses,
            )}
          >
            <option value="" disabled>
              {dict.contact.form.servicePlaceholder}
            </option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title[locale]}
              </option>
            ))}
            <option value="other">{dict.contact.form.serviceOther}</option>
          </select>
          <FieldError id={errorId("service")} message={touched.service ? errors.service : undefined} />
        </div>

        {/* --- Message --- */}
        <div className="sm:col-span-2">
          <FieldLabel
            htmlFor={fieldId("message")}
            label={dict.contact.form.message}
            required
          />
          <textarea
            id={fieldId("message")}
            name="message"
            rows={5}
            required
            placeholder={dict.contact.form.messagePlaceholder}
            aria-invalid={touched.message && errors.message ? true : undefined}
            aria-describedby={
              touched.message && errors.message ? errorId("message") : undefined
            }
            onBlur={() => {
              setTouched((t) => ({ ...t, message: true }));
              validateField("message");
            }}
            className={cn(
              controlClasses,
              "min-h-32 resize-y",
              touched.message && errors.message && controlErrorClasses,
            )}
          />
          <FieldError id={errorId("message")} message={touched.message ? errors.message : undefined} />
        </div>
      </div>

      {/* --- Honeypot ---
          Hidden from sight and from assistive technology, and removed from the
          tab order. Only an automated filler will populate it. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor={fieldId("website")}>
          {dict.contact.form.honeypotLabel}
        </label>
        <input
          id={fieldId("website")}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="submit"
          size="lg"
          disabled={status === "submitting"}
          className="w-full sm:w-auto"
        >
          {status === "submitting" ? (
            <>
              <Loader2
                aria-hidden="true"
                className="size-[18px] motion-safe:animate-spin"
              />
              {dict.contact.form.submitting}
            </>
          ) : (
            <>
              <Send aria-hidden="true" className="size-[18px]" />
              {dict.contact.form.submit}
            </>
          )}
        </Button>

        {/* Announces submit progress without moving focus. */}
        <p role="status" aria-live="polite" className="sr-only">
          {status === "submitting" ? dict.contact.form.submitting : ""}
        </p>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-fg-subtle">
        {dict.contact.form.privacy}
      </p>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

const controlClasses =
  "w-full rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm text-fg " +
  "placeholder:text-fg-subtle transition-colors duration-200 " +
  "focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-1 " +
  "focus-visible:outline-[var(--color-focus)] " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const controlErrorClasses = "border-danger";

/**
 * A native `<select>` otherwise renders with the platform's own control chrome,
 * which does not match the other fields in either theme. The default appearance
 * is suppressed and a chevron drawn as an inline background image — `currentColor`
 * is not available in a CSS url(), so the arrow is a static neutral that reads
 * acceptably on both light and dark surfaces.
 *
 * The element stays a real `<select>`: native keyboard behaviour, native mobile
 * pickers and native form semantics all continue to work, which a custom
 * dropdown would have to reimplement and usually gets wrong.
 */
const selectClasses =
  "appearance-none bg-no-repeat pe-10 " +
  "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23857d8d%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] " +
  "bg-[length:1.15rem_1.15rem] " +
  "[background-position:right_0.85rem_center] rtl:[background-position:left_0.85rem_center]";

function FieldLabel({
  htmlFor,
  label,
  required,
  optionalLabel,
}: {
  htmlFor: string;
  label: string;
  required?: boolean;
  optionalLabel?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 flex items-baseline gap-2 text-sm font-bold text-fg"
    >
      {label}
      {required ? (
        <span aria-hidden="true" className="text-accent">
          *
        </span>
      ) : optionalLabel ? (
        <span className="text-xs font-normal text-fg-subtle">
          ({optionalLabel})
        </span>
      ) : null}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-xs text-danger">
      <AlertCircle aria-hidden="true" className="mt-px size-3.5 shrink-0" />
      {message}
    </p>
  );
}

interface FieldProps {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  optionalLabel?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel";
  dir?: "ltr" | "rtl";
  error?: string;
  errorId: string;
  onBlur: () => void;
}

function Field({
  id,
  name,
  label,
  placeholder,
  type = "text",
  required,
  optionalLabel,
  autoComplete,
  inputMode,
  dir,
  error,
  errorId,
  onBlur,
}: FieldProps) {
  return (
    <div>
      <FieldLabel
        htmlFor={id}
        label={label}
        required={required}
        optionalLabel={optionalLabel}
      />
      <input
        id={id}
        name={name}
        type={type}
        dir={dir}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onBlur={onBlur}
        className={cn(controlClasses, error && controlErrorClasses)}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}
