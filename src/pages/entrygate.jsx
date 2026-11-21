import React, { useState } from 'react';
import PeelTicket from '../compoents/common/PeelTicket';
import { usePreloader } from '../compoents/layout/PreloaderProvider';
import ticket from '../assets/imgs/ticket.png';
import './entrygate.css';
import '../genarel.css';

const GALLERY_PATH = '/gallery';

const Entrygate = () => {
    const { go } = usePreloader();
    const [grabbed, setGrabbed] = useState(false);

    const handleTear = () => go(GALLERY_PATH, 'Gallery');

    return (
        <div className="bk entrygate">
            <div className="entrygate-ticket">
                <PeelTicket src={ticket} alt="Digital portfolio ticket, tear to enter" onGrab={setGrabbed} onTear={handleTear} />
            </div>
            <div className="entrygate-caption">
                <p className={`entrygate-text${grabbed ? ' is-hidden' : ''}`}>
                    — Drag across the perforated edge to unseal the gallery —
                </p>
            </div>
        </div>
    );
};

export default Entrygate;