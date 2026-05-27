import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicioService } from '../services/servicio.service';

export function useServicios() {
  return useQuery({
    queryKey: ['servicios'],
    queryFn: servicioService.listar,
  });
}

export function useCrearServicio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: servicioService.crear,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['servicios'] }),
  });
}

export function useActualizarServicio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => servicioService.actualizar(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['servicios'] }),
  });
}

export function useDesactivarServicio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: servicioService.desactivar,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['servicios'] }),
  });
}
