import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteService } from '../services/cliente.service';

export function useClientes(search) {
  return useQuery({
    queryKey: ['clientes', search],
    queryFn: () => clienteService.listar(search),
  });
}

export function useCliente(id) {
  return useQuery({
    queryKey: ['cliente', id],
    queryFn: () => clienteService.obtener(id),
    enabled: !!id,
  });
}

export function useCrearCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clienteService.crear,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
}

export function useActualizarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => clienteService.actualizar(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
}

export function useEliminarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clienteService.eliminar,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
}
