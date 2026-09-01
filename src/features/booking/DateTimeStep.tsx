import { formatDateLabel, formatTime, upcomingDates } from '../../lib/format';
import type { TimeSlot } from '../../types/service';
import type { AsyncStatus } from '../../hooks/useAsyncStatus';

type DateTimeStepProps = {
  date: string;
  slots: TimeSlot[];
  slotsStatus: AsyncStatus;
  slotsError: string | null;
  selectedStart: string | null;
  fieldError?: string;
  conflictMessage: string | null;
  onSelectDate: (date: string) => void;
  onSelectSlot: (slot: TimeSlot) => void;
};

export function DateTimeStep({
  date,
  slots,
  slotsStatus,
  slotsError,
  selectedStart,
  fieldError,
  conflictMessage,
  onSelectDate,
  onSelectSlot,
}: DateTimeStepProps) {
  return (
    <div className="stack">
      {conflictMessage ? (
        <p className="banner danger" role="alert">
          {conflictMessage} Choose another time.
        </p>
      ) : null}

      <div>
        <p className="eyebrow">Date</p>
        <div className="chips" role="group" aria-label="Date">
          {upcomingDates(14).map((item) => (
            <button
              type="button"
              key={item}
              className={`chip ${date === item ? 'active' : ''}`}
              onClick={() => onSelectDate(item)}
            >
              {formatDateLabel(item)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow">Time</p>
        {slotsStatus === 'loading' ? <p className="muted">Loading times…</p> : null}
        {slotsStatus === 'error' ? (
          <p className="field-error" role="alert">
            {slotsError}
          </p>
        ) : null}
        {slotsStatus === 'empty' ? (
          <p className="muted">No times on this date. Pick another day.</p>
        ) : null}
        {slotsStatus === 'success' ? (
          <div className="chips" role="group" aria-label="Time slots">
            {slots.map((slot) => (
              <button
                type="button"
                key={slot.start}
                className={`chip ${selectedStart === slot.start ? 'active' : ''}`}
                disabled={!slot.available}
                onClick={() => onSelectSlot(slot)}
              >
                {formatTime(slot.start)}
                {slot.available ? '' : ' · taken'}
              </button>
            ))}
          </div>
        ) : null}
        {fieldError ? (
          <p className="field-error" role="alert">
            {fieldError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
