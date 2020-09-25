export default function errorHandler(error) {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('accessToken');
    window.location.href = '/signup';
  }
  throw error;
}
