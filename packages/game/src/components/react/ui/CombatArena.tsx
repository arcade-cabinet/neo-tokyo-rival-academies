import type { CombatAction } from '@neo-tokyo/core';
import { useCombatStore } from '@neo-tokyo/core';
import { useEffect, useState } from 'react';

export function CombatArena() {
  const { inCombat, phase, player, enemies, combatLog, playerAction, enemyTurn, endCombat } =
    useCombatStore();

  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [showVictory, setShowVictory] = useState(false);
  const [showDefeat, setShowDefeat] = useState(false);

  // Auto-select first enemy
  useEffect(() => {
    if (enemies.length > 0 && !selectedTargetId) {
      setSelectedTargetId(enemies[0].id);
    }
  }, [enemies, selectedTargetId]);

  // Auto-execute enemy turn after player action
  useEffect(() => {
    if (phase === 'enemy_turn') {
      const timer = setTimeout(() => {
        enemyTurn();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, enemyTurn]);

  // Show victory/defeat screens
  useEffect(() => {
    if (phase === 'victory') {
      setShowVictory(true);
    } else if (phase === 'defeat') {
      setShowDefeat(true);
    }
  }, [phase]);

  if (!inCombat || !player) return null;

  const handleAction = (actionType: 'attack' | 'defend') => {
    if (phase !== 'player_turn' || !selectedTargetId) return;

    const action: CombatAction = { type: actionType };
    playerAction(action, selectedTargetId);
  };

  const handleVictoryContinue = () => {
    setShowVictory(false);
    endCombat();
  };

  const handleDefeatReload = () => {
    setShowDefeat(false);
    endCombat();
    // TODO: Trigger reload from save
  };

  // Get latest combat log entry
  const latestLog = combatLog.length > 0 ? combatLog[combatLog.length - 1] : null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 1000,
        fontFamily: '"M PLUS 1", sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Victory Screen */}
      {showVictory && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(4, 4, 6, 0.98)',
              border: '2px solid #10b981',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              maxWidth: '400px',
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏆</div>
            <h2 style={{ fontSize: '32px', color: '#10b981', margin: '0 0 20px 0' }}>VICTORY!</h2>
            <button
              type="button"
              onClick={handleVictoryContinue}
              style={{
                backgroundColor: '#10b981',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                padding: '14px 28px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Defeat Screen */}
      {showDefeat && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(4, 4, 6, 0.98)',
              border: '2px solid #ef4444',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              maxWidth: '400px',
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>💀</div>
            <h2 style={{ fontSize: '32px', color: '#ef4444', margin: '0 0 20px 0' }}>DEFEATED</h2>
            <button
              type="button"
              onClick={handleDefeatReload}
              style={{
                backgroundColor: '#ef4444',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                padding: '14px 28px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Reload Save
            </button>
          </div>
        </div>
      )}

      {/* Combat Header */}
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid #334155',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
        }}
      >
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
          TURN {useCombatStore.getState().turn}
        </div>
        <div style={{ fontSize: '18px', color: '#0ea5e9', fontWeight: 'bold' }}>
          {phase === 'player_turn' ? 'Your Turn' : phase === 'enemy_turn' ? 'Enemy Turn' : 'Combat'}
        </div>
      </div>

      {/* Combat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
        {/* Player Section */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>PLAYER</div>
          <div
            style={{
              backgroundColor: 'rgba(14, 165, 233, 0.1)',
              border: '2px solid #0ea5e9',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '16px', color: '#e2e8f0', fontWeight: 'bold' }}>
                {player.name}
              </span>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                {player.currentHP} / {player.maxHP} HP
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#334155',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(player.currentHP / player.maxHP) * 100}%`,
                  height: '100%',
                  backgroundColor: '#0ea5e9',
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        </div>

        {/* Enemies Section */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>ENEMIES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {enemies.map((enemy) => (
              <button
                type="button"
                key={enemy.id}
                onClick={() => setSelectedTargetId(enemy.id)}
                style={{
                  backgroundColor:
                    selectedTargetId === enemy.id
                      ? 'rgba(239, 68, 68, 0.2)'
                      : 'rgba(239, 68, 68, 0.1)',
                  border: '2px solid',
                  borderColor: selectedTargetId === enemy.id ? '#ef4444' : '#7f1d1d',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}
                >
                  <span style={{ fontSize: '16px', color: '#e2e8f0', fontWeight: 'bold' }}>
                    {enemy.name}
                  </span>
                  <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                    {enemy.currentHP} / {enemy.maxHP} HP
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#334155',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${(enemy.currentHP / enemy.maxHP) * 100}%`,
                      height: '100%',
                      backgroundColor: '#ef4444',
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Combat Log */}
        {latestLog && (
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontSize: '14px', color: '#cbd5e1' }}>
              {latestLog.hit ? (
                <>
                  <span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>
                    {latestLog.attackerName}
                  </span>{' '}
                  attacks{' '}
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                    {latestLog.defenderName}
                  </span>{' '}
                  for{' '}
                  <span
                    style={{
                      color: latestLog.critical ? '#f59e0b' : '#e2e8f0',
                      fontWeight: 'bold',
                    }}
                  >
                    {latestLog.damage}
                  </span>{' '}
                  damage{latestLog.critical && ' (CRITICAL!)'}
                </>
              ) : (
                <>
                  <span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>
                    {latestLog.attackerName}
                  </span>
                  's attack missed!
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div
        style={{
          padding: '20px',
          borderTop: '1px solid #334155',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          display: 'flex',
          gap: '12px',
        }}
      >
        <button
          type="button"
          onClick={() => handleAction('attack')}
          disabled={phase !== 'player_turn'}
          style={{
            flex: 1,
            backgroundColor: phase === 'player_turn' ? '#ef4444' : '#334155',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: phase === 'player_turn' ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            opacity: phase === 'player_turn' ? 1 : 0.5,
          }}
        >
          ⚔️ Attack
        </button>
        <button
          type="button"
          onClick={() => handleAction('defend')}
          disabled={phase !== 'player_turn'}
          style={{
            flex: 1,
            backgroundColor: phase === 'player_turn' ? '#3b82f6' : '#334155',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: phase === 'player_turn' ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            opacity: phase === 'player_turn' ? 1 : 0.5,
          }}
        >
          🛡️ Defend
        </button>
      </div>
    </div>
  );
}
