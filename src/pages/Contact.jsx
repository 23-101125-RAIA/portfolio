import React, { useState } from 'react';
import './Contact.css';
import '../genarel.css';

import { supabase } from '../supabaseClient';
import Header from '../compoents/layout/Header';
import Footer from '../compoents/layout/Footer';

import contactPaper from '../assets/imgs/contact-paper.png';
import contactSeal from '../assets/imgs/contact-seal.png';
import contactHandLeft from '../assets/imgs/contact-hand-left.png';
import contactHandRight from '../assets/imgs/contact-hand-right.png';

const TABLE = 'contact_messages';
const SUBJECT = 'New message from portfolio contact form';
const STATUS = 'new';

const NOTES = {
    idle: 'Have a project in mind? Leave a message below.',
    sending: 'Sending your message...',
    sent: 'Thank you, your message has been sent.',
    error: 'Something went wrong. Please try again.'
};

const EMPTY_FORM = { name: '', email: '', message: '', website: '' };

const Contact = () => {
    const [values, setValues] = useState(EMPTY_FORM);
    const [status, setStatus] = useState('idle');

    const handleChange = (event) => {
        const { name, value } = event.target;

        setValues((current) => ({ ...current, [name]: value }));

        if (status === 'sent' || status === 'error') setStatus('idle');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (status === 'sending') return;

        if (values.website) {
            setValues(EMPTY_FORM);
            setStatus('sent');
            return;
        }

        const payload = {
            sender_name: values.name.trim(),
            sender_email: values.email.trim(),
            subject: SUBJECT,
            message_body: values.message.trim(),
            status: STATUS
        };

        if (!payload.sender_name || !payload.sender_email || !payload.message_body) return;

        setStatus('sending');

        const { error } = await supabase.from(TABLE).insert(payload);

        if (error) {
            console.error('Unable to send the message:', error);
            setStatus('error');
            return;
        }

        setValues(EMPTY_FORM);
        setStatus('sent');
    };

    return (
        <div className="bkk">
            <Header />

            <main className="contact">
                <div className="contact-hand contact-hand--left">
                    <img src={contactHandLeft} alt="" draggable={false} />
                </div>

                <div className="contact-hand contact-hand--right">
                    <img src={contactHandRight} alt="" draggable={false} />
                </div>

                <section className="contact-card" aria-labelledby="contact-title">
                    <img className="contact-paper" src={contactPaper} alt="" draggable={false} />
                    <img className="contact-seal" src={contactSeal} alt="" draggable={false} />

                    <form className="contact-form" onSubmit={handleSubmit}>
                        <h1 className="contact-title" id="contact-title">
                            Send a Message
                        </h1>

                        <p
                            className={`contact-note${status === 'error' ? ' is-error' : ''}`}
                            role="status"
                            aria-live="polite"
                        >
                            {NOTES[status]}
                        </p>

                        <div className="contact-row">
                            <div className="contact-field">
                                <label className="contact-label" htmlFor="contact-name">
                                    Name
                                </label>
                                <input
                                    className="contact-input"
                                    id="contact-name"
                                    name="name"
                                    type="text"
                                    value={values.name}
                                    onChange={handleChange}
                                    maxLength={100}
                                    autoComplete="name"
                                    required
                                />
                            </div>

                            <div className="contact-field">
                                <label className="contact-label" htmlFor="contact-email">
                                    Email
                                </label>
                                <input
                                    className="contact-input"
                                    id="contact-email"
                                    name="email"
                                    type="email"
                                    value={values.email}
                                    onChange={handleChange}
                                    maxLength={254}
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="contact-field">
                            <label className="contact-label" htmlFor="contact-message">
                                Your Message
                            </label>

                            <div className="contact-message">
                                <textarea
                                    className="contact-input contact-textarea"
                                    id="contact-message"
                                    name="message"
                                    rows={2}
                                    value={values.message}
                                    onChange={handleChange}
                                    maxLength={2000}
                                    required
                                />

                                <button className="contact-send" type="submit" disabled={status === 'sending'}>
                                    <span className="contact-send__wave contact-send__wave--dark" />
                                    <span className="contact-send__wave contact-send__wave--cream" />
                                    <span className="contact-send__label">{status === 'sending' ? '...' : 'Send'}</span>
                                </button>
                            </div>
                        </div>

                        <input
                            className="contact-trap"
                            type="text"
                            name="website"
                            value={values.website}
                            onChange={handleChange}
                            tabIndex={-1}
                            autoComplete="off"
                            aria-hidden="true"
                        />
                    </form>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;