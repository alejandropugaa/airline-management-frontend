import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://airline-management-backend-bus7.onrender.com/api', // Backend de Express
  headers: {
    'Content-Type': 'application/json',
  }
});

export default instance;
