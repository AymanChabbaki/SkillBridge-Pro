import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const MotionLink = motion(Link);

export default function Hero() {
  const [ended, setEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnd = () => {
      setEnded(true);
    };
    v.addEventListener('ended', onEnd);
    return () => v.removeEventListener('ended', onEnd);
  }, []);


  return (
    <section className="relative h-screen min-h-[560px] overflow-hidden">
      {/* Background video - play once */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src="/hero.mp4"
        autoPlay
        muted
        playsInline
      />

  {/* Base dark overlay for readability (darker) */}
  <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/40 z-0" />

      {/* Smoke overlay: render once the video ends and keep it visible */}
      {ended && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute inset-0 hero-smoke hero-smoke-visible opacity-90" />
        </div>
      )}

      {/* Subtle particles (simple CSS animated blobs) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-16 top-1/4 w-80 h-80 rounded-full bg-white/5 blur-3xl animate-blob" />
        <div className="absolute right-8 bottom-1/4 w-60 h-60 rounded-full bg-white/4 blur-2xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-20 container mx-auto px-6 h-full flex flex-col justify-end pb-28 text-dashboard-xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-3xl text-center mx-auto"
        >
          {/* CTAs appear only after the video has finished */}
          {ended && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <MotionLink
                  to="/auth/register"
                  whileHover={{ scale: 1.02 }}
                  className="smoke-ripple relative inline-flex items-center justify-center px-6 py-3 rounded-lg text-lg font-semibold text-white shadow-lg bg-white/5 backdrop-blur-md border border-white/10 hover:shadow-2xl transition"
                >
                  Register
                  <span className="absolute inset-0 rounded-lg pointer-events-none" />
                </MotionLink>

                <MotionLink
                  to="/auth/login"
                  whileHover={{ scale: 1.02 }}
                  className="smoke-ripple relative inline-flex items-center justify-center px-6 py-3 rounded-lg text-lg font-medium text-white border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 transition"
                >
                  Login
                </MotionLink>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* decorative smoke ripple on CTA hover via tailwind utilities (requires classes in global CSS) */}
    </section>
  );
}
