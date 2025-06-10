import React, { createContext, useState, useEffect } from "react";

export const UserProgressContext = createContext();

export const UserProgressProvider = ({ children }) => {
  const [userProgress, setUserProgress] = useState(
    JSON.parse(localStorage.getItem("userProgress")) || []
  );

  useEffect(() => {
    localStorage.setItem("userProgress", JSON.stringify(userProgress));
  }, [userProgress]);

  // Function to update progress
  const addUserProgress = (step) => {
    if (!userProgress.includes(step)) {
      setUserProgress((prev) => [...prev, step]);
    }
  };

  return (
    <UserProgressContext.Provider value={{ userProgress, addUserProgress }}>
      {children}
    </UserProgressContext.Provider>
  );
};
