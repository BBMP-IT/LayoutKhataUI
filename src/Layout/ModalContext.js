//ModalContext.js


import React from 'react';

export const ModalContext = React.createContext({
  showModal: () => {},
  hideModal: () => {},
  setModalContent: () => {},
  setModalTitle: () => {},
});