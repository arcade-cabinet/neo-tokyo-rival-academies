import type { FC } from 'react';

interface MainMenuProps {
  onStart: () => void;
}

export const MainMenu: FC<MainMenuProps> = ({ onStart }) => {
  return (
    <>
      <style>{`
        @keyframes glitch {
          0% { transform: skewX(-10deg); text-shadow: 3px 3px 0px #f00, -3px -3px 0px #500; }
          20% { transform: skewX(-10deg) translate(-2px, 2px); text-shadow: -3px 3px 0px #f00, 3px -3px 0px #500; }
          40% { transform: skewX(-10deg) translate(-2px, -2px); text-shadow: 3px -3px 0px #f00, -3px 3px 0px #500; }
          60% { transform: skewX(-10deg) translate(2px, 2px); text-shadow: -3px -3px 0px #f00, 3px 3px 0px #500; }
          80% { transform: skewX(-10deg) translate(2px, -2px); text-shadow: 3px 3px 0px #f00, -3px -3px 0px #500; }
          100% { transform: skewX(-10deg); text-shadow: 3px 3px 0px #f00, -3px -3px 0px #500; }
        }
        .title-glitch {
           animation: glitch 2.5s infinite steps(2);
        }
        .menu-btn {
          background: rgba(0,0,0,0.5);
          border: 2px solid #fff;
          color: #fff;
          padding: 15px 40px;
          margin: 10px;
          font-family: monospace;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.2s;
          transform: skewX(-10deg);
        }
        .menu-btn:hover {
          background: #f00;
          border-color: #f00;
          box-shadow: 5px 5px 0px #fff;
          transform: skewX(-10deg) scale(1.1);
        }
        .story-text {
            background: rgba(0,0,0,0.8);
            border-left: 4px solid #f00;
            padding: 20px;
            max-width: 600px;
            margin-bottom: 30px;
            font-family: monospace;
            color: #0ff;
            text-shadow: 0 0 5px #0ff;
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(5, 2, 2, 0.4)', // More transparent to see 3D bg
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
        }}
      >
        <h1
          className="title-glitch"
          style={{
            color: '#fff',
            fontSize: '5rem',
            margin: '0 0 20px 0',
            textAlign: 'center',
            fontStyle: 'italic',
            textShadow: '3px 3px 0px #f00, -3px -3px 0px #500',
            transform: 'skewX(-10deg)',
            lineHeight: 0.9,
          }}
        >
          NEO-TOKYO
          <br />
          <span style={{ fontSize: '3rem', color: '#f00' }}>RIVAL ACADEMIES</span>
        </h1>

        <div className="story-text">
          <p style={{ margin: 0 }}>
            &gt; DATE: 2084.11.02
            <br />
            &gt; LOCATION: SECTOR 7 (OLD SHIBUYA)
            <br />
            &gt; MISSION: MIDNIGHT EXAM
            <br />
            <br />
            The rivalry between Kurenai High and Azure Tech has reached boiling point. Pass the exam
            by outrunning the competition while fighting off the local Yakuza and Biker Gangs
            controlling the rooftops.
          </p>
        </div>

        <button type="button" onClick={onStart} className="menu-btn">
          INITIATE STORY MODE
        </button>

        <button type="button" className="menu-btn" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
          ARCHIVES [LOCKED]
        </button>
      </div>
    </>
  );
};
