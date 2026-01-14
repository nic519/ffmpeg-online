import React from 'react';
import { motion, Variants } from 'framer-motion';

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'characters';
}

const BlurText: React.FC<BlurTextProps> = ({
  text,
  delay = 100,
  className = '',
  animateBy = 'words',
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delay / 1000,
      },
    },
  };

  const child: Variants = {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 20,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.span
      className={`inline-flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {elements.map((element, index) => (
        <motion.span
          key={index}
          variants={child}
          className="inline-block"
          style={{ marginRight: animateBy === 'words' ? '0.3em' : '0' }}
        >
          {element}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default BlurText;
