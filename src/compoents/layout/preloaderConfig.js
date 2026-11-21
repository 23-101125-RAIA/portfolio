export const TOP_TEXT = 'TO PAGE';
export const SLOT_COUNT = 8;
export const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const FLIP_MS = 110;
export const FLIPS_PER_CHAR = 6;
export const STAGGER_MS = 60;
export const TOP_START_MS = 500;
export const BOTTOM_START_MS = 750;
export const HOLD_MS = 500;

export const PAGE_NAMES = {
    '/': 'ENTRY GATE',
    '/error': 'ERROR',
    '/gallery': 'Gallery',
    '/categories': 'CATEGORIES',
    '/timeline': 'TIMELINE',
    '/projects': 'PROJECTS',
    '/project-details': ' DETAILS',
    '/tools': 'TOOLS',
    '/creative-code': ' CODE',
    '/about': 'ABOUT',
    '/exhibition-history': 'EXHIBITION ',
    '/contact': 'CONTACT',
    '/faq': 'FAQ',
    '/privacy': 'PRIVACY'
};

const clean = (value) =>
    value
        .replace(/[-_]+/g, ' ')
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase();

const fit = (name) => {
    if (name.length <= SLOT_COUNT) return name;
    const first = name.split(' ')[0];
    return first.slice(0, SLOT_COUNT);
};

export const resolvePageName = (pathname, label) => {
    const normalized = pathname.replace(/\/+$/, '') || '/';
    const lastSegment = normalized.split('/').pop();
    let source = label || PAGE_NAMES[normalized] || lastSegment;
    try {
        source = decodeURIComponent(source);
    } catch (error) {
        source = lastSegment;
    }
    return fit(clean(source)) || 'HOME';
};