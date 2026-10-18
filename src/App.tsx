/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';

// Custom typewriter hook
function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let intervalId: ReturnType<typeof setInterval>;
    let index = 0;

    timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        index++;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) {
          clearInterval(intervalId);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPills, setShowPills] = useState(false);
  const [copied, setCopied] = useState(false);

  // Video scrubbing refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);
  const prevXRef = useRef<number | null>(null);

  // Typewriter hook for hero message
  const typewriterText = 'Glad you stopped in. Good taste tends to find us. Now, what are we building?';
  const { displayed, done } = useTypewriter(typewriterText, 38, 600);

  // Action pill buttons reveal 400ms after page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPills(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Video horizontal mouse scrub listener
  useEffect(() => {
    const SENSITIVITY = 0.8;

    const handlePointerMove = (clientX: number) => {
      const video = videoRef.current;
      if (!video || !video.duration || Number.isNaN(video.duration)) {
        prevXRef.current = clientX;
        return;
      }

      if (prevXRef.current === null) {
        prevXRef.current = clientX;
        return;
      }

      const delta = clientX - prevXRef.current;
      prevXRef.current = clientX;

      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      let nextTarget = targetTimeRef.current + timeOffset;
      if (nextTarget < 0) nextTarget = 0;
      if (nextTarget > video.duration) nextTarget = video.duration;
      targetTimeRef.current = nextTarget;

      // Initiate seek if not currently seeking
      if (!isSeekingRef.current) {
        if (Math.abs(video.currentTime - targetTimeRef.current) > 0.01) {
          isSeekingRef.current = true;
          video.currentTime = targetTimeRef.current;
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX);
    };

    const handleMouseLeave = () => {
      prevXRef.current = null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX);
      }
    };

    const handleTouchEnd = () => {
      prevXRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // On seeked, check if target has moved ahead/behind and queue next seek
  const handleSeeked = () => {
    isSeekingRef.current = false;
    const video = videoRef.current;
    if (!video || !video.duration) return;

    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.01) {
      isSeekingRef.current = true;
      video.currentTime = targetTimeRef.current;
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      targetTimeRef.current = video.currentTime;
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('hello@mainframe.co');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
      const textarea = document.createElement('textarea');
      textarea.value = 'hello@mainframe.co';
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white select-none overflow-hidden">
      {/* Background Video (mouse-scrub controlled) */}
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_041744_63efcd78-bf7d-4039-99e2-2461e8a61903.mp4"
        muted
        playsInline
        preload="auto"
        onSeeked={handleSeeked}
        onLoadedMetadata={handleLoadedMetadata}
        className="pointer-events-none select-none"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: '70% center',
        }}
      />

      {/* Navbar (fixed, z-index: 10) */}
      <header className="fixed top-0 left-0 right-0 z-10 w-full px-5 sm:px-8 py-4 sm:py-5 flex justify-between items-center">
        {/* Logo (left) */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-[21px] sm:text-[26px] tracking-tight text-white hover:opacity-90 transition-opacity"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Mainframe&reg;
          </a>
          <span
            className="text-[25px] sm:text-[30px] text-white select-none leading-none inline-block"
            style={{ letterSpacing: '-0.02em' }}
            aria-hidden="true"
          >
            &#10035;&#xFE0E;
          </span>
        </div>

        {/* Desktop nav links (center, hidden below md) */}
        <nav className="hidden md:flex flex-row text-[23px] text-white items-center">
          <a href="#labs" className="hover:opacity-60 transition-opacity">
            Labs
          </a>
          <span>,&nbsp;</span>
          <a href="#studio" className="hover:opacity-60 transition-opacity">
            Studio
          </a>
          <span>,&nbsp;</span>
          <a href="#openings" className="hover:opacity-60 transition-opacity">
            Openings
          </a>
          <span>,&nbsp;</span>
          <a href="#shop" className="hover:opacity-60 transition-opacity">
            Shop
          </a>
        </nav>

        {/* Desktop CTA (right, hidden below md) */}
        <div className="hidden md:block">
          <a
            href="mailto:hello@mainframe.co"
            className="text-[23px] text-white underline underline-offset-2 hover:opacity-60 transition-opacity"
          >
            Get in touch
          </a>
        </div>

        {/* Mobile hamburger (visible below md) */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="md:hidden flex flex-col justify-center items-center gap-[5px] p-2 focus:outline-none cursor-pointer z-20"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ease-in-out ${
              menuOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ease-in-out ${
              menuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ease-in-out ${
              menuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </header>

      {/* Mobile overlay (z-index: 9) */}
      <div
        className={`fixed inset-0 z-[9] bg-black/90 backdrop-blur-md flex flex-col justify-center px-8 gap-8 md:hidden transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <a
          href="#labs"
          onClick={() => setMenuOpen(false)}
          className="text-[32px] font-medium text-white hover:opacity-70 transition-opacity"
        >
          Labs
        </a>
        <a
          href="#studio"
          onClick={() => setMenuOpen(false)}
          className="text-[32px] font-medium text-white hover:opacity-70 transition-opacity"
        >
          Studio
        </a>
        <a
          href="#openings"
          onClick={() => setMenuOpen(false)}
          className="text-[32px] font-medium text-white hover:opacity-70 transition-opacity"
        >
          Openings
        </a>
        <a
          href="#shop"
          onClick={() => setMenuOpen(false)}
          className="text-[32px] font-medium text-white hover:opacity-70 transition-opacity"
        >
          Shop
        </a>
        <a
          href="mailto:hello@mainframe.co"
          onClick={() => setMenuOpen(false)}
          className="text-[32px] font-medium text-white underline underline-offset-4 hover:opacity-70 transition-opacity"
        >
          Get in touch
        </a>
      </div>

      {/* Hero Section (z-index: 1) */}
      <main className="relative z-[1] h-screen flex flex-col justify-end pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-10 overflow-hidden">
        <div className="max-w-xl relative z-10">
          {/* 1. Blurred intro label */}
          <div
            className="pointer-events-none select-none mb-5 sm:mb-6 text-white"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.3,
              fontWeight: 400,
              filter: 'blur(4px)',
            }}
          >
            Hey there, meet A.R.I.A,
            <br />
            Mainframe&apos;s Adaptive Response Interface Agent
          </div>

          {/* 2. Typewriter text */}
          <p
            className="text-white mb-5 sm:mb-6 min-h-[54px]"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.35,
              fontWeight: 400,
            }}
          >
            {displayed}
            {!done && (
              <span
                className="inline-block w-[2px] h-[1.1em] bg-white align-middle ml-[2px] animate-blink"
                aria-hidden="true"
              />
            )}
          </p>

          {/* 3. Action pill buttons */}
          <div
            className="flex flex-wrap gap-y-1"
            style={{
              opacity: showPills ? 1 : 0,
              transform: showPills ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            {/* White pill button 1 */}
            <a
              href="mailto:hello@mainframe.co?subject=Pitch%20us%20an%20idea"
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Pitch us an idea
            </a>

            {/* White pill button 2 */}
            <a
              href="mailto:hello@mainframe.co?subject=Come%20work%20here"
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Come work here
            </a>

            {/* White pill button 3 */}
            <a
              href="mailto:hello@mainframe.co?subject=Send%20a%20brief%20hello"
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Send a brief hello
            </a>

            {/* White pill button 4 */}
            <a
              href="#operate"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
            >
              See how we operate
            </a>

            {/* Outline pill button with copy icon */}
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center justify-center text-white bg-transparent border border-white rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap gap-2 sm:gap-3 hover:bg-white hover:text-black transition-colors duration-200 cursor-pointer"
              title="Click to copy email address"
            >
              <span>
                Reach us:&nbsp;
                <span className="underline underline-offset-1">
                  {copied ? 'Copied to clipboard!' : 'hello@mainframe.co'}
                </span>
              </span>

              {/* 12x12 copy icon (inline SVG of two overlapping rectangles) */}
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 transition-transform duration-200"
                aria-hidden="true"
              >
                {copied ? (
                  <path d="M2 6.5l2.5 2.5 5.5-6" />
                ) : (
                  <>
                    <rect x="4" y="4" width="7" height="7" rx="1" />
                    <path d="M2.5 8H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v0.5" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
