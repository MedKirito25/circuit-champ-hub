import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface AdminRoleState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

export function useAdminRole(): AdminRoleState {
  const [state, setState] = useState<AdminRoleState>({
    user: null,
    isAdmin: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setState({ user: null, isAdmin: false, loading: false, error: sessionError.message });
          return;
        }

        if (!session) {
          setState({ user: null, isAdmin: false, loading: false, error: null });
          return;
        }

        // Check if user has admin role using the has_role function
        const { data: hasAdminRole, error: roleError } = await supabase
          .rpc('has_role', { _user_id: session.user.id, _role: 'admin' });

        if (roleError) {
          setState({ user: session.user, isAdmin: false, loading: false, error: roleError.message });
          return;
        }

        setState({ 
          user: session.user, 
          isAdmin: hasAdminRole === true, 
          loading: false, 
          error: null 
        });
      } catch (err: any) {
        setState({ user: null, isAdmin: false, loading: false, error: err.message });
      }
    };

    checkAdminRole();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setState({ user: null, isAdmin: false, loading: false, error: null });
      } else {
        // Re-check admin role when auth state changes
        const { data: hasAdminRole } = await supabase
          .rpc('has_role', { _user_id: session.user.id, _role: 'admin' });
        
        setState({ 
          user: session.user, 
          isAdmin: hasAdminRole === true, 
          loading: false, 
          error: null 
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}
