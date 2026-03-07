import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Genera un código de invitación aleatorio de 8 caracteres alfanuméricos.
 */
function generateInviteCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

/**
 * useSharedSpace – gestiona un espacio compartido de presupuesto entre usuarios.
 *
 * Funcionalidades:
 *  - Crear un espacio compartido (genera un código de invitación).
 *  - Unirse a un espacio existente mediante código.
 *  - Ver transacciones compartidas en tiempo real (Supabase Realtime).
 *  - Agregar transacciones visibles para todos los miembros del espacio.
 */
export const useSharedSpace = () => {
  const { user } = useAuth();
  const [space, setSpace] = useState(null);          // Espacio actual del usuario
  const [members, setMembers] = useState([]);         // Lista de miembros
  const [sharedTransactions, setSharedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const channelRef = useRef(null);

  // ── Carga el espacio del usuario ──────────────────────────────────────────
  const fetchSpace = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    try {
      // Buscar en shared_space_members si el usuario ya pertenece a un espacio
      const { data: membership, error: memErr } = await supabase
        .from('shared_space_members')
        .select('space_id, role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (memErr) throw memErr;
      if (!membership) { setSpace(null); setLoading(false); return; }

      // Obtener datos del espacio
      const { data: spaceData, error: spaceErr } = await supabase
        .from('shared_spaces')
        .select('*')
        .eq('id', membership.space_id)
        .single();

      if (spaceErr) throw spaceErr;
      setSpace({ ...spaceData, role: membership.role });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── Carga miembros del espacio ────────────────────────────────────────────
  const fetchMembers = useCallback(async (spaceId) => {
    if (!spaceId) return;
    try {
      const { data, error: err } = await supabase
        .from('shared_space_members')
        .select('user_id, role, joined_at, user_profiles(email, full_name)')
        .eq('space_id', spaceId);

      if (err) throw err;
      setMembers(data ?? []);
    } catch (err) {
      console.error('fetchMembers:', err.message);
    }
  }, []);

  // ── Carga transacciones compartidas ──────────────────────────────────────
  const fetchSharedTransactions = useCallback(async (spaceId) => {
    if (!spaceId) return;
    try {
      const { data, error: err } = await supabase
        .from('shared_transactions')
        .select('*')
        .eq('space_id', spaceId)
        .order('date', { ascending: false })
        .limit(100);

      if (err) throw err;
      setSharedTransactions(data ?? []);
    } catch (err) {
      console.error('fetchSharedTransactions:', err.message);
    }
  }, []);

  // ── Suscripción Realtime ──────────────────────────────────────────────────
  const subscribeRealtime = useCallback((spaceId) => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    channelRef.current = supabase
      .channel(`shared-space-${spaceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shared_transactions', filter: `space_id=eq.${spaceId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSharedTransactions(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setSharedTransactions(prev => prev.filter(t => t.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setSharedTransactions(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
          }
        }
      )
      .subscribe();
  }, []);

  // Al montar o cuando cambia el usuario, carga el espacio
  useEffect(() => {
    fetchSpace();
  }, [fetchSpace]);

  // Cuando el espacio está disponible, carga miembros + transacciones + suscripción RT
  useEffect(() => {
    if (!space) return;
    fetchMembers(space.id);
    fetchSharedTransactions(space.id);
    subscribeRealtime(space.id);

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [space, fetchMembers, fetchSharedTransactions, subscribeRealtime]);

  // ── Acciones ──────────────────────────────────────────────────────────────

  /** Crea un nuevo espacio compartido */
  const createSpace = useCallback(async (name) => {
    if (!user) return { error: 'Debes iniciar sesión primero' };
    setActionLoading(true);
    setError(null);

    try {
      const inviteCode = generateInviteCode();

      // Insertar el espacio
      const { data: newSpace, error: spaceErr } = await supabase
        .from('shared_spaces')
        .insert({ name: name.trim(), invite_code: inviteCode, owner_id: user.id })
        .select()
        .single();

      if (spaceErr) throw spaceErr;

      // Agregar al creador como owner
      const { error: memErr } = await supabase
        .from('shared_space_members')
        .insert({ space_id: newSpace.id, user_id: user.id, role: 'owner' });

      if (memErr) throw memErr;

      setSpace({ ...newSpace, role: 'owner' });
      return { space: newSpace };
    } catch (err) {
      setError(err.message);
      return { error: err.message };
    } finally {
      setActionLoading(false);
    }
  }, [user]);

  /** Se une a un espacio existente usando el código de invitación */
  const joinSpace = useCallback(async (inviteCode) => {
    if (!user) return { error: 'Debes iniciar sesión primero' };
    setActionLoading(true);
    setError(null);

    try {
      // Buscar el espacio por código
      const { data: targetSpace, error: findErr } = await supabase
        .from('shared_spaces')
        .select('*')
        .eq('invite_code', inviteCode.trim().toUpperCase())
        .single();

      if (findErr || !targetSpace) throw new Error('Código de invitación inválido');

      // Verificar que no sea ya miembro
      const { data: existing } = await supabase
        .from('shared_space_members')
        .select('space_id')
        .eq('space_id', targetSpace.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) throw new Error('Ya eres miembro de este espacio');

      // Unirse
      const { error: joinErr } = await supabase
        .from('shared_space_members')
        .insert({ space_id: targetSpace.id, user_id: user.id, role: 'member' });

      if (joinErr) throw joinErr;

      setSpace({ ...targetSpace, role: 'member' });
      return { space: targetSpace };
    } catch (err) {
      setError(err.message);
      return { error: err.message };
    } finally {
      setActionLoading(false);
    }
  }, [user]);

  /** Abandona el espacio actual */
  const leaveSpace = useCallback(async () => {
    if (!user || !space) return;
    setActionLoading(true);

    try {
      if (space.role === 'owner') {
        // Si es el dueño, elimina el espacio completo (en cascada)
        await supabase.from('shared_spaces').delete().eq('id', space.id);
      } else {
        await supabase
          .from('shared_space_members')
          .delete()
          .eq('space_id', space.id)
          .eq('user_id', user.id);
      }

      if (channelRef.current) supabase.removeChannel(channelRef.current);
      setSpace(null);
      setMembers([]);
      setSharedTransactions([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }, [user, space]);

  /** Agrega una transacción al espacio compartido */
  const addSharedTransaction = useCallback(async ({ description, amount, category, type, date }) => {
    if (!user || !space) return { error: 'No estás en un espacio compartido' };

    const { error: err } = await supabase
      .from('shared_transactions')
      .insert({
        space_id: space.id,
        user_id: user.id,
        description,
        amount: parseFloat(amount),
        category: category || 'other',
        type,
        date: date || new Date().toISOString().split('T')[0],
      });

    if (err) return { error: err.message };
    return { success: true };
  }, [user, space]);

  /** Elimina una transacción del espacio compartido */
  const removeSharedTransaction = useCallback(async (txId) => {
    if (!user || !space) return;
    await supabase.from('shared_transactions').delete().eq('id', txId).eq('user_id', user.id);
  }, [user, space]);

  return {
    space,
    members,
    sharedTransactions,
    loading,
    actionLoading,
    error,
    createSpace,
    joinSpace,
    leaveSpace,
    addSharedTransaction,
    removeSharedTransaction,
    refetch: fetchSpace,
  };
};
