import React, { useState, useEffect, useRef } from 'react';

// --- Фон "Цифровой дождь" ---
const DigitalRain = ({ isError }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const fontSize = 14;
    const columns = Math.ceil(canvas.width / fontSize);
    const drops = Array.from({ length: columns }, () => Math.random() * -100);

    const draw = () => {
      ctx.fillStyle = 'rgba(13, 13, 13, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Цвет меняется в зависимости от ошибки
      ctx.fillStyle = isError ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 243, 255, 0.12)';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = isError ? (Math.random() > 0.5 ? 'ERR' : '!!') : (Math.random() > 0.5 ? '0' : '1');
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [isError]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 block" />;
};

export default function App() {
  const [percent, setPercent] = useState(0);
  const [stage, setStage] = useState('loading'); 
  const [isError, setIsError] = useState(false);
  const [wasRestored, setWasRestored] = useState(false); // Флаг для смены текста после восстановления

  // 1. ПРЕЛОАДЕР (1.5 сек)
  useEffect(() => {
    if (percent < 100) {
      const timer = setTimeout(() => setPercent(prev => prev + 2), 30);
      return () => clearTimeout(timer);
    } else {
      if (stage === 'loading') {
        setStage('fading');
        setTimeout(() => setStage('content'), 400); 
      }
    }
  }, [percent, stage]);

  // 2. ЦИКЛ ОШИБКИ И САМОВОССТАНОВЛЕНИЯ
  useEffect(() => {
    let errorTimer;
    let recoveryTimer;

    if (stage === 'content' && !isError) {
      // Включаем ошибку через 15 секунд
      errorTimer = setTimeout(() => setIsError(true), 15000);
    }

    if (isError) {
      // Выключаем ошибку (чиним основной блок) еще через 15 секунд
      recoveryTimer = setTimeout(() => {
        setIsError(false);
        setWasRestored(true); // Теперь текст в блоке изменится на новый
      }, 15000);
    }

    return () => {
      clearTimeout(errorTimer);
      clearTimeout(recoveryTimer);
    };
  }, [stage, isError]);

  return (
    <div className={`relative min-h-screen transition-colors duration-1000 font-mono overflow-hidden ${isError ? 'bg-[#1a0000]' : 'bg-[#0d0d0d]'} text-[#a0a0a0]`}>
      
      <div className={`crt-overlay ${isError ? 'crt-error' : ''}`} />
      
      <DigitalRain isError={isError} />

      {/* ПРЕЛОАДЕР (только при первом заходе) */}
      {stage !== 'content' && (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0d0d0d] transition-opacity duration-500 ${stage === 'fading' ? 'opacity-0' : 'opacity-100'}`}>
          <div className="text-[#00f3ff] text-sm tracking-[0.3em] mb-4 uppercase">
            INITIALIZING SYSTEM... {Math.min(percent, 100)}%
          </div>
          <div className="w-64 h-[1px] bg-white/10 relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-[#00f3ff] shadow-[0_0_10px_#00f3ff] transition-all duration-200" 
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* ОСНОВНОЙ БЛОК */}
      {stage === 'content' && (
        <div className={`relative z-10 min-h-screen flex items-center justify-center p-6 animate-fade-in ${isError ? 'animate-shake' : ''}`}>
          <div className={`w-full max-w-4xl p-8 md:p-16 border transition-all duration-500 ${isError ? 'border-red-600 shadow-[0_0_50px_rgba(255,0,0,0.4)] bg-red-900/10' : 'border-[#00f3ff]/30 bg-[#0d0d0d]/80 shadow-[0_0_30px_rgba(0,243,255,0.1)]'} backdrop-blur-md`}>
            
            <header className="mb-10">
              <p className={`text-[10px] md:text-xs tracking-[0.4em] uppercase transition-colors ${isError ? 'text-red-500' : 'text-[#00f3ff]/70'}`}>
                {isError ? '[ СИСТЕМА: КРИТИЧЕСКИЙ СБОЙ ]' : '[ СТАТУС: ИНИЦИАЛИЗАЦИЯ ОБЪЕКТА... ]'}
              </p>
            </header>

            <main>
              <h1 
                className={`glitch-title text-2xl md:text-5xl font-bold mb-8 cursor-default inline-block transition-colors ${isError ? 'text-red-600' : 'text-white'}`}
                data-text={isError ? "РЕАЛЬНОСТЬ ПОВРЕЖДЕНА" : "ПРОГРУЖАЕМ РЕАЛЬНОСТЬ. 99%"}
              >
                {isError ? "РЕАЛЬНОСТЬ ПОВРЕЖДЕНА" : "ПРОГРУЖАЕМ РЕАЛЬНОСТЬ. 99%"}
              </h1>
              
              <p className={`text-sm md:text-lg leading-relaxed max-w-2xl transition-colors ${isError ? 'text-red-400/60' : 'text-gray-400'}`}>
                {isError 
                  ? "Обнаружена десинхронизация потоков. Процесс материализации прерван. Ожидайте автоматического восстановления системы."
                  : (wasRestored 
                      ? "Настраиваем загрузку из нематериального в материальное. Ждите..."
                      : "«Мы калибруем лазеры и настраиваем подачу неона. Совсем скоро границы между цифровой моделью и осязаемым артефактом сотрутся окончательно. В лаборатории «ВНЕ РАМОК» идет финальная стадия сборки»."
                    )
                }
              </p>
            </main>

            <footer className="mt-12 flex items-center gap-4">
               <div className={`w-2 h-2 rounded-full ${isError ? 'bg-red-600 animate-ping' : 'bg-green-500 animate-pulse'}`} />
               <span className={`text-[9px] md:text-[10px] tracking-[0.2em] uppercase ${isError ? 'text-red-500 font-bold' : 'opacity-30'}`}>
                 {isError ? 'FATAL ERROR: ENTROPY OVERFLOW' : 'Entropy Status: Increasing...'}
               </span>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}