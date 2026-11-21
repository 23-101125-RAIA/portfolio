import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Entrygate from './pages/entrygate';
import PreloaderProvider from './compoents/layout/PreloaderProvider';
import Preloader from './pages/Preloader';





const Routess = () => {
  return (

    <BrowserRouter>
     <PreloaderProvider>
        <Routes>
          <Route path="/" element={<Entrygate />} />
          <Route path="/preloader" element={<Preloader />} />
          {/* <Route path="/error" element={<Error />} /> */}
          {/* <Route path="/gallery" element={<Gallery />} /> */}
          {/* <Route path="/categories" element={<Categories />} /> */}
          {/* <Route path="/timeline" element={<Timeline />} /> */}
          {/* <Route path="/projects" element={<Projects />} /> */}
          {/* <Route path="/project-details" element={<ProjectDetails />} /> */}
          {/* <Route path="/tools" element={<Tools />} /> */}
          {/* <Route path="/creative-code" element={<CreativeCode />} /> */}
          {/* <Route path="/about" element={<About />} /> */}
          {/* <Route path="/exhibition-history" element={<ExhibitionHistory />} /> */}
          {/* <Route path="/contact" element={<Contact />} /> */}
          {/* <Route path="/faq" element={<FAQ />} /> */}
          {/* <Route path="/privacy" element={<Privacy />} /> */}
        </Routes>
      </PreloaderProvider>
    </BrowserRouter>
  );
};

export default Routess;