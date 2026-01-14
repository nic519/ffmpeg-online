import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* 深色基础背景 */}
      <div className="absolute inset-0 bg-[#060608]" />
      
      {/* 点阵网格 */}
      <div 
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />
      
      {/* 渐变遮罩 - 从中心向外变暗 */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, rgba(6, 6, 8, 0.4) 50%, rgba(6, 6, 8, 0.9) 100%)',
        }}
      />
      
      {/* 顶部微弱的紫色光晕 (静态) */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
        }}
      />
    </div>
  );
};

export default Background;
