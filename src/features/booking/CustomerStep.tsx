import type { Address, Customer } from '../../types/customer';

type CustomerStepProps = {
  customers: Customer[];
  addresses: Address[];
  customerId: string | null;
  addressId: string | null;
  customerError?: string;
  addressError?: string;
  onSelectCustomer: (id: string) => void;
  onSelectAddress: (id: string) => void;
};

export function CustomerStep({
  customers,
  addresses,
  customerId,
  addressId,
  customerError,
  addressError,
  onSelectCustomer,
  onSelectAddress,
}: CustomerStepProps) {
  if (customers.length === 0) {
    return (
      <p className="muted" role="status">
        No customer profiles are available to book with.
      </p>
    );
  }

  return (
    <div className="stack">
      <div>
        <p className="eyebrow">Customer</p>
        <div className="choice-list">
          {customers.map((customer) => (
            <button
              type="button"
              key={customer.id}
              className={`choice ${customerId === customer.id ? 'active' : ''}`}
              onClick={() => onSelectCustomer(customer.id)}
            >
              <strong>{customer.name}</strong>
              <span className="muted">{customer.email}</span>
            </button>
          ))}
        </div>
        {customerError ? (
          <p className="field-error" role="alert">
            {customerError}
          </p>
        ) : null}
      </div>

      <div>
        <p className="eyebrow">Address</p>
        {customerId && addresses.length === 0 ? (
          <p className="muted">This customer has no addresses.</p>
        ) : null}
        {!customerId ? <p className="muted">Select a customer first.</p> : null}
        <div className="choice-list">
          {addresses.map((address) => (
            <button
              type="button"
              key={address.id}
              className={`choice ${addressId === address.id ? 'active' : ''}`}
              onClick={() => onSelectAddress(address.id)}
            >
              <strong>{address.label}</strong>
              <span className="muted">
                {address.line1}, {address.city} {address.postalCode}
              </span>
            </button>
          ))}
        </div>
        {addressError ? (
          <p className="field-error" role="alert">
            {addressError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
