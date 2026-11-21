import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Preloader from '../../pages/Preloader';
import { resolvePageName } from './preloaderConfig';
import leftDecoration from '../../assets/imgs/left-decoration.png';
import rightDecoration from '../../assets/imgs/right-decoration.png';
import preloaderCenter from '../../assets/imgs/preloader-center.png';

const PreloaderContext = createContext({ go: () => {} });

export const usePreloader = () => useContext(PreloaderContext);

const isPlainLeftClick = (event) =>
    event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

const PreloaderProvider = ({ children }) => {
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const sessionRef = useRef(null);
    const busyRef = useRef(false);
    sessionRef.current = session;

    useEffect(() => {
        [leftDecoration, rightDecoration, preloaderCenter].forEach((src) => {
            const image = new Image();
            image.src = src;
        });
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('preloader-lock', Boolean(session));
        return () => document.documentElement.classList.remove('preloader-lock');
    }, [session]);

    const go = useCallback((to, label) => {
        if (busyRef.current) return;
        const url = new URL(to, window.location.href);
        if (url.origin !== window.location.origin) {
            window.location.assign(url.href);
            return;
        }
        busyRef.current = true;
        setSession({
            id: Date.now(),
            path: `${url.pathname}${url.search}${url.hash}`,
            name: resolvePageName(url.pathname, label),
            leaving: false
        });
    }, []);

    const complete = useCallback(() => {
        const current = sessionRef.current;
        if (!current) return;
        navigate(current.path);
        window.scrollTo(0, 0);
        setSession({ ...current, leaving: true });
    }, [navigate]);

    const exited = useCallback(() => {
        busyRef.current = false;
        setSession(null);
    }, []);

    useEffect(() => {
        const handleClick = (event) => {
            if (event.defaultPrevented || !isPlainLeftClick(event)) return;
            const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
            if (!anchor) return;
            if (anchor.target && anchor.target !== '_self') return;
            if (anchor.hasAttribute('download') || anchor.dataset.preloader === 'off') return;
            const url = new URL(anchor.href, window.location.href);
            if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
            if (url.origin !== window.location.origin) return;
            if (url.pathname === window.location.pathname && url.search === window.location.search) return;
            event.preventDefault();
            event.stopPropagation();
            go(`${url.pathname}${url.search}${url.hash}`, anchor.dataset.pageName);
        };
        document.addEventListener('click', handleClick, true);
        return () => document.removeEventListener('click', handleClick, true);
    }, [go]);

    const value = useMemo(() => ({ go }), [go]);

    return (
        <PreloaderContext.Provider value={value}>
            {children}
            {session && (
                <Preloader
                    key={session.id}
                    name={session.name}
                    leaving={session.leaving}
                    onComplete={complete}
                    onExited={exited}
                />
            )}
        </PreloaderContext.Provider>
    );
};

export default PreloaderProvider;