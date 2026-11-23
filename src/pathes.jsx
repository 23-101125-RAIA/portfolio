import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Entrygate from './pages/entrygate';
import PreloaderProvider from './compoents/layout/PreloaderProvider';
import Preloader from './pages/Preloader';
import Error from './pages/Error';
import Code from './pages/CreativeCode';
import Faq from './pages/Faq';
import Privacy from './pages/Privacy';
import Sitemap from './pages/Sitemap';
import Contact from './pages/Contact';
import About from './pages/About';
import Exhibition from './pages/Exhibition';
import Timeline from './pages/Timeline';





const Routess = () => {
  return (

    <BrowserRouter>
     <PreloaderProvider>
        <Routes>
          <Route path="/" element={<Entrygate />} />
          <Route path="/preloader" element={<Preloader />} />
          <Route path="/error" element={<Error />} />
          {/* <Route path="/gallery" element={<Gallery />} /> */}
          {/* <Route path="/categories" element={<Categories />} /> */}
          <Route path="/timeline" element={<Timeline />} />
          {/* <Route path="/projects" element={<Projects />} /> */}
          {/* <Route path="/project-details" element={<ProjectDetails />} /> */}
          {/* <Route path="/tools" element={<Tools />} /> */}
          <Route path="/experiments" element={<Code />} />
          <Route path="/about" element={<About />} />
          <Route path="/exhibition" element={<Exhibition />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/SiteMap" element={<Sitemap />} />
        </Routes>
      </PreloaderProvider>
    </BrowserRouter>
  );
};

export default Routess;