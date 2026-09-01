import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isApiError } from '../../api/client';
import {
  createBooking,
  getCustomers,
  getService,
  getServiceAvailability,
} from '../../api/services';
import type { AsyncStatus } from '../../hooks/useAsyncStatus';
import { toDateOnly } from '../../lib/format';
import { ErrorCode } from '../../types/api';
import type { Customer } from '../../types/customer';
import type { Service, TimeSlot } from '../../types/service';
import { ServiceAvailability } from '../../types/service';

export type BookingStep = 'datetime' | 'customer' | 'confirm';

function fieldMap(details: Array<{ field: string; message: string }> | undefined) {
  const map: Record<string, string> = {};
  for (const detail of details ?? []) {
    map[detail.field] = detail.message;
  }
  return map;
}

export function useBooking() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<BookingStep>('datetime');
  const [service, setService] = useState<Service | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadStatus, setLoadStatus] = useState<AsyncStatus>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return toDateOnly(tomorrow);
  });
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsStatus, setSlotsStatus] = useState<AsyncStatus>('idle');
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [addressId, setAddressId] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!serviceId) {
      setLoadStatus('error');
      setLoadError('Service id is missing.');
      return;
    }

    let cancelled = false;
    setLoadStatus('loading');
    setLoadError(null);

    Promise.all([getService(serviceId), getCustomers()])
      .then(([nextService, nextCustomers]) => {
        if (cancelled) {
          return;
        }
        setService(nextService);
        setCustomers(nextCustomers);
        setLoadStatus('success');
      })
      .catch((reason: unknown) => {
        if (cancelled) {
          return;
        }
        setLoadError(isApiError(reason) ? reason.message : 'Unable to start booking.');
        setLoadStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId, reloadTick]);

  useEffect(() => {
    if (!serviceId || !date) {
      return;
    }

    let cancelled = false;
    setSlotsStatus('loading');
    setSlotsError(null);

    getServiceAvailability(serviceId, { date })
      .then((result) => {
        if (cancelled) {
          return;
        }
        setSlots(result.slots);
        const open = result.slots.filter((slot) => slot.available);
        setSlotsStatus(open.length === 0 ? 'empty' : 'success');
      })
      .catch((reason: unknown) => {
        if (cancelled) {
          return;
        }
        setSlots([]);
        setSlotsError(isApiError(reason) ? reason.message : 'Unable to load time slots.');
        setSlotsStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId, date, reloadTick]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === customerId) ?? null,
    [customers, customerId],
  );
  const selectedAddress = useMemo(
    () => selectedCustomer?.addresses.find((address) => address.id === addressId) ?? null,
    [selectedCustomer, addressId],
  );
  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.start === selectedStart) ?? null,
    [slots, selectedStart],
  );

  function selectDate(next: string) {
    setDate(next);
    setSelectedStart(null);
    setConflictMessage(null);
    setFieldErrors((current) => omitFields(current, ['scheduledStart']));
  }

  function selectSlot(slot: TimeSlot) {
    if (!slot.available) {
      return;
    }
    setSelectedStart(slot.start);
    setConflictMessage(null);
    setFieldErrors((current) => omitFields(current, ['scheduledStart']));
  }

  function selectCustomer(nextId: string) {
    setCustomerId(nextId);
    setAddressId(null);
    setFieldErrors((current) => omitFields(current, ['customerId', 'addressId']));
  }

  function selectAddress(nextId: string) {
    setAddressId(nextId);
    setFieldErrors((current) => omitFields(current, ['addressId']));
  }

  function goToCustomer() {
    if (!selectedSlot) {
      setFieldErrors((current) => ({
        ...current,
        scheduledStart: 'Choose an available time slot.',
      }));
      return;
    }
    setStep('customer');
  }

  function goToConfirm() {
    const next: Record<string, string> = {};
    if (!customerId) {
      next.customerId = 'Select a customer.';
    }
    if (!addressId) {
      next.addressId = 'Select an address.';
    }
    if (Object.keys(next).length > 0) {
      setFieldErrors((current) => ({ ...current, ...next }));
      return;
    }
    setStep('confirm');
  }

  async function submit() {
    if (!serviceId || !customerId || !addressId || !selectedStart) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setConflictMessage(null);
    setFieldErrors({});

    try {
      const booking = await createBooking({
        serviceId,
        customerId,
        addressId,
        scheduledStart: selectedStart,
      });
      navigate(`/bookings/${booking.id}/confirmed`);
    } catch (reason: unknown) {
      if (isApiError(reason) && reason.code === ErrorCode.SlotUnavailable) {
        // Contract: conflict returns to date/time, reloads slots, clears the choice.
        setConflictMessage(reason.message);
        setSelectedStart(null);
        setStep('datetime');
        setReloadTick((value) => value + 1);
      } else if (isApiError(reason) && reason.code === ErrorCode.Validation) {
        setFieldErrors(fieldMap(reason.details));
        setStep(reason.details?.some((detail) => detail.field === 'scheduledStart')
          ? 'datetime'
          : 'customer');
      } else {
        setSubmitError(isApiError(reason) ? reason.message : 'Booking could not be created.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return {
    serviceId,
    service,
    customers,
    loadStatus,
    loadError,
    reload: () => setReloadTick((value) => value + 1),
    serviceBookable: service?.availability !== ServiceAvailability.Unavailable,
    step,
    setStep,
    date,
    selectDate,
    slots,
    slotsStatus,
    slotsError,
    selectedSlot,
    selectSlot,
    customerId,
    addressId,
    selectedCustomer,
    selectedAddress,
    selectCustomer,
    selectAddress,
    fieldErrors,
    conflictMessage,
    submitError,
    submitting,
    goToCustomer,
    goToConfirm,
    submit,
    addresses: selectedCustomer?.addresses ?? [],
  };
}

function omitFields(
  current: Record<string, string>,
  fields: string[],
): Record<string, string> {
  const next = { ...current };
  for (const field of fields) {
    delete next[field];
  }
  return next;
}
