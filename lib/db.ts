import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!)

export default sql

export interface User {
  id: number
  telegram_id: number
  username: string | null
  first_name: string
  photo_url: string | null
  is_admin: boolean
  created_at: Date
  last_login_at: Date
}

export interface Category {
  id: number
  slug: string
  title: string
  description: string | null
  icon: string | null
  order: number
  is_published: boolean
}

export interface Module {
  id: number
  category_id: number
  title: string
  order: number
  is_published: boolean
}

export interface Lesson {
  id: number
  module_id: number
  title: string
  video_path: string | null
  content_md: string | null
  order: number
  duration_min: number | null
  is_published: boolean
}
