import { api } from '../api';

export interface Viaje {
  id: string;
  userId: string;
  titulo: string;
  destino: string | null;
  fechaInicio: string;
  fechaFin: string;
  descripcion: string | null;
  clima: any | null;
  createdAt: string;
  updatedAt: string;
  prendas: ViajePrenda[];
  articulos: ArticuloManual[];
}

export interface ViajePrenda {
  id: string;
  viajeId: string;
  prendaId: number;
  empacado: boolean;
  orden: number;
  prenda: {
    id: number;
    imageUrl: string;
    type: string | null;
    color: string | null;
  };
}

export interface ArticuloManual {
  id: string;
  viajeId: string;
  nombre: string;
  empacado: boolean;
  orden: number;
}

export interface CreateViajeData {
  userId: string;
  titulo: string;
  destino?: string;
  fechaInicio: string;
  fechaFin: string;
  descripcion?: string;
  clima?: any;
  prendaIds?: number[];
}

export interface ClimaInfo {
  ciudad: string;
  pais: string;
  temperatura: number;
  sensacionTermica: number;
  temperaturaMin: number;
  temperaturaMax: number;
  humedad: number;
  descripcion: string;
  icono: string;
  sugerencias: {
    tags: string[];
    descripcion: string;
    consejos: string[];
  };
}

export interface ProgresoEmpacado {
  totalPrendas: number;
  prendasEmpacadas: number;
  totalArticulos: number;
  articulosEmpacados: number;
  totalItems: number;
  totalEmpacados: number;
  porcentaje: number;
}

export async function getUserViajes(userId: string): Promise<Viaje[]> {
  const response = await api.get(`/api/viajes/user/${userId}`);
  return response.data.viajes || [];
}

export async function getViaje(id: string): Promise<Viaje> {
  const response = await api.get(`/api/viajes/${id}`);
  return response.data.viaje;
}

export async function createViaje(data: CreateViajeData): Promise<Viaje> {
  const response = await api.post('/api/viajes', data);
  return response.data.viaje;
}

export async function updateViaje(id: string, data: Partial<CreateViajeData>): Promise<Viaje> {
  const response = await api.put(`/api/viajes/${id}`, data);
  return response.data.viaje;
}

export async function deleteViaje(id: string): Promise<void> {
  await api.delete(`/api/viajes/${id}`);
}

export async function agregarPrendasAViaje(viajeId: string, prendaIds: number[]): Promise<Viaje> {
  const response = await api.post(`/api/viajes/${viajeId}/prendas`, { prendaIds });
  return response.data.viaje;
}

export async function togglePrendaEmpacada(viajeId: string, prendaId: number, empacado: boolean): Promise<ViajePrenda> {
  const response = await api.patch(`/api/viajes/${viajeId}/prendas/${prendaId}/empacado`, { empacado });
  return response.data.viajePrenda;
}

export async function eliminarPrendaDeViaje(viajeId: string, prendaId: number): Promise<void> {
  await api.delete(`/api/viajes/${viajeId}/prendas/${prendaId}`);
}

export async function agregarArticulo(viajeId: string, nombre: string): Promise<ArticuloManual> {
  const response = await api.post(`/api/viajes/${viajeId}/articulos`, { nombre });
  return response.data.articulo;
}

export async function toggleArticuloEmpacado(viajeId: string, articuloId: string, empacado: boolean): Promise<ArticuloManual> {
  const response = await api.patch(`/api/viajes/${viajeId}/articulos/${articuloId}/empacado`, { empacado });
  return response.data.articulo;
}

export async function eliminarArticulo(viajeId: string, articuloId: string): Promise<void> {
  await api.delete(`/api/viajes/${viajeId}/articulos/${articuloId}`);
}

export async function getProgreso(viajeId: string): Promise<ProgresoEmpacado> {
  const response = await api.get(`/api/viajes/${viajeId}/progreso`);
  return response.data.progreso;
}

export async function getClima(ciudad: string): Promise<ClimaInfo> {
  const response = await api.get(`/api/clima/${encodeURIComponent(ciudad)}`);
  return response.data;
}

export async function getPrendasPorClima(ciudad: string, userId: string): Promise<any> {
  const response = await api.get(`/api/clima/${encodeURIComponent(ciudad)}/prendas/${userId}`);
  return response.data;
}