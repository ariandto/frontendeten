export const isAdmin = (email: string | null | undefined): boolean => {
  return email === import.meta.env.VITE_EMAIL_ADMIN;
};