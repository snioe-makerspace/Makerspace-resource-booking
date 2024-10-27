export const validateSnuEmail = (email: string): boolean => {
  const pattern = /^[a-zA-Z0-9._%+-]+@snu\.edu\.in$/;
  return pattern.test(email);
};
