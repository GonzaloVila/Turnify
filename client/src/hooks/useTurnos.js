import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { turnoService } from '../services/turno.service';

export function useTurnos(params) {
  return useQuery({
    queryKey: ['turnos', params],
    queryFn: () => turnoService.listar(params),
  });
}

export function useTurno(id) {
  return useQuery({
    queryKey: ['turno', id],
    queryFn: () => turnoService.obtener(id),
    enabled: !!id,
  });
}

export function useCrearTurno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: turnoService.crear,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['turnos'] }),
  });
}

export function useCambiarEstado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }) => turnoService.cambiarEstado(id, estado),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['turnos'] }),
  });
}

export function useEliminarTurno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: turnoService.eliminar,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['turnos'] }),
  });
}

export function useDisponibilidad(params) {
  return useQuery({
    queryKey: ['disponibilidad', params],
    queryFn: () => turnoService.disponibilidad(params),
    enabled: !!(params?.profesional_id && params?.servicio_id && params?.fecha),
  });
}
