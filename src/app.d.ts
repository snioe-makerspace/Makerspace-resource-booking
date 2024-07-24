// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { Database } from '$lib/generated/supabase/types';
import type {
  SupabaseClient,
  Session as SupabaseSession,
  UserAppMetadata
} from '@supabase/supabase-js';

import '@supabase/supabase-js';

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      supabase: SupabaseClient;
      session: SupabaseSession | null;
      getSession(): Promise<SupabaseSession | null>;
      safeGetSession(): Promise<{ session: Session | null; user: User | null }>;
    }
    interface PageData {
      supabase: SupabaseClient;
      session: SupabaseSession | null;
      user: User | null;
    }
    // interface PageState {}
    // interface Platform {}
  }

  // Doc: Types for view transitions: https://svelte.dev/blog/view-transitions
  interface ViewTransition {
    updateCallbackDone: Promise<void>;
    ready: Promise<void>;
    finished: Promise<void>;
    skipTransition: () => void;
  }

  interface Document {
    startViewTransition(updateCallback: () => Promise<void>): ViewTransition;
  }

  namespace svelteHTML {
    interface HTMLAttributes<T> {
      'on:outclick'?: () => boolean;
    }
  }
}

export {};
