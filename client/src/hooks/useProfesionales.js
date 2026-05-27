import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profesionalService } from '../services/profesional.service';

export function useProfesionales() {
  return useQuery({
    queryKey: ['profesionales'],
    queryFn: profesionalService.listar,
  });
}

export function useProfesional(id) {
  return useQuery({
    queryKey: ['profesional', id],
    queryFn: () => profesionalService.obtener(id),
    enabled: !!id,
  });
}

export function useCrearProfesional() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: profesionalService.crear,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profesionales'] }),
  });
}

export function useActualizarProfesional() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => profesionalService.actualizar(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profesionales'] }),
  });
}

export function useDesactivarProfesional() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: profesionalService.desactivar,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profesionales'] }),
  });
}
