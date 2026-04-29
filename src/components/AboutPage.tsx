import { useState, useEffect, useRef, useCallback } from 'react';
import { Skull, RotateCcw } from 'lucide-react';

interface Enemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  type: 'imp' | 'demon' | 'baron';
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
}

export function AboutPage() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'levelup' | 'gameover'>('menu');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [ammo, setAmmo] = useState(100);
  
  const playerPos = useRef({ x: 300, y: 300 });
  const playerAngle = useRef(0);
  const enemies = useRef<Enemy[]>([]);
  const projectiles = useRef<Projectile[]>([]);
  const keys = useRef<{ [key: string]: boolean }>({});
  const gameLoopRef = useRef<number | null>(null);
  const lastSpawnRef = useRef(0);
  const [, forceRender] = useState({});

  const GAME_WIDTH = 600;
  const GAME_HEIGHT = 400;
  const PLAYER_SIZE = 15;

  const enemyTypes = {
    imp: { emoji: '👹', speed: 1.5, hp: 20, color: '#dc2626' },
    demon: { emoji: '😈', speed: 1.2, hp: 40, color: '#991b1b' },
    baron: { emoji: '👿', speed: 0.8, hp: 60, color: '#7f1d1d' }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keys.current[e.key.toLowerCase()] = true;
    if (e.key === ' ' && gameState === 'playing') {
      e.preventDefault();
    }
  }, [gameState]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keys.current[e.key.toLowerCase()] = false;
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const spawnEnemy = useCallback((time: number, levelNum: number) => {
    const spawnRate = Math.max(800, 1500 - levelNum * 200);
    if (time - lastSpawnRef.current > spawnRate && enemies.current.length < 3 + levelNum * 2) {
      const types: Array<'imp' | 'demon' | 'baron'> = levelNum > 3 ? ['imp', 'demon', 'baron'] : levelNum > 1 ? ['imp', 'demon'] : ['imp'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const angle = Math.random() * Math.PI * 2;
      const distance = 200;
      enemies.current.push({
        id: Math.random(),
        x: playerPos.current.x + Math.cos(angle) * distance,
        y: playerPos.current.y + Math.sin(angle) * distance,
        vx: 0,
        vy: 0,
        hp: enemyTypes[type].hp,
        type
      });
      lastSpawnRef.current = time;
    }
  }, []);

  const fireProjectile = useCallback(() => {
    if (ammo > 0) {
      projectiles.current.push({
        id: Math.random(),
        x: playerPos.current.x,
        y: playerPos.current.y,
        vx: Math.cos(playerAngle.current) * 6,
        vy: Math.sin(playerAngle.current) * 6,
        damage: 25
      });
      setAmmo(a => Math.max(0, a - 1));
    }
  }, [ammo]);

  const gameLoop = useCallback((time: number) => {
    if (gameState !== 'playing') return;

    // Player movement
    const speed = 2.5;
    if (keys.current['w'] || keys.current['arrowup']) playerPos.current.y = Math.max(PLAYER_SIZE, playerPos.current.y - speed);
    if (keys.current['s'] || keys.current['arrowdown']) playerPos.current.y = Math.min(GAME_HEIGHT - PLAYER_SIZE, playerPos.current.y + speed);
    if (keys.current['a'] || keys.current['arrowleft']) playerAngle.current -= 0.08;
    if (keys.current['d'] || keys.current['arrowright']) playerAngle.current += 0.08;
    
    // Shoot
    if (keys.current[' '] || keys.current['control']) {
      fireProjectile();
      keys.current[' '] = false;
      keys.current['control'] = false;
    }

    // Spawn enemies
    spawnEnemy(time, level);

    // Update projectiles
    projectiles.current = projectiles.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;

      let hit = false;
      enemies.current = enemies.current.map(e => {
        const dx = p.x - e.x;
        const dy = p.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 20) {
          hit = true;
          e.hp -= p.damage;
        }
        return e;
      });

      return !hit && p.x > -50 && p.x < GAME_WIDTH + 50 && p.y > -50 && p.y < GAME_HEIGHT + 50;
    });

    // Update enemies
    let playerDamage = 0;
    enemies.current = enemies.current.filter(e => {
      const dx = playerPos.current.x - e.x;
      const dy = playerPos.current.y - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0) {
        e.vx = (dx / dist) * enemyTypes[e.type].speed;
        e.vy = (dy / dist) * enemyTypes[e.type].speed;
      }
      
      e.x += e.vx;
      e.y += e.vy;

      if (dist < PLAYER_SIZE + 15) {
        playerDamage += 10;
      }

      return e.hp > 0;
    });

    // Remove dead enemies
    enemies.current.forEach(e => {
      if (e.hp <= 0) setScore(s => s + (e.type === 'baron' ? 100 : e.type === 'demon' ? 50 : 25));
    });
    enemies.current = enemies.current.filter(e => e.hp > 0);

    if (playerDamage > 0) {
      setHealth(h => {
        const newHealth = Math.max(0, h - playerDamage);
        if (newHealth === 0) {
          setGameState('gameover');
        }
        return newHealth;
      });
    }

    // Check level complete
    if (enemies.current.length === 0 && level > 1 && time > lastSpawnRef.current + 2000) {
      setGameState('levelup');
    }

    forceRender({});
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, level, fireProjectile, spawnEnemy]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return () => {
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      };
    }
  }, [gameState, gameLoop]);

  const startGame = () => {
    playerPos.current = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
    playerAngle.current = 0;
    enemies.current = [];
    projectiles.current = [];
    setLevel(1);
    setScore(0);
    setHealth(100);
    setAmmo(100);
    lastSpawnRef.current = performance.now();
    setGameState('playing');
  };

  const nextLevel = () => {
    enemies.current = [];
    projectiles.current = [];
    setLevel(l => l + 1);
    setHealth(100);
    setAmmo(100);
    lastSpawnRef.current = performance.now();
    setGameState('playing');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 py-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-red-600 mb-1 tracking-tight flex items-center justify-center gap-3">
          <Skull className="w-10 h-10 animate-pulse" />
          DOOM
        </h2>
        <p className="text-slate-400 text-sm">Código abierto desde 1999 • GPL License • id Software © 1993</p>
      </div>

      <div 
        className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-4 border-red-900 rounded-lg overflow-hidden shadow-2xl"
        style={{ 
          width: GAME_WIDTH, 
          height: GAME_HEIGHT,
          perspective: '1000px'
        }}
      >
        {/* Game Background */}
        <div className="absolute inset-0 bg-red-950/10" />
        
        {/* Player crosshair/center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-0.5 h-8 bg-red-500/50"></div>
          <div className="w-8 h-0.5 bg-red-500/50 absolute"></div>
          <div className="w-3 h-3 border-2 border-red-500/30 rounded-full absolute"></div>
        </div>

        {/* Projectiles */}
        {projectiles.current.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full z-10"
            style={{
              width: 8,
              height: 8,
              left: p.x - 4,
              top: p.y - 4,
              background: '#fbbf24',
              boxShadow: '0 0 12px rgba(251, 191, 36, 0.9), 0 0 6px rgba(251, 191, 36, 0.6)'
            }}
          />
        ))}

        {/* Enemies */}
        {enemies.current.map(e => (
          <div
            key={e.id}
            className="absolute text-3xl select-none z-5 transition-all"
            style={{
              left: e.x - 15,
              top: e.y - 15,
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.5 + (e.hp / (enemyTypes[e.type].hp * 2)),
              filter: `drop-shadow(0 0 8px ${enemyTypes[e.type].color})`
            }}
          >
            {enemyTypes[e.type].emoji}
          </div>
        ))}

        {/* Player weapon/body indicator */}
        <div 
          className="absolute z-15 text-3xl"
          style={{
            left: playerPos.current.x - 8,
            top: playerPos.current.y - 8,
            width: 16,
            height: 16,
            transform: `rotate(${playerAngle.current * 180 / Math.PI}deg)`,
            transition: 'none'
          }}
        >
          💛
        </div>

        {/* UI HUD */}
        {gameState === 'playing' && (
          <div className="absolute inset-0 pointer-events-none z-30 p-3 font-mono text-xs text-red-400">
            <div className="flex justify-between">
              <div className="bg-slate-900/70 px-2 py-1 rounded border border-red-700">
                HEALTH: {health}
              </div>
              <div className="bg-slate-900/70 px-2 py-1 rounded border border-red-700">
                AMMO: {ammo}
              </div>
              <div className="bg-slate-900/70 px-2 py-1 rounded border border-red-700">
                LV: {level}
              </div>
            </div>
            <div className="mt-auto pt-20 text-center">
              <div className="bg-slate-900/70 px-2 py-1 rounded border border-red-700 inline-block">
                SCORE: {score}
              </div>
            </div>
          </div>
        )}

        {/* Menu/GameOver Overlay */}
        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-50 gap-4 p-6 text-center">
            {gameState === 'menu' && (
              <>
                <h3 className="text-red-500 text-2xl font-bold uppercase">Bienvenido a Doom</h3>
                <p className="text-slate-300 text-sm">El primer FPS legendario</p>
                <button
                  onClick={startGame}
                  className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-bold flex items-center gap-2 transition-all"
                >
                  <RotateCcw size={16} />
                  Iniciar Juego
                </button>
              </>
            )}
            {gameState === 'gameover' && (
              <>
                <h3 className="text-red-600 text-3xl font-bold uppercase animate-pulse">MUERTO</h3>
                <p className="text-slate-300">Nivel: {level} | Score: {score}</p>
                <button
                  onClick={startGame}
                  className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-bold transition-all"
                >
                  Reintentar
                </button>
              </>
            )}
            {gameState === 'levelup' && (
              <>
                <h3 className="text-green-500 text-2xl font-bold uppercase">¡NIVEL COMPLETADO!</h3>
                <p className="text-slate-300">Score: {score}</p>
                <button
                  onClick={nextLevel}
                  className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold transition-all"
                >
                  Siguiente Nivel
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="text-center text-slate-400 text-xs max-w-2xl">
        <p className="font-bold mb-2">🎮 CONTROLES:</p>
        <p>W/↑ Arriba • S/↓ Abajo • A/← Girar Izq • D/→ Girar Der • ESPACIO/CTRL Disparar</p>
      </div>
    </div>
  );
}