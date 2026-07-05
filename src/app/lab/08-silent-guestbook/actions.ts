'use server';

import { addEntry } from './store';

export async function signGuestbook(formData: FormData) {
  const message = String(formData.get('message') ?? '').trim();
  if (!message) return;
  addEntry(message);
}
