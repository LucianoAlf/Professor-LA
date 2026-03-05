import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

type DatePickerProps = {
  value: string
  onChange: (nextValue: string) => void
  disabled?: boolean
}

const MONTHS_PT_BR = [
  'Janeiro',
  'Fevereiro',
  'Marco',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const START_YEAR = 1990
const END_YEAR = new Date().getFullYear() + 5

const pad = (value: number) => String(value).padStart(2, '0')

const toIsoDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const fromIsoDate = (value: string) => {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

const toDisplayDate = (value: string) => {
  const parsed = fromIsoDate(value)
  if (!parsed) return ''
  return `${pad(parsed.getDate())}/${pad(parsed.getMonth() + 1)}/${parsed.getFullYear()}`
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, disabled }) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const selectedDate = fromIsoDate(value)
  const [viewDate, setViewDate] = useState<Date>(selectedDate ?? new Date())

  useEffect(() => {
    if (selectedDate) {
      setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
    }
  }, [value])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const firstWeekDay = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells: Array<Date | null> = []

    for (let i = 0; i < firstWeekDay; i += 1) {
      cells.push(null)
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day))
    }

    while (cells.length < 42) {
      cells.push(null)
    }

    return cells
  }, [viewDate])

  const availableYears = useMemo(() => {
    const years: number[] = []
    for (let year = END_YEAR; year >= START_YEAR; year -= 1) {
      years.push(year)
    }
    return years
  }, [])

  const goToPrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const selectDate = (date: Date) => {
    onChange(toIsoDate(date))
    setOpen(false)
  }

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextMonth = Number(event.target.value)
    setViewDate((prev) => new Date(prev.getFullYear(), nextMonth, 1))
  }

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextYear = Number(event.target.value)
    setViewDate((prev) => new Date(nextYear, prev.getMonth(), 1))
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2.5 py-2 text-[13px] text-[var(--input-color)] outline-none w-full transition-colors focus:border-[var(--gold)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
      >
        <span className="font-mono">{toDisplayDate(value)}</span>
        <Calendar className="w-4 h-4 text-[var(--txt3)]" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-[320px] rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_12px_28px_rgba(0,0,0,0.35)] p-3">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="p-1.5 rounded-md border border-[var(--border)] text-[var(--txt2)] hover:border-[var(--gold)]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <select
                value={viewDate.getMonth()}
                onChange={handleMonthChange}
                className="h-8 rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] px-2 text-xs text-[var(--txt)] outline-none focus:border-[var(--gold)]"
              >
                {MONTHS_PT_BR.map((monthName, idx) => (
                  <option key={monthName} value={idx}>
                    {monthName}
                  </option>
                ))}
              </select>
              <select
                value={viewDate.getFullYear()}
                onChange={handleYearChange}
                className="h-8 rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] px-2 text-xs text-[var(--txt)] outline-none focus:border-[var(--gold)]"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-1.5 rounded-md border border-[var(--border)] text-[var(--txt2)] hover:border-[var(--gold)]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEK_DAYS.map((day, idx) => (
              <div key={`${day}-${idx}`} className="text-center text-[11px] text-[var(--txt3)] py-1 font-semibold">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} className="h-8" />
              }

              const iso = toIsoDate(date)
              const isSelected = iso === value
              const isToday = iso === toIsoDate(new Date())

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => selectDate(date)}
                  className={`h-8 rounded-md text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-[var(--gold)] text-[var(--ink)]'
                      : isToday
                      ? 'border border-[rgba(200,151,58,0.5)] text-[var(--gold)]'
                      : 'text-[var(--txt2)] hover:bg-[var(--sb-hover)]'
                  }`}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                const today = new Date()
                onChange(toIsoDate(today))
                setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
                setOpen(false)
              }}
              className="text-xs text-[var(--txt3)] hover:text-[var(--txt)]"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-[var(--txt3)] hover:text-[var(--txt)]"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
