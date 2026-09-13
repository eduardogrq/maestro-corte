"use client"

import { useActionState, useEffect, useMemo, useState } from "react"
import type { AppointmentFormState } from "@/actions/appointments"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { business } from "@/data/business"
import { BEARD_EXTRA, groupOptions, resolveServiceTotals } from "@/data/services"
import { formatMxPhone } from "@/lib/phone"
import type { BookableService, ClientSuggestion } from "@/types"
import {
  addDaysToDateString,
  addMinutes,
  formatDateShort,
  formatPriceMxn,
  formatTimeRange,
  formatWallClockTime,
  slotsForDate,
  wallClockToUtc,
} from "@/lib/datetime"
import type { AppointmentFormValues } from "@/server/appointments/schemas"

/** A slot already taken, as epoch milliseconds so overlap math needs no timezone logic. */
export interface BusyInterval {
  startMs: number
  endMs: number
  clientName: string
}

type FormAction = (
  state: AppointmentFormState,
  formData: FormData
) => Promise<AppointmentFormState>

/** Four digits is where guessing stops and searching starts. */
const MIN_SEARCH_DIGITS = 4

/** Long enough that one-thumb typing isn't a round trip per keystroke. */
const SEARCH_DEBOUNCE_MS = 250

interface AppointmentFormProps {
  action: FormAction
  /** Looks up clients who have booked before by phone number, for autofill. */
  searchClients: (term: string) => Promise<ClientSuggestion[]>
  services: BookableService[]
  busy: BusyInterval[]
  initialValues: AppointmentFormValues
  today: string
  /** Request time, in epoch ms. Comes from the server so render stays pure. */
  serverNowMs: number
  /** Earliest selectable date. Editing an old appointment needs it below `today`. */
  minDate: string
  submitLabel: string
  /** Present when editing. Sent along so the action knows which row to update. */
  appointmentId?: string
}

