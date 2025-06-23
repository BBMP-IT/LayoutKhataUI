//apiService.js

import axiosInstance from './axiosInstance';

const apiService = {
  // POST request method
  postRequest: async (url, data) => {
    try {
      const response = await axiosInstance.post(url, data);
     
      if (response.status === 200) {
        return response.data;
      } else {
        alert("something went wrong!");
      }

    } catch (error) {
      console.error(`POST request to ${url} failed:`, error);
      throw error;
    }
  },

  // GET request method
  getRequest: async (url) => {
    try {
      const response = await axiosInstance.get(url);
      if (response.status === 200) {
        return response.data;
      } else {
        alert("something went wrong!");
      }
    } catch (error) {
      console.error(`GET request to ${url} failed:`, error);
      throw error;
    }
  },
  // DELETE request method
  deleteRequest: async (url, data) => {
    try {
      const response = await axiosInstance.delete(url, {
        data, // 👈 Send the payload in the `data` field
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (response.status === 200) {
        return response.data;
      } else {
        alert("Something went wrong!");
      }
    } catch (error) {
      console.error(`DELETE request to ${url} failed:`, error);
      throw error;
    }
  },

  // PUT request method
  putRequest: async (url, data) => {
    try {
      const response = await axiosInstance.put(url, data);
      if (response.status === 200) {
        return response.data;
      } else {
        alert("something went wrong!");
      }
    } catch (error) {
      console.error(`PUT request to ${url} failed:`, error);
      throw error;
    }
  },
  // FETCH request method
  fetchRequest: async (url, data) => {
    try {
      const response = await axiosInstance.fetch(url, data);
      return response.data;
    } catch (error) {
      console.error(`PUT request to ${url} failed:`, error);
      throw error;
    }
  },



};

export default apiService;
