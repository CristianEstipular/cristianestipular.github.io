const configuredApiUrl = process.env.REACT_APP_API_URL || '';
const developmentApiUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';
const API_BASE_URL = (configuredApiUrl || developmentApiUrl).replace(/\/$/, '');

export const apiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;