import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Entrygate from './pages/entrygate';





const Routess = () => {
  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Entrygate />} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default Routess;