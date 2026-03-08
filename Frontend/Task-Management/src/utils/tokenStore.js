export const tokenStore = {
  get: () => localStorage.getItem('accessToken'),
  set: (token) => localStorage.setItem('accessToken', token),
  clear: () => localStorage.removeItem('accessToken'),
};
