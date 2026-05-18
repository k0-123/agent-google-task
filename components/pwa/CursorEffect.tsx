"use client";
import { useEffect, useRef } from "react";

export default function CursorEffect() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx - 5 + 'px';
      cursor.style.top = my - 5 + 'px';
    };

    const animRing = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx - 16 + 'px';
      ring.style.top = ry - 16 + 'px';
      animId = requestAnimationFrame(animRing);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animId = requestAnimationFrame(animRing);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="cursor" id="cursor"></div>
      <div ref={ringRef} className="cursor-ring" id="cursorRing"></div>
      
      {/* FLYING EMOJI ZONE */}
      <div className="fly-zone" id="flyZone"></div>
      
      {/* RESULT FLASH OVERLAY */}
      <div className="result-overlay" id="resultOverlay">
        <div className="result-box" id="resultBox">
          <div className="result-big" id="resultBig"></div>
          <div className="result-sub" id="resultSub"></div>
        </div>
      </div>
      
      {/* STADIUM BACKGROUND */}
      <div className="stadium-bg">
        <div className="fl fl-tl"></div>
        <div className="fl fl-tr"></div>
        <div className="fl fl-bot"></div>
        <div className="fl fl-pitch"></div>
      </div>

      <div className="outside-label left">CRICKETPULSE · IPL 2026</div>
      <div className="outside-label right">PREDICT · REACT · WIN</div>
    </>
  );
}