export function AppointmentForm({
  action,
  searchClients,
  services,
  busy,
  initialValues,
  today,
  serverNowMs,
  minDate,
  submitLabel,
  appointmentId,
}: AppointmentFormProps) {
  const [state, formAction, pending] = useActionState(action, {
    values: initialValues,
  } satisfies AppointmentFormState)

  // After a failed submit the server echoes back what was typed, so nothing is
  // lost; before that, the initial values win.
  const values = state.values ?? initialValues

  // Controlled, unlike the rest of the text fields: picking a returning client
  // has to be able to write into them.
  const [clientName, setClientName] = useState(values.clientName)
  const [clientPhone, setClientPhone] = useState(values.clientPhone)
  const [address, setAddress] = useState(values.address)

  const [date, setDate] = useState(values.date)
  const [time, setTime] = useState(values.time)
  const [serviceId, setServiceId] = useState(values.serviceId)
  const [groupId, setGroupId] = useState(values.groupId)
  const [withBeard, setWithBeard] = useState(values.withBeard === "1")
  const [firstVisit, setFirstVisit] = useState(values.firstVisit === "1")

  // Starts on when the time already saved is an unusual one: editing a 7am
  // appointment has to show the chip it is sitting on, not an empty selection.
  const [showExtendedHours, setShowExtendedHours] = useState(
    () => values.time !== "" && !slotsForDate(values.date).includes(values.time)
  )

  // One token per mounted form: a double tap resubmits the same one and collides
  // on the unique index instead of creating a second appointment.
  const [clientToken] = useState(() => crypto.randomUUID())

  // Results carry the term they answer, so a reply that lands after he kept
  // typing is simply ignored instead of flashing the wrong client on screen.
  const [found, setFound] = useState<{ term: string; clients: ClientSuggestion[] }>({
    term: "",
    clients: [],
  })

  // Set the moment he picks someone, so the list doesn't pop straight back up on
  // top of the number it just filled in. Typing again is what reopens it.
  const [suggestionsClosed, setSuggestionsClosed] = useState(false)

  // Searched by phone, not by name: the phone is the only field that identifies
  // one person. Digits only, so "55 1234" and "551234" are the same search.
  const searchTerm = clientPhone.replace(/\D/g, "")
  const canSearch = !suggestionsClosed && searchTerm.length >= MIN_SEARCH_DIGITS
  const suggestions = canSearch && found.term === searchTerm ? found.clients : []

  useEffect(() => {
    if (!canSearch) return

    let active = true

    const timer = setTimeout(() => {
      searchClients(searchTerm)
        .then((clients) => {
          if (active) setFound({ term: searchTerm, clients })
        })
        // A failed lookup is not worth an error message: he can still type the
        // address by hand, which is what he did until now.
        .catch(() => {
          if (active) setFound({ term: searchTerm, clients: [] })
        })
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [canSearch, searchClients, searchTerm])

  function applySuggestion(suggestion: ClientSuggestion) {
    setClientName(suggestion.clientName)
    // Shown the way he reads it, not the canonical 52##########.
    setClientPhone(formatMxPhone(suggestion.clientPhone))

    // Old appointments may have no address; keeping whatever is typed beats
    // clearing the field.
    if (suggestion.address) {
      setAddress(suggestion.address)
    }

    setSuggestionsClosed(true)
  }

  const [nowMs, setNowMs] = useState(serverNowMs)

  // The form stays open while he talks to the client. Without this the slots that
  // passed in the meantime would still look tappable, and the server would then
  // refuse the submit for a reason that was never on screen.
  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 60_000)

    return () => clearInterval(timer)
  }, [])

  const service = services.find((candidate) => candidate.id === serviceId)

  // Same function the server uses, so the preview can never promise a price or
  // an end time that the saved appointment contradicts.
  const totals = service
    ? resolveServiceTotals(service, { groupId, withBeard, firstVisit })
    : undefined

  /**
   * True when this form was opened on an appointment that had already started.
   * That is history being corrected, not a booking, so every hour stays open —
   * the same exception the server makes. Measured against the server's clock at
   * load time, not the live one: it must not flip while he is typing.
   */
  const editingPast =
    appointmentId !== undefined &&
    initialValues.time !== "" &&
    wallClockToUtc(initialValues.date, initialValues.time).getTime() < serverNowMs

  const slots = useMemo(() => {
    const durationMin = totals?.durationMin ?? 0

    const closePastSlots = !editingPast && date >= today

    return slotsForDate(date, showExtendedHours).map((slot) => {
      const startsAt = wallClockToUtc(date, slot)
      const endsAt = addMinutes(startsAt, durationMin)
      const startMs = startsAt.getTime()
      const endMs = endsAt.getTime()

      const conflict = busy.find(
        (interval) => startMs < interval.endMs && endMs > interval.startMs
      )

      return {
        slot,
        conflict,
        isPast: closePastSlots && startMs < nowMs,
        startsAt,
        endsAt,
      }
    })
  }, [busy, date, editingPast, nowMs, showExtendedHours, today, totals?.durationMin])

  const selected = slots.find((entry) => entry.slot === time)

  // Warnings describe the slot that was *submitted*. If he moved the appointment
  // after reading them, they no longer apply — dropping them brings the normal
  // save button back and stops "Guardar de todos modos" from forcing a slot
  // nobody warned about.
  const warningsApplyToCurrentSlot =
    state.values !== undefined &&
    state.values.date === date &&
    state.values.time === time &&
    state.values.serviceId === serviceId &&
    state.values.groupId === groupId &&
    (state.values.withBeard === "1") === withBeard &&
    (state.values.firstVisit === "1") === firstVisit

  const warnings =
    state.warnings && warningsApplyToCurrentSlot ? state.warnings : []

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {appointmentId && <input type="hidden" name="id" value={appointmentId} />}
      <input type="hidden" name="clientToken" value={clientToken} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="time" value={time} />
      <input type="hidden" name="groupId" value={groupId} />

      {/* Phone first, above the name: it is what he asks the client for, and
          typing it is what fills in everything else. */}
      {/* Tighter than the form's own gap-6: the suggestions belong to the field
          above them, and 24px of air would read as a separate section. */}
      <div className="flex flex-col gap-2">
        <Field
          htmlFor="clientPhone"
          label="WhatsApp"
          hint="Si ya vino antes, escribe su número y aparece abajo."
          error={state.fieldErrors?.clientPhone}
        >
          <Input
            id="clientPhone"
            name="clientPhone"
            // `tel` + numeric keypad: no letters needed, and iOS shows big keys.
            type="tel"
            inputMode="numeric"
            // Off on purpose: the browser's own history knows nothing about his
            // clients, and these suggestions do.
            autoComplete="off"
            value={clientPhone}
            onChange={(event) => {
              setClientPhone(event.target.value)
              // Typing again means he's looking for someone else.
              setSuggestionsClosed(false)
            }}
            invalid={Boolean(state.fieldErrors?.clientPhone)}
            placeholder="55 1234 5678"
          />
        </Field>

        {suggestions.length > 0 && (
          <ul className="flex flex-col gap-1 rounded-xl border border-border bg-surface/50 p-1">
            {suggestions.map((suggestion) => (
              <li key={suggestion.clientPhone}>
                <button
                  type="button"
                  onClick={() => applySuggestion(suggestion)}
                  className="flex min-h-12 w-full flex-col items-start justify-center gap-0.5 rounded-lg px-3 py-2 text-left transition-colors duration-200 hover:bg-background"
                >
                  <span className="text-base text-foreground">
                    {suggestion.clientName}
                    <span className="text-muted">
                      {" · "}
                      {formatMxPhone(suggestion.clientPhone)}
                    </span>
                  </span>
                  {/* The address: it is the thing he came here for. */}
                  {suggestion.address && (
                    <span className="text-sm text-muted">{suggestion.address}</span>
                  )}
                  <span className="text-xs text-muted">
                    última cita {formatDateShort(suggestion.lastVisitDate)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Field
        htmlFor="clientName"
        label="Nombre del cliente"
        error={state.fieldErrors?.clientName}
      >
        <Input
          id="clientName"
          name="clientName"
          value={clientName}
          onChange={(event) => setClientName(event.target.value)}
          autoCapitalize="words"
          enterKeyHint="next"
          invalid={Boolean(state.fieldErrors?.clientName)}
          placeholder="Juan Pérez"
        />
      </Field>

      <Field htmlFor="serviceId" label="Servicio" error={state.fieldErrors?.serviceId}>
        <Select
          id="serviceId"
          name="serviceId"
          value={serviceId}
          onChange={(event) => setServiceId(event.target.value)}
          invalid={Boolean(state.fieldErrors?.serviceId)}
        >
          {services.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name} · {option.durationMin} min · {formatPriceMxn(option.priceMxn)}
            </option>
          ))}
        </Select>
      </Field>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-foreground">Personas</legend>

        <div className="grid gap-2 sm:grid-cols-3">
          {groupOptions.map((option) => (
            <Button
              key={option.id}
              variant={groupId === option.id ? "primary" : "secondary"}
              aria-pressed={groupId === option.id}
              onClick={() => setGroupId(option.id)}
            >
              {option.label}
              {option.hint && (
                <span className={groupId === option.id ? "opacity-70" : "text-muted"}>
                  {option.hint}
                </span>
              )}
            </Button>
          ))}
        </div>

        {state.fieldErrors?.groupId && (
          <p className="text-sm text-danger" role="alert">
            {state.fieldErrors.groupId}
          </p>
        )}
      </fieldset>

      {/* Labels wrapping the inputs, so the whole 48px row is the tap target. */}
      <div className="flex flex-col gap-2">
        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 transition-colors duration-200 hover:border-muted/50">
          <input
            type="checkbox"
            name="withBeard"
            value="1"
            checked={withBeard}
            onChange={(event) => setWithBeard(event.target.checked)}
            className="size-5 shrink-0 accent-accent"
          />
          <span className="text-base text-foreground">
            Incluye barba
            <span className="text-muted"> · +{BEARD_EXTRA.durationMin} min</span>
          </span>
        </label>

        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 transition-colors duration-200 hover:border-muted/50">
          <input
            type="checkbox"
            name="firstVisit"
            value="1"
            checked={firstVisit}
            onChange={(event) => setFirstVisit(event.target.checked)}
            className="size-5 shrink-0 accent-accent"
          />
          <span className="text-base text-foreground">
            Primera cita
            {/* Not "20% off": haircuts are a flat $229 and Amigos is $449. The
                live total below is the honest number. */}
            <span className="text-muted"> · precio de bienvenida</span>
          </span>
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <Field htmlFor="dateInput" label="Fecha" error={state.fieldErrors?.date}>
          <Input
            id="dateInput"
            type="date"
            value={date}
            min={minDate}
            onChange={(event) => {
              setDate(event.target.value || today)
              // Occupancy differs per day; keeping the old chip selected would
              // silently pick a taken slot.
              setTime("")
            }}
            invalid={Boolean(state.fieldErrors?.date)}
          />
        </Field>

        <div className="flex gap-2">
          {[
            { label: "Hoy", value: today },
            { label: "Mañana", value: addDaysToDateString(today, 1) },
          ].map((shortcut) => (
            <Button
              key={shortcut.value}
              variant={date === shortcut.value ? "primary" : "secondary"}
              className="min-h-10 px-4 text-sm"
              onClick={() => {
                setDate(shortcut.value)
                setTime("")
              }}
            >
              {shortcut.label}
            </Button>
          ))}
        </div>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-foreground">Hora</legend>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slots.map(({ slot, conflict, isPast }) => {
            const isSelected = slot === time

            // The selected chip is never disabled: if the clock crosses it while
            // the form is open, his selection must not turn into a dead button.
            const disabled = !isSelected && (Boolean(conflict) || isPast)

            return (
              <button
                key={slot}
                type="button"
                disabled={disabled}
                onClick={() => setTime(slot)}
                // The occupied slots carry the client's name so the whole day is
                // readable at a glance, without leaving the form.
                title={
                  conflict
                    ? `Ocupado: ${conflict.clientName}`
                    : isPast
                      ? "Ya pasó"
                      : undefined
                }
                className={`flex min-h-12 flex-col items-center justify-center rounded-xl border px-1 text-sm transition-colors duration-200 ${
                  isSelected
                    ? "border-foreground bg-foreground text-background"
                    : conflict
                      ? "cursor-not-allowed border-border bg-surface text-muted/70"
                      : isPast
                        ? "cursor-not-allowed border-border/60 bg-transparent text-muted/50"
                        : "border-border bg-background text-foreground hover:border-muted/50"
                }`}
              >
                <span className={conflict ? "line-through" : undefined}>
                  {formatWallClockTime(slot)}
                </span>
                {conflict && (
                  <span className="max-w-full truncate text-[11px] leading-tight">
                    {conflict.clientName.split(/\s+/)[0]}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Not a hidden input: which hours are *shown* is a decision about this
            screen, and the server infers the intent from the time itself. */}
        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 transition-colors duration-200 hover:border-muted/50">
          <input
            type="checkbox"
            checked={showExtendedHours}
            onChange={(event) => {
              const next = event.target.checked
              setShowExtendedHours(next)

              // Folding the list back up must not leave a time selected whose
              // chip is no longer on screen.
              if (!next && time && !slotsForDate(date).includes(time)) {
                setTime("")
              }
            }}
            className="size-5 shrink-0 accent-accent"
          />
          <span className="text-base text-foreground">
            Horarios especiales
            <span className="text-muted">
              {" · "}
              {formatWallClockTime(business.extendedBookingHours.open)} a{" "}
              {formatWallClockTime(business.extendedBookingHours.close)}
            </span>
          </span>
        </label>

        {state.fieldErrors?.time && (
          <p className="text-sm text-danger" role="alert">
            {state.fieldErrors.time}
          </p>
        )}
      </fieldset>

      {/* Live total. The barber should never have to add up minutes or pesos. */}
      {selected && totals && (
        <div className="rounded-xl bg-surface px-4 py-3">
          <p className="text-base text-foreground">
            {formatTimeRange(selected.startsAt, selected.endsAt)}
            <span className="text-muted"> · </span>
            {formatPriceMxn(totals.priceMxn)}
          </p>
          <p className="mt-0.5 text-sm text-muted">
            {totals.name} · {totals.durationMin} min
          </p>
        </div>
      )}

      <Field
        htmlFor="address"
        label="Dirección"
        hint="Aparece en el calendario y en el mensaje de WhatsApp."
        error={state.fieldErrors?.address}
      >
        <Textarea
          id="address"
          name="address"
          rows={2}
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          autoCapitalize="sentences"
          invalid={Boolean(state.fieldErrors?.address)}
          placeholder="Calle, número, colonia, referencias"
        />
      </Field>

      <Field htmlFor="notes" label="Notas" optional error={state.fieldErrors?.notes}>
        <Textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={values.notes}
          autoCapitalize="sentences"
          invalid={Boolean(state.fieldErrors?.notes)}
          placeholder="Fade bajo, barba perfilada…"
        />
      </Field>

      {state.error && (
        <p className="rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      {/* Warnings, not blocks: nothing was written yet, and he decides. While they
          are on screen this *replaces* the normal save button — leaving both would
          show a button that resubmits, gets the same warnings back and looks broken. */}
      {warnings.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-xl border border-warning/40 bg-warning/5 px-4 py-4">
          <p className="text-sm font-medium text-foreground">Revisa antes de guardar:</p>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-foreground">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
          <p className="text-sm text-muted">
            Cambia la hora arriba, o guárdala así si tú lo tienes cubierto.
          </p>
          <Button type="submit" name="force" value="1" size="lg" disabled={pending}>
            {pending ? "Guardando…" : "Guardar de todos modos"}
          </Button>
        </div>
      ) : (
        <Button type="submit" size="lg" disabled={pending || !time}>
          {pending ? "Guardando…" : submitLabel}
        </Button>
      )}
    </form>
  )
}
