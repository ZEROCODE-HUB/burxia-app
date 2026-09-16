// Generado desde Supabase (no editar a mano el bloque Database)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_alias_history: {
        Row: {
          account_id: string
          changed_at: string | null
          changed_by_device_id: string | null
          id: string
          new_alias: string
          old_alias: string
        }
        Insert: {
          account_id: string
          changed_at?: string | null
          changed_by_device_id?: string | null
          id?: string
          new_alias: string
          old_alias: string
        }
        Update: {
          account_id?: string
          changed_at?: string | null
          changed_by_device_id?: string | null
          id?: string
          new_alias?: string
          old_alias?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_alias_history_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account_balance_reconciliation"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "account_alias_history_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account_movements"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "account_alias_history_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_alias_history_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "account_alias_history_changed_by_device_id_fkey"
            columns: ["changed_by_device_id"]
            isOneToOne: false
            referencedRelation: "user_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      account_balance_snapshots: {
        Row: {
          account_id: string
          balance: number
          created_at: string
          id: string
          snapshot_date: string
          transaction_count: number
        }
        Insert: {
          account_id: string
          balance: number
          created_at?: string
          id?: string
          snapshot_date: string
          transaction_count?: number
        }
        Update: {
          account_id?: string
          balance?: number
          created_at?: string
          id?: string
          snapshot_date?: string
          transaction_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "account_balance_snapshots_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account_balance_reconciliation"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "account_balance_snapshots_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account_movements"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "account_balance_snapshots_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_balance_snapshots_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["account_id"]
          },
        ]
      }
      account_limits: {
        Row: {
          account_id: string
          current_period_end: string | null
          current_period_start: string | null
          daily_limit: number | null
          daily_spent: number | null
          id: string
          monthly_available: number | null
          monthly_limit: number | null
          monthly_spent: number | null
          per_transaction_limit: number | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          current_period_end?: string | null
          current_period_start?: string | null
          daily_limit?: number | null
          daily_spent?: number | null
          id?: string
          monthly_available?: number | null
          monthly_limit?: number | null
          monthly_spent?: number | null
          per_transaction_limit?: number | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          current_period_end?: string | null
          current_period_start?: string | null
          daily_limit?: number | null
          daily_spent?: number | null
          id?: string
          monthly_available?: number | null
          monthly_limit?: number | null
          monthly_spent?: number | null
          per_transaction_limit?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_limits_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "account_balance_reconciliation"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "account_limits_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "account_movements"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "account_limits_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_limits_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "backoffice_clients"
            referencedColumns: ["account_id"]
          },
        ]
      }
      account_types: {
        Row: {
          allows_overdraft: boolean | null
          code: string
          created_at: string | null
          currency: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          overdraft_limit: number | null
        }
        Insert: {
          allows_overdraft?: boolean | null
          code: string
          created_at?: string | null
          currency: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          overdraft_limit?: number | null
        }
        Update: {
          allows_overdraft?: boolean | null
          code?: string
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          overdraft_limit?: number | null
        }
        Relationships: []
      }
      accounts: {
        Row: {
          account_type_id: string
          alias: string
          balance: number | null
          closed_at: string | null
          created_at: string | null
          account_number: string
          id: string
          is_primary: boolean | null
          status: string | null
          status_reason: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_type_id: string
          alias: string
          balance?: number | null
          closed_at?: string | null
          created_at?: string | null
          account_number: string
          id?: string
          is_primary?: boolean | null
          status?: string | null
          status_reason?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_type_id?: string
          alias?: string
          balance?: number | null
          closed_at?: string | null
          created_at?: string | null
          account_number?: string
          id?: string
          is_primary?: boolean | null
          status?: string | null
          status_reason?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_account_type_id_fkey"
            columns: ["account_type_id"]
            isOneToOne: false
            referencedRelation: "account_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["from_user_id"]
          },
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["to_user_id"]
          },
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      api_access: {
        Row: {
          allowed_ips: string[] | null
          api_password_hash: string | null
          client_id: string
          created_at: string | null
          enabled_at: string | null
          id: string
          is_enabled: boolean | null
          last_used_at: string | null
          rate_limit_per_minute: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allowed_ips?: string[] | null
          api_password_hash?: string | null
          client_id: string
          created_at?: string | null
          enabled_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_used_at?: string | null
          rate_limit_per_minute?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allowed_ips?: string[] | null
          api_password_hash?: string | null
          client_id?: string
          created_at?: string | null
          enabled_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_used_at?: string | null
          rate_limit_per_minute?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "backoffice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["from_user_id"]
          },
          {
            foreignKeyName: "api_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["to_user_id"]
          },
          {
            foreignKeyName: "api_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      api_credential_history: {
        Row: {
          api_access_id: string
          change_type: string
          changed_from_device_id: string | null
          changed_from_ip: unknown
          created_at: string | null
          id: string
          new_value: string | null
          old_value: string | null
          user_id: string
        }
        Insert: {
          api_access_id: string
          change_type: string
          changed_from_device_id?: string | null
          changed_from_ip?: unknown
          created_at?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id: string
        }
        Update: {
          api_access_id?: string
          change_type?: string
          changed_from_device_id?: string | null
          changed_from_ip?: unknown
          created_at?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_credential_history_api_access_id_fkey"
            columns: ["api_access_id"]
            isOneToOne: false
            referencedRelation: "api_access"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_credential_history_changed_from_device_id_fkey"
            columns: ["changed_from_device_id"]
            isOneToOne: false
            referencedRelation: "user_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_credential_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_credential_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["from_user_id"]
          },
          {
            foreignKeyName: "api_credential_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["to_user_id"]
          },
          {
            foreignKeyName: "api_credential_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      api_request_logs: {
        Row: {
          api_access_id: string
          created_at: string | null
          endpoint: string
          id: string
          ip_address: unknown
          method: string
          response_time_ms: number | null
          status_code: number | null
          user_agent: string | null
        }
        Insert: {
          api_access_id: string
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address: unknown
          method: string
          response_time_ms?: number | null
          status_code?: number | null
          user_agent?: string | null
        }
        Update: {
          api_access_id?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: unknown
          method?: string
          response_time_ms?: number | null
          status_code?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_request_logs_api_access_id_fkey"
            columns: ["api_access_id"]
            isOneToOne: false
            referencedRelation: "api_access"
            referencedColumns: ["id"]
          },
        ]
      }
      app_config: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      app_versions: {
        Row: {
          build_number: number | null
          created_at: string
          id: number
          mandatory: boolean | null
          platform: string
          store_url: string | null
          version: string
        }
        Insert: {
          build_number?: number | null
          created_at?: string
          id?: number
          mandatory?: boolean | null
          platform: string
          store_url?: string | null
          version: string
        }
        Update: {
          build_number?: number | null
          created_at?: string
          id?: number
          mandatory?: boolean | null
          platform?: string
          store_url?: string | null
          version?: string
        }
        Relationships: []
      }
      backoffice_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          id: string
          ip_address: unknown
          resource_code: string | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          ip_address?: unknown
          resource_code?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          ip_address?: unknown
          resource_code?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "backoffice_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backoffice_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["from_user_id"]
          },
          {
            foreignKeyName: "backoffice_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["to_user_id"]
          },
          {
            foreignKeyName: "backoffice_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backoffice_audit_log_resource_code_fkey"
            columns: ["resource_code"]
            isOneToOne: false
            referencedRelation: "backoffice_resources"
            referencedColumns: ["code"]
          },
        ]
      }
      backoffice_resources: {
        Row: {
          code: string
          description: string | null
          name: string
          sort_order: number
        }
        Insert: {
          code: string
          description?: string | null
          name: string
          sort_order?: number
        }
        Update: {
          code?: string
          description?: string | null
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      backoffice_role_permissions: {
        Row: {
          can_create: boolean
          can_delete: boolean
          can_read: boolean
          can_update: boolean
          resource_code: string
          role_id: string
        }
        Insert: {
          can_create?: boolean
          can_delete?: boolean
          can_read?: boolean
          can_update?: boolean
          resource_code: string
          role_id: string
        }
        Update: {
          can_create?: boolean
          can_delete?: boolean
          can_read?: boolean
          can_update?: boolean
          resource_code?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "backoffice_role_permissions_resource_code_fkey"
            columns: ["resource_code"]
            isOneToOne: false
            referencedRelation: "backoffice_resources"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "backoffice_role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "backoffice_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      backoffice_roles: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      backoffice_user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "backoffice_user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backoffice_user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["from_user_id"]
          },
          {
            foreignKeyName: "backoffice_user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["to_user_id"]
          },
          {
            foreignKeyName: "backoffice_user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backoffice_user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "backoffice_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backoffice_user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backoffice_user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["from_user_id"]
          },
          {
            foreignKeyName: "backoffice_user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["to_user_id"]
          },
          {
            foreignKeyName: "backoffice_user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      balance_corrections: {
        Row: {
          account_id: string
          corrected_at: string
          corrected_by: string | null
          correction_reason: string
          difference: number
          id: string
          metadata: Json | null
          new_balance: number
          old_balance: number
        }
        Insert: {
          account_id: string
          corrected_at?: string
          corrected_by?: string | null
          correction_reason: string
          difference: number
          id?: string
          metadata?: Json | null
          new_balance: number
          old_balance: number
        }
        Update: {
          account_id?: string
          corrected_at?: string
          corrected_by?: string | null
          correction_reason?: string
          difference?: number
          id?: string
          metadata?: Json | null
          new_balance?: number
          old_balance?: number
        }
        Relationships: [
          {
            foreignKeyName: "balance_corrections_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account_balance_reconciliation"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "balance_corrections_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account_movements"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "balance_corrections_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "balance_corrections_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["account_id"]
          },
        ]
      }
      compliance_list_checks: {
        Row: {
          checked_at: string
          checked_by: string | null
          detail: string
          id: string
          list_code: string
          result: string
          user_id: string
        }
        Insert: {
          checked_at?: string
          checked_by?: string | null
          detail?: string
          id?: string
          list_code: string
          result?: string
          user_id: string
        }
        Update: {
          checked_at?: string
          checked_by?: string | null
          detail?: string
          id?: string
          list_code?: string
          result?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_list_checks_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_list_checks_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["from_user_id"]
          },
          {
            foreignKeyName: "compliance_list_checks_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["to_user_id"]
          },
          {
            foreignKeyName: "compliance_list_checks_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_list_checks_list_code_fkey"
            columns: ["list_code"]
            isOneToOne: false
            referencedRelation: "compliance_lists"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "compliance_list_checks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_list_checks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["from_user_id"]
          },
          {
            foreignKeyName: "compliance_list_checks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["to_user_id"]
          },
          {
            foreignKeyName: "compliance_list_checks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_lists: {
        Row: {
          code: string
          description: string | null
          name: string
          sort_order: number
        }
        Insert: {
          code: string
          description?: string | null
          name: string
          sort_order?: number
        }
        Update: {
          code?: string
          description?: string | null
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      compliance_reviews: {
        Row: {
          notes: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          notes?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          notes?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_reviews_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_reviews_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["from_user_id"]
          },
          {
            foreignKeyName: "compliance_reviews_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["to_user_id"]
          },
          {
            foreignKeyName: "compliance_reviews_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "backoffice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["from_user_id"]
          },
          {
            foreignKeyName: "compliance_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["to_user_id"]
          },
          {
            foreignKeyName: "compliance_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_otps: {
        Row: {
          attempts: number | null
          code_hash: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          purpose: string
          used: boolean | null
          user_id: string | null
        }
        Insert: {
          attempts?: number | null
          code_hash: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          purpose?: string
          used?: boolean | null
          user_id?: string | null
        }
        Update: {
          attempts?: number | null
          code_hash?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          purpose?: string
          used?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_otps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_otps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["from_user_id"]
          },
          {
            foreignKeyName: "email_otps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["to_user_id"]
          },
          {
            foreignKeyName: "email_otps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_verifications: {
        Row: {
          created_at: string
          document_url: string | null
          external_id: string | null
          id: string
          payload: Json | null
          provider: string
          score: number | null
          status: string
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          document_url?: string | null
          external_id?: string | null
          id?: string
          payload?: Json | null
          provider: string
          score?: number | null
          status?: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          document_url?: string | null
          external_id?: string | null
          id?: string
          payload?: Json | null
          provider?: string
          score?: number | null
          status?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["from_user_id"]
          },
          {
            foreignKeyName: "kyc_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["to_user_id"]
          },
          {
            foreignKeyName: "kyc_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          created_at: string
          email: string
          failure_reason: string | null
          id: string
          ip_address: unknown
          success: boolean
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          failure_reason?: string | null
          id?: string
          ip_address?: unknown
          success: boolean
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          failure_reason?: string | null
          id?: string
          ip_address?: unknown
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      notification_log: {
        Row: {
          category: string | null
          created_at: string | null
          data: Json | null
          delivered_at: string | null
          error_details: Json | null
          failed_at: string | null
          failure_reason: string | null
          id: string
          message: string | null
          metadata: Json | null
          notification_type: string
          onesignal_notification_id: string | null
          opened_at: string | null
          player_ids: string[] | null
          related_account_id: string | null
          related_transaction_id: string | null
          sent_at: string | null
          status: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          data?: Json | null
          delivered_at?: string | null
          error_details?: Json | null
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          notification_type: string
          onesignal_notification_id?: string | null
          opened_at?: string | null
          player_ids?: string[] | null
          related_account_id?: string | null
          related_transaction_id?: string | null
          sent_at?: string | null
          status?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          data?: Json | null
          delivered_at?: string | null
          error_details?: Json | null
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          notification_type?: string
          onesignal_notification_id?: string | null
          opened_at?: string | null
          player_ids?: string[] | null
          related_account_id?: string | null
          related_transaction_id?: string | null
          sent_at?: string | null
          status?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_related_account_id_fkey"
            columns: ["related_account_id"]
            isOneToOne: false
            referencedRelation: "account_balance_reconciliation"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "notification_log_related_account_id_fkey"
            columns: ["related_account_id"]
            isOneToOne: false
            referencedRelation: "account_movements"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "notification_log_related_account_id_fkey"
            columns: ["related_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_log_related_account_id_fkey"
            columns: ["related_account_id"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "notification_log_related_transaction_id_fkey"
            columns: ["related_transaction_id"]
            isOneToOne: false
            referencedRelation: "account_movements"
            referencedColumns: ["transaction_id"]
          },
          {
            foreignKeyName: "notification_log_related_transaction_id_fkey"
            columns: ["related_transaction_id"]
            isOneToOne: false
            referencedRelation: "admin_transaction_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_log_related_transaction_id_fkey"
            columns: ["related_transaction_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_log_related_transaction_id_fkey"
            columns: ["related_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["from_user_id"]
          },
          {
            foreignKeyName: "notification_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["to_user_id"]
          },
          {
            foreignKeyName: "notification_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          account_updates_enabled: boolean | null
          created_at: string | null
          marketing_enabled: boolean | null
          push_enabled: boolean | null
          quiet_hours_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          security_alerts_enabled: boolean | null
          transactions_received_enabled: boolean | null
          transactions_sent_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_updates_enabled?: boolean | null
          created_at?: string | null
          marketing_enabled?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          security_alerts_enabled?: boolean | null
          transactions_received_enabled?: boolean | null
          transactions_sent_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_updates_enabled?: boolean | null
          created_at?: string | null
          marketing_enabled?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          security_alerts_enabled?: boolean | null
          transactions_received_enabled?: boolean | null
          transactions_sent_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "backoffice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["from_user_id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["to_user_id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_types: {
        Row: {
          code: string
          created_at: string | null
          default_enabled: boolean | null
          description: string | null
          email_template_html: Json | null
          name: string
          priority: number | null
          template_message: Json | null
          template_title: Json | null
        }
        Insert: {
          code: string
          created_at?: string | null
          default_enabled?: boolean | null
          description?: string | null
          email_template_html?: Json | null
          name: string
          priority?: number | null
          template_message?: Json | null
          template_title?: Json | null
        }
        Update: {
          code?: string
          created_at?: string | null
          default_enabled?: boolean | null
          description?: string | null
          email_template_html?: Json | null
          name?: string
          priority?: number | null
          template_message?: Json | null
          template_title?: Json | null
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          account_id: string
          amount: number | null
          concept: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          max_uses: number | null
          qr_data: string
          qr_hash: string | null
          qr_type: string | null
          times_used: number | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          amount?: number | null
          concept?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          max_uses?: number | null
          qr_data: string
          qr_hash?: string | null
          qr_type?: string | null
          times_used?: number | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          amount?: number | null
          concept?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          max_uses?: number | null
          qr_data?: string
          qr_hash?: string | null
          qr_type?: string | null
          times_used?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account_balance_reconciliation"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "qr_codes_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account_movements"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "qr_codes_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["account_id"]
          },
        ]
      }
      support: {
        Row: {
          created_at: string
          email: string | null
          id: number
          name: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          name?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      transaction_types: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          commission_amount: number | null
          completed_at: string | null
          concept: string | null
          created_at: string | null
          currency: string | null
          external_alias: string | null
          external_account_number: string | null
          external_holder_name: string | null
          failed_at: string | null
          failure_reason: string | null
          from_account_id: string | null
          id: string
          initiated_from_device_id: string | null
          initiated_from_ip: unknown
          metadata: Json | null
          net_amount: number | null
          payment_method: string | null
          payment_reference: string | null
          processed_by: string | null
          processing_at: string | null
          reference_number: string | null
          status: string | null
          to_account_id: string | null
          transaction_type_id: string
        }
        Insert: {
          amount: number
          commission_amount?: number | null
          completed_at?: string | null
          concept?: string | null
          created_at?: string | null
          currency?: string | null
          external_alias?: string | null
          external_account_number?: string | null
          external_holder_name?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          from_account_id?: string | null
          id?: string
          initiated_from_device_id?: string | null
          initiated_from_ip?: unknown
          metadata?: Json | null
          net_amount?: number | null
          payment_method?: string | null
          payment_reference?: string | null
          processed_by?: string | null
          processing_at?: string | null
          reference_number?: string | null
          status?: string | null
          to_account_id?: string | null
          transaction_type_id: string
        }
        Update: {
          amount?: number
          commission_amount?: number | null
          completed_at?: string | null
          concept?: string | null
          created_at?: string | null
          currency?: string | null
          external_alias?: string | null
          external_account_number?: string | null
          external_holder_name?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          from_account_id?: string | null
          id?: string
          initiated_from_device_id?: string | null
          initiated_from_ip?: unknown
          metadata?: Json | null
          net_amount?: number | null
          payment_method?: string | null
          payment_reference?: string | null
          processed_by?: string | null
          processing_at?: string | null
          reference_number?: string | null
          status?: string | null
          to_account_id?: string | null
          transaction_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "account_balance_reconciliation"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "transactions_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "account_movements"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "transactions_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "transactions_initiated_from_device_id_fkey"
            columns: ["initiated_from_device_id"]
            isOneToOne: false
            referencedRelation: "user_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "account_balance_reconciliation"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "account_movements"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "transactions_transaction_type_id_fkey"
            columns: ["transaction_type_id"]
            isOneToOne: false
            referencedRelation: "transaction_types"
            referencedColumns: ["id"]
          },
        ]
      }
      user_auth_credentials: {
        Row: {
          auto_password_encrypted: string
          created_at: string | null
          encryption_key_id: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_password_encrypted: string
          created_at?: string | null
          encryption_key_id?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_password_encrypted?: string
          created_at?: string | null
          encryption_key_id?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_auth_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "backoffice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_auth_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["from_user_id"]
          },
          {
            foreignKeyName: "user_auth_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["to_user_id"]
          },
          {
            foreignKeyName: "user_auth_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_devices: {
        Row: {
          app_version: string | null
          biometric_enabled: boolean | null
          created_at: string | null
          deactivated_at: string | null
          device_id: string
          device_model: string | null
          device_name: string | null
          device_os_version: string | null
          device_type: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          last_active_at: string | null
          last_ip_address: unknown
          os_version: string | null
          platform: string | null
          player_id: string | null
          push_enabled: boolean | null
          push_token: string | null
          refresh_token: string | null
          registered_at: string | null
          revoke_reason: string | null
          revoked_at: string | null
          session_token: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          app_version?: string | null
          biometric_enabled?: boolean | null
          created_at?: string | null
          deactivated_at?: string | null
          device_id: string
          device_model?: string | null
          device_name?: string | null
          device_os_version?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_active_at?: string | null
          last_ip_address?: unknown
          os_version?: string | null
          platform?: string | null
          player_id?: string | null
          push_enabled?: boolean | null
          push_token?: string | null
          refresh_token?: string | null
          registered_at?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          session_token?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          app_version?: string | null
          biometric_enabled?: boolean | null
          created_at?: string | null
          deactivated_at?: string | null
          device_id?: string
          device_model?: string | null
          device_name?: string | null
          device_os_version?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_active_at?: string | null
          last_ip_address?: unknown
          os_version?: string | null
          platform?: string | null
          player_id?: string | null
          push_enabled?: boolean | null
          push_token?: string | null
          refresh_token?: string | null
          registered_at?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          session_token?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["from_user_id"]
          },
          {
            foreignKeyName: "user_devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["to_user_id"]
          },
          {
            foreignKeyName: "user_devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          country_code: string
          created_at: string | null
          document_number: string
          document_type: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string
          photo_url: string | null
          pin_hash: string
          role: string
          tax_id: string
          updated_at: string | null
          verification_status: string | null
          web_access_enabled: boolean | null
          web_access_enabled_at: string | null
          web_password_hash: string | null
        }
        Insert: {
          country_code?: string
          created_at?: string | null
          document_number: string
          document_type?: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string
          photo_url?: string | null
          pin_hash: string
          role?: string
          tax_id: string
          updated_at?: string | null
          verification_status?: string | null
          web_access_enabled?: boolean | null
          web_access_enabled_at?: string | null
          web_password_hash?: string | null
        }
        Update: {
          country_code?: string
          created_at?: string | null
          document_number?: string
          document_type?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          photo_url?: string | null
          pin_hash?: string
          role?: string
          tax_id?: string
          updated_at?: string | null
          verification_status?: string | null
          web_access_enabled?: boolean | null
          web_access_enabled_at?: string | null
          web_password_hash?: string | null
        }
        Relationships: []
      }
      worker_invocations: {
        Row: {
          id: boolean
          last_invoked_at: string | null
        }
        Insert: {
          id?: boolean
          last_invoked_at?: string | null
        }
        Update: {
          id?: boolean
          last_invoked_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      account_balance_reconciliation: {
        Row: {
          account_id: string | null
          alias: string | null
          balance_calculated: number | null
          balance_materialized: number | null
          account_number: string | null
          difference: number | null
          last_balance_update: string | null
          status: string | null
          total_transactions: number | null
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          alias?: string | null
          balance_calculated?: never
          balance_materialized?: number | null
          account_number?: string | null
          difference?: never
          last_balance_update?: string | null
          status?: never
          total_transactions?: never
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          alias?: string | null
          balance_calculated?: never
          balance_materialized?: number | null
          account_number?: string | null
          difference?: never
          last_balance_update?: string | null
          status?: never
          total_transactions?: never
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["from_user_id"]
          },
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["to_user_id"]
          },
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      account_movements: {
        Row: {
          account_id: string | null
          amount: number | null
          category: string | null
          completed_at: string | null
          concept: string | null
          counterpart_name: string | null
          created_at: string | null
          expense_amount: number | null
          income_amount: number | null
          movement_type: string | null
          payment_method: string | null
          payment_reference: string | null
          reference_number: string | null
          status: string | null
          transaction_id: string | null
          transaction_type_name: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["from_user_id"]
          },
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["to_user_id"]
          },
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_transaction_list: {
        Row: {
          amount: number | null
          commission_amount: number | null
          completed_at: string | null
          concept: string | null
          created_at: string | null
          currency: string | null
          external_alias: string | null
          external_account_number: string | null
          external_holder_name: string | null
          failed_at: string | null
          failure_reason: string | null
          from_account_id: string | null
          from_user_document: string | null
          from_user_email: string | null
          from_user_first_name: string | null
          from_user_last_name: string | null
          from_user_phone: string | null
          id: string | null
          initiated_from_device_id: string | null
          initiated_from_ip: unknown
          metadata: Json | null
          net_amount: number | null
          payment_method: string | null
          payment_reference: string | null
          processed_by: string | null
          processing_at: string | null
          reference_number: string | null
          status: string | null
          to_account_id: string | null
          to_user_document: string | null
          to_user_email: string | null
          to_user_first_name: string | null
          to_user_last_name: string | null
          to_user_phone: string | null
          transaction_type_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "account_balance_reconciliation"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "transactions_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "account_movements"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "transactions_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "transactions_initiated_from_device_id_fkey"
            columns: ["initiated_from_device_id"]
            isOneToOne: false
            referencedRelation: "user_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "account_balance_reconciliation"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "account_movements"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "transactions_transaction_type_id_fkey"
            columns: ["transaction_type_id"]
            isOneToOne: false
            referencedRelation: "transaction_types"
            referencedColumns: ["id"]
          },
        ]
      }
      backoffice_clients: {
        Row: {
          account_id: string | null
          account_status: string | null
          account_status_reason: string | null
          alias: string | null
          balance: number | null
          compliance_notes: string | null
          compliance_reviewed_at: string | null
          compliance_status: string | null
          country_code: string | null
          created_at: string | null
          account_number: string | null
          document_number: string | null
          document_type: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string | null
          is_operator: boolean | null
          kyc_provider: string | null
          kyc_score: number | null
          kyc_status: string | null
          kyc_verified_at: string | null
          last_name: string | null
          phone: string | null
          role: string | null
          tax_id: string | null
          verification_status: string | null
        }
        Relationships: []
      }
      backoffice_transactions: {
        Row: {
          amount: number | null
          commission_amount: number | null
          completed_at: string | null
          concept: string | null
          created_at: string | null
          currency: string | null
          failed_at: string | null
          failure_reason: string | null
          from_account_id: string | null
          from_alias: string | null
          from_account_number: string | null
          from_user_document: string | null
          from_user_email: string | null
          from_user_id: string | null
          from_user_name: string | null
          from_user_tax_id: string | null
          id: string | null
          metadata: Json | null
          net_amount: number | null
          payment_method: string | null
          payment_reference: string | null
          reference_number: string | null
          status: string | null
          to_account_id: string | null
          to_alias: string | null
          to_account_number: string | null
          to_user_document: string | null
          to_user_email: string | null
          to_user_id: string | null
          to_user_name: string | null
          to_user_tax_id: string | null
          type_category: string | null
          type_code: string | null
          type_name: string | null
        }
        Relationships: []
      }
      notification_stats_by_user: {
        Row: {
          delivered_count: number | null
          failed_count: number | null
          last_notification_sent_at: string | null
          opened_count: number | null
          security_count: number | null
          sent_count: number | null
          total_notifications: number | null
          transaction_count: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["from_user_id"]
          },
          {
            foreignKeyName: "notification_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "backoffice_transactions"
            referencedColumns: ["to_user_id"]
          },
          {
            foreignKeyName: "notification_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      alias_disponible: {
        Args: { p_alias: string }
        Returns: {
          disponible: boolean
          motivo: string
        }[]
      }
      archive_old_api_logs: { Args: never; Returns: undefined }
      backoffice_audit: {
        Args: {
          p_action: string
          p_after?: Json
          p_before?: Json
          p_resource_code: string
          p_target_id: string
          p_target_type: string
        }
        Returns: undefined
      }
      backoffice_daily_flow: {
        Args: { p_days?: number }
        Returns: {
          cantidad: number
          dia: string
          egresos: number
          ingresos: number
          internas: number
        }[]
      }
      backoffice_dashboard: {
        Args: never
        Returns: {
          clientes_en_revision: number
          clientes_pendientes: number
          clientes_total: number
          cuentas_bloqueadas: number
          cumplimiento_pendiente: number
          movimientos_hoy: number
          movimientos_pendientes: number
          saldo_total: number
          volumen_hoy: number
        }[]
      }
      backoffice_indicators: {
        Args: { p_days?: number }
        Returns: {
          altas: number
          clientes_operando: number
          comisiones: number
          operaciones: number
          operaciones_fallidas: number
          ticket_promedio: number
          volumen: number
        }[]
      }
      backoffice_set_account_status: {
        Args: { p_reason?: string; p_status: string; p_user_id: string }
        Returns: undefined
      }
      backoffice_set_compliance: {
        Args: { p_notes?: string; p_status: string; p_user_id: string }
        Returns: undefined
      }
      backoffice_set_list_check: {
        Args: {
          p_detail?: string
          p_list_code: string
          p_result: string
          p_user_id: string
        }
        Returns: undefined
      }
      backoffice_set_verification: {
        Args: { p_notes?: string; p_status: string; p_user_id: string }
        Returns: undefined
      }
      calculate_account_balance: {
        Args: { p_account_id: string }
        Returns: number
      }
      can_register: {
        Args: { p_document_number: string; p_email: string; p_tax_id: string }
        Returns: boolean
      }
      check_device_registered: {
        Args: { p_device_id: string; p_user_id: string }
        Returns: {
          device_record_id: string
          is_active: boolean
          is_registered: boolean
        }[]
      }
      check_login_blocked: {
        Args: { p_email: string }
        Returns: {
          attempts_left: number
          blocked: boolean
          retry_after_seconds: number
        }[]
      }
      check_user_exists: {
        Args: { p_cuit?: string; p_dni?: string; p_email?: string }
        Returns: Json
      }
      claim_device: {
        Args: { p_device_data: Json; p_device_id: string; p_player_id: string }
        Returns: undefined
      }
      claim_onesignal_device: {
        Args: {
          p_app_version: string
          p_device_id: string
          p_device_os_version: string
          p_platform: string
          p_player_id: string
          p_push_enabled: boolean
          p_user_id: string
        }
        Returns: undefined
      }
      cleanup_inactive_devices: { Args: never; Returns: undefined }
      create_daily_balance_snapshots: { Args: never; Returns: undefined }
      create_user_bank_account: { Args: { p_user_id: string }; Returns: Json }
      deactivate_expired_qr_codes: { Args: never; Returns: undefined }
      delete_queue_message: {
        Args: { p_msg_id: number; p_queue_name: string }
        Returns: boolean
      }
      enqueue_notification: {
        Args: {
          p_data?: Json
          p_notification_type: string
          p_related_transaction_id?: string
          p_user_id: string
        }
        Returns: undefined
      }
      es_operador_backoffice: { Args: { p_user_id: string }; Returns: boolean }
      es_pata_espejo: {
        Args: { p_metadata: Json; p_type_id: string }
        Returns: boolean
      }
      generate_static_qr: { Args: { p_account_id: string }; Returns: string }
      generate_unique_alias: { Args: never; Returns: string }
      generate_unique_account_number: { Args: never; Returns: string }
      get_account_holder_name: {
        Args: { p_account_id: string }
        Returns: string
      }
      get_account_info: {
        Args: { p_user_id?: string }
        Returns: {
          account_id: string
          alias: string
          balance: number
          created_at: string
          account_number: string
          daily_limit: number
          daily_spent: number
          is_primary: boolean
          monthly_available: number
          monthly_limit: number
          monthly_spent: number
          qr_code_data: string
          qr_code_hash: string
          status: string
          user_id: string
        }[]
      }
      get_active_push_devices: {
        Args: { p_user_id: string }
        Returns: {
          device_id: string
          device_name: string
          platform: string
          player_id: string
        }[]
      }
      get_alias_prefix: { Args: never; Returns: string }
      get_api_access: { Args: never; Returns: Json }
      get_balance_at_date: {
        Args: { p_account_id: string; p_date: string }
        Returns: number
      }
      get_balance_inconsistencies: {
        Args: never
        Returns: {
          account_id: string
          alias: string
          balance_calculated: number
          balance_materialized: number
          account_number: string
          difference: number
          status: string
          total_transactions: number
          user_id: string
        }[]
      }
      get_my_backoffice_permissions: {
        Args: never
        Returns: {
          can_create: boolean
          can_delete: boolean
          can_read: boolean
          can_update: boolean
          resource_code: string
        }[]
      }
      get_my_backoffice_profile: {
        Args: never
        Returns: {
          email: string
          full_name: string
          role_codes: string[]
          role_names: string[]
          user_id: string
        }[]
      }
      get_user_devices_list: {
        Args: { p_current_device_id: string; p_user_id: string }
        Returns: {
          app_version: string
          device_id: string
          device_model: string
          device_name: string
          device_type: string
          id: string
          is_current: boolean
          last_active_at: string
          os_version: string
          platform: string
          registered_at: string
          status: string
        }[]
      }
      get_user_id_from_account: {
        Args: { p_account_id: string }
        Returns: string
      }
      get_user_login_data: {
        Args: { email_input: string }
        Returns: {
          auto_password_encrypted: string
          email: string
          first_name: string
          id: string
          pin_hash: string
          verification_status: string
          web_access_enabled: boolean
          web_password_hash: string
        }[]
      }
      has_backoffice_permission: {
        Args: { p_action?: string; p_resource: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      monitor_balance_inconsistencies: { Args: never; Returns: undefined }
      monitor_negative_balances: { Args: never; Returns: undefined }
      otp_disponible: { Args: never; Returns: boolean }
      otp_solicitar: {
        Args: { p_proposito?: string }
        Returns: {
          enviado: boolean
          expira_en: string
          motivo: string
        }[]
      }
      otp_verificar: {
        Args: { p_codigo: string; p_proposito?: string }
        Returns: {
          motivo: string
          valido: boolean
        }[]
      }
      process_transfer: {
        Args: {
          p_amount: number
          p_concept?: string
          p_device_id?: string
          p_from_account_id: string
          p_ip_address?: unknown
          p_payment_method?: string
          p_to_identifier: string
        }
        Returns: Json
      }
      puede_ver_clientes: { Args: never; Returns: boolean }
      read_queue_messages: {
        Args: { p_qty: number; p_queue_name: string; p_vt: number }
        Returns: unknown[]
        SetofOptions: {
          from: "*"
          to: "message_record"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      reconcile_account_balance: {
        Args: { p_account_id: string }
        Returns: Json
      }
      reconcile_all_accounts: {
        Args: never
        Returns: {
          account_id: string
          difference: number
          new_balance: number
          old_balance: number
          status: string
        }[]
      }
      record_login_attempt: {
        Args: { p_email: string; p_failure_reason?: string; p_success: boolean }
        Returns: undefined
      }
      reset_daily_limits: { Args: never; Returns: undefined }
      reset_monthly_limits: { Args: never; Returns: undefined }
      revoke_all_other_devices: {
        Args: { p_current_device_id: string; p_user_id: string }
        Returns: number
      }
      revoke_user_device: {
        Args: { p_device_record_id: string; p_user_id: string }
        Returns: boolean
      }
      search_account_for_transfer: {
        Args: { p_identifier: string }
        Returns: {
          account_id: string
          alias: string
          holder_name: string
          is_external: boolean
        }[]
      }
      suspend_user_account: { Args: { p_user_id: string }; Returns: undefined }
      upsert_user_device: {
        Args: {
          p_app_version: string
          p_device_id: string
          p_device_model: string
          p_device_name: string
          p_device_type: string
          p_os_version: string
          p_platform: string
          p_user_id: string
        }
        Returns: string
      }
      validate_qr: {
        Args: { p_qr_hash: string }
        Returns: {
          account_id: string
          account_status: string
          account_number: string
          holder_name: string
          is_valid: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const


// ============================================================================
// ALIAS DE DOMINIO (nombres amigables usados por el código de la app)
// ============================================================================

export type VerificationStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "suspended";
export type AccountStatus = "active" | "blocked" | "suspended" | "closed";
export type TransactionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "reversed"
  | "cancelled";
export type PaymentMethod = "alias" | "account_number" | "qr";
export type TransactionCategory = "income" | "expense" | "internal";
export type QRType = "static" | "dynamic";
export type DeviceStatus = "active" | "inactive" | "revoked";
export type DevicePlatform = "ios" | "android" | "web";

// ============================================================================
// TABLAS
// ============================================================================

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dni?: string;
  cuit_cuil?: string;
  pin_hash?: string;
  web_access_enabled: boolean;
  web_password_hash?: string | null;
  web_access_enabled_at?: string | null;
  verification_status: VerificationStatus;
  zapsign_verification_id?: string | null;
  zapsign_verified_at?: string | null;
  zapsign_data?: Json | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  account_type_id: string;
  account_number: string;
  alias: string;
  balance: number;
  status: AccountStatus;
  status_reason: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface AccountType {
  id: string;
  code: string;
  name: string;
  currency: string;
  description: string | null;
  is_active: boolean;
  allows_overdraft: boolean;
  overdraft_limit: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  transaction_type_id: string;
  from_account_id: string | null;
  to_account_id: string | null;
  external_account_number: string | null;
  external_alias: string | null;
  external_holder_name: string | null;
  amount: number;
  currency: string;
  concept: string | null;
  payment_method: PaymentMethod;
  payment_reference: string;
  status: TransactionStatus;
  commission_amount: number;
  net_amount: number;
  processed_by: string;
  failure_reason: string | null;
  reference_number: string;
  metadata: Json | null;
  initiated_from_device_id: string | null;
  initiated_from_ip: string | null;
  created_at: string;
  processing_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
}

export interface TransactionType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: TransactionCategory;
  is_active: boolean;
  requires_destination: boolean;
  commission_rate: number;
  min_commission: number;
  max_commission: number | null;
  created_at: string;
}

export interface AccountLimit {
  id: string;
  account_id: string;
  monthly_limit: number;
  monthly_spent: number;
  monthly_available: number;
  current_period_start: string;
  current_period_end: string;
  daily_limit: number | null;
  daily_spent: number;
  per_transaction_limit: number | null;
  updated_at: string;
}

export interface QRCode {
  id: string;
  account_id: string;
  qr_data: string;
  qr_hash: string;
  qr_type: QRType;
  amount: number | null;
  concept: string | null;
  expires_at: string | null;
  max_uses: number | null;
  is_active: boolean;
  times_used: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserDevice {
  id: string;
  user_id: string;
  device_id: string;
  device_name: string | null;
  device_model: string | null;
  platform: DevicePlatform;
  os_version: string | null;
  app_version: string | null;
  push_token: string | null;
  status: DeviceStatus;
  is_primary: boolean;
  biometric_enabled: boolean;
  last_active_at: string;
  registered_at: string;
  revoked_at: string | null;
  revoke_reason: string | null;
}

export interface ApiAccess {
  id: string;
  user_id: string;
  is_enabled: boolean;
  api_username: string;
  api_password_hash: string;
  allowed_ips: string[];
  last_access_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  changes: Json | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface UserAuthCredential {
  id: string;
  user_id: string;
  auto_password_encrypted: string;
  encryption_key_id: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// VISTAS
// ============================================================================

export interface AccountMovement {
  account_id: string;
  user_id: string;
  transaction_id: string;
  created_at: string;
  completed_at: string | null;
  amount: number;
  concept: string | null;
  payment_method: PaymentMethod;
  reference_number: string;
  category: TransactionCategory;
  transaction_type_name: string;
  movement_type: "income" | "expense" | "other";
  income_amount: number;
  expense_amount: number;
  status: TransactionStatus;
  counterpart_name: string | null;
}

// ============================================================================
// TIPOS EXTENDIDOS (para joins)
// ============================================================================

export interface AccountWithType extends Account {
  account_types: AccountType;
}

export interface TransactionWithType extends Transaction {
  transaction_types: TransactionType;
}

export interface AccountWithLimits extends Account {
  account_limits: AccountLimit | null;
}

export interface UserWithAccount extends User {
  accounts: Account[];
}

// ============================================================================
// TIPOS PARA FUNCIONES RPC
// ============================================================================

export interface ProcessTransferArgs {
  p_from_account_id: string;
  p_to_identifier: string;
  p_amount: number;
  p_concept?: string;
  p_payment_method?: PaymentMethod;
  p_device_id?: string;
  p_ip_address?: string;
}

export interface ProcessTransferResult {
  success: boolean;
  transaction_id: string;
  amount: number;
  new_balance: number;
  is_external: boolean;
  to_account_id: string | null;
  reference_number: string;
}

export interface ValidateTransferArgs {
  p_from_account_id: string;
  p_to_identifier: string;
  p_amount: number;
  p_payment_method?: PaymentMethod;
}

export interface ValidateTransferResult {
  valid: boolean;
  error_code: string | null;
  error_message: string | null;
  to_account_id: string | null;
  to_holder_name: string | null;
  is_external: boolean;
  commission_amount: number;
  net_amount: number;
}

export interface GetUserLoginDataArgs {
  email_input: string;
}

export interface GetUserLoginDataResult {
  id: string;
  email: string;
  pin_hash: string;
  verification_status: VerificationStatus;
  auto_password_encrypted: string | null;
}

export interface SearchAccountArgs {
  p_identifier: string;
}

export interface SearchAccountResult {
  account_id: string | null;
  holder_name: string;
  alias: string | null;
  is_external: boolean;
}

export interface AppVersion {
  id: number;
  version: string;
  build_number: number | null;
  platform: "ios" | "android";
  mandatory: boolean;
  store_url: string | null;
  created_at: string;
}

export type Views<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T]["Row"];
