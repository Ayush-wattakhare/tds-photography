export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      quotations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          client_site_name: string
          shoot_type: string
          quotation_date: string
          discount_percentage: number
          subtotal: number
          discount_amount: number
          total: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          client_site_name: string
          shoot_type: string
          quotation_date: string
          discount_percentage?: number
          subtotal: number
          discount_amount?: number
          total: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          client_site_name?: string
          shoot_type?: string
          quotation_date?: string
          discount_percentage?: number
          subtotal?: number
          discount_amount?: number
          total?: number
        }
      }
      line_items: {
        Row: {
          id: string
          quotation_id: string
          description: string
          photo_count: number
          reel_video_count: number
          price: number
        }
        Insert: {
          id?: string
          quotation_id: string
          description: string
          photo_count: number
          reel_video_count: number
          price: number
        }
        Update: {
          id?: string
          quotation_id?: string
          description?: string
          photo_count?: number
          reel_video_count?: number
          price?: number
        }
      }
    }
  }
}
