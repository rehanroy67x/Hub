// Type definitions for the project

// Declare the isPublicRoute function to ensure TypeScript recognizes it
declare module "@/lib/auth" {
  export function isPublicRoute(path: string): boolean
}
