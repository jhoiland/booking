export interface Booking {
  id: string;
  user_email: string;
  guest_name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  note?: string;
}

export interface BookingFormData {
  guest_name: string;
  start_date: string;
  end_date: string;
  note: string;
}
