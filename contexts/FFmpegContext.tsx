import React, { createContext, useContext, useRef, useState, useEffect, ReactNode } from 'react';
import { createFFmpeg, FFmpeg } from '@ffmpeg/ffmpeg';
import numerify from 'numerify';
import { toast } from '@/utils/toast';

interface FFmpegContextType {
  ffmpeg: FFmpeg | null;
  spinning: boolean;
  tip: string | false;
  setSpinning: (spinning: boolean) => void;
  setTip: (tip: string | false) => void;
}

const FFmpegContext = createContext<FFmpegContextType | undefined>(undefined);

export const FFmpegProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [spinning, setSpinning] = useState(false);
  const [tip, setTip] = useState<string | false>(false);
  const ffmpeg = useRef<FFmpeg | null>(null);

  useEffect(() => {
    (async () => {
      try {
        ffmpeg.current = createFFmpeg({
          log: true,
          corePath:
            'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
        });
        ffmpeg.current.setProgress(({ ratio }) => {
          // eslint-disable-next-line no-console
          console.log(ratio);
          setTip(numerify(ratio, '0.0%'));
        });
        setTip('ffmpeg static resource loading...');
        setSpinning(true);
        await ffmpeg.current.load();
        setSpinning(false);
      } catch (err) {
        console.error('Failed to load ffmpeg:', err);
        setSpinning(false);
        setTip(false);
        toast.error('Failed to load ffmpeg, please refresh the page and try again', {
          duration: 10000,
        });
      }
    })();
  }, []);

  return (
    <FFmpegContext.Provider
      value={{
        ffmpeg: ffmpeg.current,
        spinning,
        tip,
        setSpinning,
        setTip,
      }}
    >
      {children}
    </FFmpegContext.Provider>
  );
};

export const useFFmpegContext = () => {
  const context = useContext(FFmpegContext);
  if (context === undefined) {
    throw new Error('useFFmpegContext must be used within a FFmpegProvider');
  }
  return context;
};
