import { api, API_URL } from '../api';

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  outfitId?: string | null;
  outfit?: {
    id: string;
    name?: string | null;
    items: Array<{
      prenda: {
        id: number;
        imageUrl: string;
        type?: string | null;
        color?: string | null;
      }
    }>
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  userId: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  outfitId?: string;
}

export async function getUserEvents(userId: string, month?: number, year?: number): Promise<CalendarEvent[]> {
  let url = `/api/calendar/user/${userId}`;
  if (month !== undefined && year !== undefined) {
    url += `?month=${month}&year=${year}`;
  }
  
  const response = await api.get(url);
  return response.data.events || [];
}

export async function getEventsByDate(userId: string, date: string): Promise<CalendarEvent[]> {
  const response = await api.get(`/api/calendar/date/${userId}?date=${date}`);
  return response.data.events || [];
}

export async function createEvent(data: CreateEventData): Promise<CalendarEvent> {
  const response = await api.post('/api/calendar', data);
  return response.data.event;
}

export async function updateEvent(id: string, data: Partial<CreateEventData>): Promise<CalendarEvent> {
  const response = await api.put(`/api/calendar/${id}`, data);
  return response.data.event;
}

export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/api/calendar/${id}`);
}