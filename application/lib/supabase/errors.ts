import { PostgrestError } from '@supabase/supabase-js'
import { ZodError } from 'zod'

export function handleApiError(error: unknown): Response {
  console.error('API Error:', error)
  
  // Zod validation errors
  if (error instanceof ZodError) {
    return Response.json(
      {
        success: false,
        error: 'Validation failed',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 }
    )
  }
  
  // Supabase/PostgreSQL errors
  if (isPostgrestError(error)) {
    const message = getPostgrestErrorMessage(error)
    return Response.json(
      { success: false, error: message },
      { status: getPostgrestErrorStatus(error) }
    )
  }
  
  // Generic errors
  return Response.json(
    { success: false, error: 'An unexpected error occurred' },
    { status: 500 }
  )
}

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  )
}

function getPostgrestErrorMessage(error: PostgrestError): string {
  // Map database error codes to user-friendly messages
  switch (error.code) {
    case '23505': // unique_violation
      return 'A quotation with this information already exists'
    case '23503': // foreign_key_violation
      return 'Referenced quotation does not exist'
    case '23502': // not_null_violation
      return 'Required field is missing'
    case 'PGRST116': // not found
      return 'Quotation not found'
    default:
      return 'Database operation failed'
  }
}

function getPostgrestErrorStatus(error: PostgrestError): number {
  switch (error.code) {
    case 'PGRST116':
      return 404
    case '23505':
    case '23503':
    case '23502':
      return 400
    default:
      return 500
  }
}
