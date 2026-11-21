import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PeelTicket from '../compoents/common/PeelTicket';
import ticket from '../assets/imgs/ticket.png';
import './entrygate.css';
import '../genarel.css';

const LEAVE_DELAY = 800;

const Entrygate = () => {
    const navigate = useNavigate();
    const [grabbed, setGrabbed] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const handleTear = () => {
        setLeaving(true);
        timerRef.current = setTimeout(() => navigate('/preloader'), LEAVE_DELAY);
    };

    return (
        <div className={`bk entrygate${leaving ? ' is-leaving' : ''}`}>
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