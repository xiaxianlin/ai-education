import axios from "axios";

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL
    ? `${process.env.EXPO_PUBLIC_API_URL}/api/student`
    : "http://localhost:7890/api/student",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default client;
