import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FloatingIconProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

const FloatingIcon = ({ children, className = '', delay = 0, duration = 6 }: FloatingIconProps) => (
  <motion.div
    className={`absolute text-pine/10 ${className}`}
    initial={{ y: 0 }}
    animate={{ 
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0]
    }}
    transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

const floatingElements = [
  { id: 1, delay: 0, duration: 7, className: "top-[15%] left-[8%] w-10 h-10", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg> },
  { id: 2, delay: 2, duration: 8, className: "bottom-[25%] left-[12%] w-14 h-14", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17H2a3 3 0 0 1-3-3V9C-1 6 1 4 4 4h16c3 0 5 2 5 5v5a3 3 0 0 1-3 3z"></path><path d="M16 4v16"/><path d="M8 4v16"/><path d="M2 10h20"/></svg> },
  { id: 5, delay: 1.5, duration: 9, className: "top-[45%] left-[4%] w-8 h-8", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M2 9.5h20"/></svg> },
  { id: 3, delay: 1, duration: 6, className: "top-[20%] right-[10%] w-12 h-12", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-1 .1-1.3.5-.3.4-.3 1 0 1.4L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 4.6 5.6c.4.4 1 .5 1.4.2.4-.3.6-.8.5-1.3Z"></path></svg> },
  { id: 4, delay: 3, duration: 9, className: "bottom-[20%] right-[8%] w-10 h-10", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"></path><path d="m19 15-7 7-7-7"></path></svg> },
  { id: 6, delay: 4, duration: 7, className: "top-[60%] right-[4%] w-11 h-11", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> },
];

const FloatingBackground = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-pine/5 blur-3xl" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 rounded-full bg-pine/5 blur-2xl" />
      
      <svg className="absolute inset-0 w-full h-full opacity-30" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dotted-line" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" className="fill-pine/10" />
          </pattern>
        </defs>
        <path d="M -100 200 C 100 100, 300 300, 500 200 S 800 100, 1100 300" stroke="url(#dotted-line)" strokeWidth="2" fill="none" strokeDasharray="6 6" />
        <path d="M 1200 600 C 1000 700, 800 500, 600 600 S 300 700, 0 500" stroke="url(#dotted-line)" strokeWidth="2" fill="none" strokeDasharray="6 6" />
      </svg>

      {floatingElements.map((el) => (
        <FloatingIcon key={el.id} delay={el.delay} duration={el.duration} className={el.className}>
          {el.icon}
        </FloatingIcon>
      ))}
    </div>
  );
};

export default FloatingBackground;