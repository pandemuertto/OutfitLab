// import { api, API_URL } from '../api';

// export interface CalendarEvent {
//   id: string;
//   userId: string;
//   title: string;
//   description?: string | null;
//   date: string;
//   startTime?: string | null;
//   endTime?: string | null;
//   outfitId?: string | null;
//   outfit?: {
//     id: string;
//     name?: string | null;
//     items: Array<{
//       prenda: {
//         id: number;
//         imageUrl: string;
//         type?: string | null;
//         color?: string | null;
//       }
//     }>
//   } | null;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface CreateEventData {
//   userId: string;
//   title: string;
//   description?: string;
//   date: string;
//   startTime?: string;
//   endTime?: string;
//   outfitId?: string;
// }

// export async function getUserEvents(userId: string, month?: number, year?: number): Promise<CalendarEvent[]> {
//   let url = `/api/calendar/user/${userId}`;
//   if (month !== undefined && year !== undefined) {
//     url += `?month=${month}&year=${year}`;
//   }
  
//   const response = await api.get(url);
//   return response.data.events || [];
// }

// export async function getEventsByDate(userId: string, date: string): Promise<CalendarEvent[]> {
//   const response = await api.get(`/api/calendar/date/${userId}?date=${date}`);
//   return response.data.events || [];
// }

// export async function createEvent(data: CreateEventData): Promise<CalendarEvent> {
//   const response = await api.post('/api/calendar', data);
//   return response.data.event;
// }

// export async function updateEvent(id: string, data: Partial<CreateEventData>): Promise<CalendarEvent> {
//   const response = await api.put(`/api/calendar/${id}`, data);
//   return response.data.event;
// }

// export async function deleteEvent(id: string): Promise<void> {
//   await api.delete(`/api/calendar/${id}`);
// }

// frontend/src/services/calendar.service.ts

import { api } from "../api";
import { normalizeImageUrl } from "../utils/imageUrl";

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string | null;

  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;

  destination?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isTrip?: boolean;

  outfitId?: string | null;
  outfit?: {
    id: string;
    name?: string | null;
    imageUrl?: string | null;
    image_url?: string | null;
    items: Array<{
      prenda: {
        id: number;
        imageUrl: string | null;
        image_url?: string | null;
        type?: string | null;
        color?: string | null;
      };
    }>;
  } | null;

  selectedClothes?: string[];

  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  userId: string;
  title: string;
  description?: string;

  date?: string;
  startTime?: string;
  endTime?: string;

  destination?: string;
  startDate?: string;
  endDate?: string;
  isTrip?: boolean;

  outfitId?: string;

  selectedClothes?: string[];
}

function normalizeCalendarEvent(event: any): CalendarEvent {
  const outfit = event?.outfit
    ? {
        ...event.outfit,
        imageUrl: normalizeImageUrl(event.outfit.imageUrl || event.outfit.image_url),
        image_url: normalizeImageUrl(event.outfit.imageUrl || event.outfit.image_url),
        items: Array.isArray(event.outfit.items)
          ? event.outfit.items.map((item: any) => ({
              ...item,
              prenda: {
                ...item.prenda,
                imageUrl: normalizeImageUrl(
                  item?.prenda?.imageUrl || item?.prenda?.image_url
                ),
                image_url: normalizeImageUrl(
                  item?.prenda?.imageUrl || item?.prenda?.image_url
                ),
              },
            }))
          : [],
      }
    : null;

  return {
    ...event,
    outfit,
    selectedClothes: event?.selectedClothes || event?.selected_clothes || [],
  };
}

export async function getUserEvents(
  userId: string,
  month?: number,
  year?: number
): Promise<CalendarEvent[]> {
  let url = `/api/calendar/user/${userId}`;

  if (month !== undefined && year !== undefined) {
    url += `?month=${month}&year=${year}`;
  }

  const response = await api.get(url);
  const events = response.data.events || [];

  return Array.isArray(events) ? events.map(normalizeCalendarEvent) : [];
}

export async function getEventsByDate(
  userId: string,
  date: string
): Promise<CalendarEvent[]> {
  const response = await api.get(`/api/calendar/date/${userId}?date=${date}`);
  const events = response.data.events || [];

  return Array.isArray(events) ? events.map(normalizeCalendarEvent) : [];
}

export async function createEvent(
  data: CreateEventData
): Promise<CalendarEvent> {
  const response = await api.post("/api/calendar", data);
  return normalizeCalendarEvent(response.data.event);
}

export async function updateEvent(
  id: string,
  data: Partial<CreateEventData>
): Promise<CalendarEvent> {
  const response = await api.put(`/api/calendar/${id}`, data);
  return normalizeCalendarEvent(response.data.event);
}

export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/api/calendar/${id}`);
}