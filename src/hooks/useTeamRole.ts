import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export type UserRole = 'COACH' | 'PLAYER' | 'FAN';

interface RoleState {
  currentRole: UserRole;
  availableRoles: UserRole[];
  linkedPlayerId: string | null;
  loading: boolean;
  switchRole: (role: UserRole) => void;
}

export function useTeamRole(activeTeamId: string | null, userId: string | null): RoleState {
  const [currentRole, setCurrentRole] = useState<UserRole>('FAN');
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>(['FAN']);
  const [linkedPlayerId, setLinkedPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeTeamId || !userId) {
      setLoading(false);
      return;
    }

    async function evaluateRoles() {
      setLoading(true);
      const roles: UserRole[] = ['FAN'];

      // 1. Check if user is Coach/Admin for this team
      const { data: staffData } = await supabase
        .from('team_staff')
        .select('id, role')
        .eq('team_id', activeTeamId)
        .eq('user_id', userId)
        .maybeSingle();

      if (staffData) {
        roles.push('COACH');
      }

      // 2. Check if user has a child in this team
      const { data: parentLink } = await supabase
        .from('parent_players')
        .select('player_id, players!inner(team_id)')
        .eq('parent_id', userId)
        .eq('players.team_id', activeTeamId)
        .maybeSingle();

      if (parentLink) {
        roles.push('PLAYER');
        setLinkedPlayerId(parentLink.player_id);
      } else {
        setLinkedPlayerId(null);
      }

      setAvailableRoles(roles);

      // Default to highest entitlement (COACH -> PLAYER -> FAN)
      if (roles.includes('COACH')) {
        setCurrentRole('COACH');
      } else if (roles.includes('PLAYER')) {
        setCurrentRole('PLAYER');
      } else {
        setCurrentRole('FAN');
      }

      setLoading(false);
    }

    evaluateRoles();
  }, [activeTeamId, userId]);

  const switchRole = (role: UserRole) => {
    if (availableRoles.includes(role)) {
      setCurrentRole(role);
    }
  };

  return { currentRole, availableRoles, linkedPlayerId, loading, switchRole };
}