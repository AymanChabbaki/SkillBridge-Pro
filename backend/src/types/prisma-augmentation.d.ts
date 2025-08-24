// Augment Prisma client types with runtime-only fields used by the app
// This file allows attaching transient properties (like isCertified) to
// Prisma model objects without TypeScript errors.
import { Prisma } from '@prisma/client';

declare module '@prisma/client' {
  // Extend the Freelancer model returned by Prisma with an optional runtime-only flag
  interface Freelancer {
    isCertified?: boolean;
  }
}
