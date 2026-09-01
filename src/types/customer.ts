export type Address = {
  id: string;
  label: string;
  line1: string;
  city: string;
  postalCode: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  addresses: Address[];
};
