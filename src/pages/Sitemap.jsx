import React from 'react';
import './Sitemap.css';
import '../genarel.css';
import './Sitemap.css';

import Header from '../compoents/layout/Header';
import Footer from '../compoents/layout/Footer';
import { SITEMAP_SECTIONS } from './sitemapData ';

const slugify = (value) => value.toLowerCase().replace(/\s+/g, '-');

const Sitemap = () => {
    return (
        <div className="bkk">
            <Header />

            <main className="sitemap">
                <div className="sitemap-grid">
                    {SITEMAP_SECTIONS.map((section) => (
                        <section
                            className="sitemap-card"
                            key={section.title}
                            aria-labelledby={`sitemap-${slugify(section.title)}`}
                        >
                            <h2 className="sitemap-title" id={`sitemap-${slugify(section.title)}`}>
                                {section.title}
                            </h2>

                            <ul className="sitemap-list">
                                {section.links.map((url) => (
                                    <li className="sitemap-item" key={url}>
                                        <a
                                            className="sitemap-link"
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {url}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Sitemap;