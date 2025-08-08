process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://tms:tms@localhost:5432/tms?schema=public'
process.env.NODE_ENV = process.env.NODE_ENV || 'test'
