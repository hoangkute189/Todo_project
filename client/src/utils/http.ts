import axios, { AxiosInstance } from "axios";

class Http {
  instance: AxiosInstance;
  constructor() {
    this.instance = axios.create({
      baseURL: "http://localhost:8080/api/v1/todos",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

const http = new Http().instance;

export default http;
