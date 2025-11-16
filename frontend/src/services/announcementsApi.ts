const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export type CreateAnnouncementInput = {
  company: string;
  location: string;
  role: string;
  package: string;
  date: string;
  instructions?: string;
};

export async function createAnnouncement(input: CreateAnnouncementInput, token: string) {
  const res = await fetch(`${API_URL}/api/announcements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to create announcement');
  return res.json();
}

export async function listAnnouncements(sort: 'newest'|'oldest' = 'newest') {
  const res = await fetch(`${API_URL}/api/announcements?sort=${sort}`);
  if (!res.ok) throw new Error('Failed to fetch announcements');
  return res.json();
}

export async function sendAnnouncementEmail(input: CreateAnnouncementInput & { emails: string[] }, token: string) {
  const res = await fetch(`${API_URL}/api/announcements/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to send emails');
  return res.json();
}

export async function deleteAnnouncement(id: string, token: string) {
  const res = await fetch(`${API_URL}/api/announcements/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to delete announcement');
  return res.json();
}


