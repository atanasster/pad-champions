import React, { useState } from 'react';
import { Activity, X, Stethoscope, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

type Zone = 'none' | 'iliac' | 'femoral' | 'popliteal' | 'tibial';
type Severity = 'mild' | 'moderate' | 'severe';

const severityInfo = {
  mild: {
    label: 'Mild Stenosis',
    pct: '< 50% Blockage',
    symptoms: [
      'Often asymptomatic (no pain)',
      'Mild claudication only after walking long distances',
      'Ankle-Brachial Index (ABI): 0.7 - 0.9',
    ],
    implication: 'Manageable with exercise therapy and smoking cessation.',
    visualColor: '#facc15', // Yellow
    visualWidth: 2,
    visualOpacity: 0.6,
  },
  moderate: {
    label: 'Moderate Stenosis',
    pct: '50-75% Blockage',
    symptoms: [
      'Classic Claudication: Calf pain after walking 1-2 blocks',
      'Pain resolves quickly with rest',
      'Hair loss on legs, brittle toenails',
      'Ankle-Brachial Index (ABI): 0.5 - 0.7',
    ],
    implication: 'Limits quality of life. Medical management or angioplasty may be needed.',
    visualColor: '#f97316', // Orange
    visualWidth: 5,
    visualOpacity: 0.85,
  },
  severe: {
    label: 'Severe Occlusion',
    pct: '> 75% to Total Blockage',
    symptoms: [
      'Critical Limb Ischemia (CLI)',
      'Rest Pain: Burning in feet while lying in bed',
      'Ischemic ulcers (open sores) or gangrene',
      'Ankle-Brachial Index (ABI): < 0.4',
    ],
    implication: 'Limb-threatening emergency. Requires revascularization surgery.',
    visualColor: '#ef4444', // Red
    visualWidth: 8,
    visualOpacity: 1,
  },
};

const BlockageVisual: React.FC<{
  type: 'circle' | 'path';
  cx?: number;
  cy?: number;
  d?: string;
  severity: Severity;
}> = ({ type, cx, cy, d, severity }) => {
  const currentSeverity = severityInfo[severity];

  if (type === 'circle' && cx && cy) {
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={currentSeverity.visualWidth}
          fill={currentSeverity.visualColor}
          opacity={currentSeverity.visualOpacity}
          className="transition-all duration-500"
        />
        {/* Turbulent flow lines if severe */}
        {severity === 'severe' && (
          <circle
            cx={cx}
            cy={cy}
            r={currentSeverity.visualWidth + 4}
            stroke={currentSeverity.visualColor}
            strokeWidth="1"
            fill="none"
            opacity="0.5"
            className="animate-ping"
          />
        )}
      </g>
    );
  }

  if (type === 'path' && d) {
    return (
      <path
        d={d}
        stroke={currentSeverity.visualColor}
        strokeWidth={currentSeverity.visualWidth}
        strokeLinecap="round"
        fill="none"
        opacity={currentSeverity.visualOpacity}
        className="transition-all duration-500"
      />
    );
  }
  return null;
};

const SeveritySelector: React.FC<{
  severity: Severity;
  setSeverity: (s: Severity) => void;
}> = ({ severity, setSeverity }) => (
  <div className="flex gap-1 bg-slate-100 p-1 rounded-lg mb-6">
    {(['mild', 'moderate', 'severe'] as Severity[]).map((s) => (
      <button
        key={s}
        onClick={() => setSeverity(s)}
        className={cn(
          'flex-1 py-1.5 px-2 text-xs font-bold rounded-md capitalize transition-all',
          severity === s
            ? s === 'mild'
              ? 'bg-yellow-100 text-yellow-800 shadow-xs border border-yellow-200'
              : s === 'moderate'
                ? 'bg-orange-100 text-orange-800 shadow-xs border border-orange-200'
                : 'bg-red-100 text-red-900 shadow-xs border border-red-200'
            : 'text-slate-500 hover:bg-slate-200',
        )}
      >
        {s}
      </button>
    ))}
  </div>
);

const InteractivePADExplorer: React.FC = () => {
  const [activeZone, setActiveZone] = useState<Zone>('none');
  const [severity, setSeverity] = useState<Severity>('moderate');

  const handleZoneClick = (zone: Zone) => {
    setActiveZone(activeZone === zone ? 'none' : zone);
  };

  // Content for different states
  const getContent = () => {
    const baseInfo = {
      iliac: {
        title: 'Iliac Artery',
        location: 'Pelvis / Lower Abdomen',
        anatomy:
          'The Common Iliac arteries branch off from the abdominal aorta. They divide into the Internal Iliac (supplying pelvic organs) and External Iliac (becoming the Femoral artery).',
        description:
          'Blockages here reduce blood flow to the entire leg. This is a proximal blockage, meaning it affects everything downstream.',
      },
      femoral: {
        title: 'Femoral Artery',
        location: 'Thigh',
        anatomy:
          'The Common Femoral artery divides into the Deep Femoral (Profunda) and Superficial Femoral Artery (SFA). The SFA runs down the thigh and is the most common site for PAD plaque buildup.',
        description:
          "Narrowing in the SFA is the classic cause of calf claudication. The artery passes through the 'Hunter's canal', a tight space prone to compression.",
      },
      popliteal: {
        title: 'Popliteal Artery',
        location: 'Knee (Behind the joint)',
        anatomy:
          'As the SFA passes behind the knee, it becomes the Popliteal artery. It supplies the knee joint and splits into the lower leg arteries.',
        description:
          'This artery is subject to constant bending and flexing. It is susceptible to plaque, aneurysms (ballooning), and entrapment syndromes.',
      },
      tibial: {
        title: 'Tibial Arteries',
        location: 'Calf / Lower Leg',
        anatomy:
          'Below the knee, the Popliteal splits into the Anterior Tibial, Posterior Tibial, and Peroneal arteries. These run to the ankle and foot.',
        description:
          'Disease here is often diffuse and calcified, particularly common in patients with diabetes or kidney disease (ESRD). It is the leading cause of non-healing foot ulcers.',
      },
    };

    if (activeZone === 'none') return null;

    return {
      ...baseInfo[activeZone],
      stage: severityInfo[severity],
    };
  };

  const content = getContent();
  const stage = content?.stage;

  return (
    <Card className="my-8 overflow-hidden border-slate-200 shadow-xl scroll-mt-20">
      <CardHeader className="bg-slate-50 border-b border-slate-200 pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="text-brand-red h-6 w-6" />
              Interactive PAD Anatomy Explorer
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Select an artery zone and adjust the severity level to visualize blockage stages.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-brand-dark text-brand-dark bg-white">
              3D Map
            </Badge>
            <Badge
              variant="outline"
              className="border-brand-red text-brand-red bg-red-50 animate-pulse"
            >
              Live Simulation
            </Badge>
          </div>
        </div>
      </CardHeader>

      <div className="flex flex-col lg:flex-row bg-slate-950 min-h-[700px]">
        {/* CSS for animations */}
        <style>{`
            @keyframes flow {
                0% { stroke-dashoffset: 20; }
                100% { stroke-dashoffset: 0; }
            }
            .blood-flow {
                stroke-dasharray: 4 4;
                animation: flow 1s linear infinite;
            }
            .pulse-marker {
                transform-origin: center;
                animation: pulse-marker 2s infinite;
            }
            @keyframes pulse-marker {
                0% { transform: scale(1); opacity: 0.8; stroke-width: 2px; }
                50% { transform: scale(1.3); opacity: 0.4; stroke-width: 1px;}
                100% { transform: scale(1); opacity: 0.8; stroke-width: 2px;}
            }
            .artery-glow {
                filter: drop-shadow(0 0 2px rgba(239, 68, 68, 0.5));
            }
        `}</style>

        {/* Interactive SVG Area */}
        <div className="relative flex-1 flex items-center justify-center p-4 bg-linear-to-b from-slate-900 to-slate-950 overflow-hidden">
          {/* Legend Overlay */}
          <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-md p-4 rounded-lg border border-white/10 text-xs text-white shadow-lg pointer-events-none">
            <h4 className="font-bold mb-2 uppercase tracking-wider text-slate-400">Map Legend</h4>
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-red-600 rounded-full mr-2 shadow-[0_0_5px_rgba(220,38,38,0.8)]"></div>{' '}
              Healthy Artery
            </div>
            <div className="flex items-center mb-2">
              {/* Gradient/Color for plaque */}
              <div className="w-3 h-3 bg-linear-to-r from-yellow-400 to-red-500 rounded-full mr-2"></div>{' '}
              Plaque / Stenosis
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full border border-white mr-2 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
              Selectable Zone
            </div>
          </div>

          <svg
            viewBox="0 0 400 700"
            className="w-full h-full max-h-[700px] drop-shadow-2xl"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
                <stop offset="20%" stopColor="#334155" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#475569" stopOpacity="0.7" />
                <stop offset="80%" stopColor="#334155" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#1e293b" stopOpacity="0.4" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Realistic Body Silhouette */}
            <path
              d="
                M 130,50 
                C 100,55 80,100 80,150  
                C 80,220 90,250 95,350 
                C 98,400 105,450 110,480
                C 112,520 115,580 115,600
                C 115,650 100,680 130,690 
                L 155,690
                C 170,680 160,650 160,600
                C 160,550 170,450 185,350
                L 200,300
                L 215,350
                C 230,450 240,550 240,600
                C 240,650 230,680 245,690
                L 270,690
                C 300,680 285,650 285,600
                C 285,580 288,520 290,480
                C 295,450 302,400 305,350
                C 310,250 320,220 320,150
                C 320,100 300,55 270,50
                Z"
              fill="url(#bodyGradient)"
              stroke="#475569"
              strokeWidth="1"
            />

            {/* --- Arterial System --- */}

            {/* Abdominal Aorta */}
            <path
              d="M 200,50 L 200,160"
              stroke="#991b1b"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 200,50 L 200,160"
              stroke="#ef4444"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className="artery-glow"
            />

            {/* Bifurcation */}
            <path
              d="M 200,158 Q 200,170 230,190"
              stroke="#991b1b"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 200,158 Q 200,170 170,190"
              stroke="#991b1b"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />

            {/* Right Leg Arteries (Visual Left) */}
            {/* Iliac */}
            <path
              d="M 200,160 Q 170,180 160,210"
              stroke="#ef4444"
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
              className="artery-glow"
            />

            {/* Femoral (Common -> Superficial) */}
            <path
              d="M 160,210 C 155,240 165,350 160,400"
              stroke="#ef4444"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              className="artery-glow"
            />

            {/* Popliteal (Behind Knee) */}
            <path
              d="M 160,400 C 158,430 158,450 155,480"
              stroke="#ef4444"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              className="artery-glow"
            />

            {/* Tibial (Lower Leg branching) */}
            <path
              d="M 155,480 L 145,600 L 145,650"
              stroke="#ef4444"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              className="artery-glow"
            />
            <path
              d="M 155,480 L 165,600 L 160,650"
              stroke="#ef4444"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              className="artery-glow"
            />

            {/* Left Leg Arteries (Visual Right) */}
            {/* Iliac */}
            <path
              d="M 200,160 Q 230,180 240,210"
              stroke="#ef4444"
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
              className="artery-glow"
            />

            {/* Femoral */}
            <path
              d="M 240,210 C 245,240 235,350 240,400"
              stroke="#ef4444"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              className="artery-glow"
            />

            {/* Popliteal */}
            <path
              d="M 240,400 C 242,430 242,450 245,480"
              stroke="#ef4444"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              className="artery-glow"
            />

            {/* Tibial */}
            <path
              d="M 245,480 L 255,600 L 255,650"
              stroke="#ef4444"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              className="artery-glow"
            />
            <path
              d="M 245,480 L 235,600 L 240,650"
              stroke="#ef4444"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              className="artery-glow"
            />

            {/* --- Blood Flow Animation (White Dashes) --- */}
            <g opacity="0.4">
              <path
                d="M 200,60 L 200,160"
                stroke="white"
                strokeWidth="2"
                fill="none"
                className="blood-flow"
              />
              {/* Right Leg Flow */}
              <path
                d="M 200,160 Q 170,180 160,210 C 155,240 165,350 160,400 C 158,430 158,450 155,480 L 145,600"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
                className="blood-flow"
              />
              {/* Left Leg Flow */}
              <path
                d="M 200,160 Q 230,180 240,210 C 245,240 235,350 240,400 C 242,430 242,450 245,480 L 255,600"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
                className="blood-flow"
              />
            </g>

            {/* --- Pathology Visuals (Blockage/Stenosis) --- */}
            {/* We overlay these based on active zone + severity, or show default 'mild' static ones if inactive */}

            {/* Iliac Blockage (Left Common Iliac) */}
            <g className={activeZone === 'iliac' ? 'block' : 'opacity-30'}>
              {activeZone === 'iliac' ? (
                <BlockageVisual type="path" d="M 225,185 Q 230,190 235,195" severity={severity} />
              ) : (
                <path
                  d="M 225,185 Q 230,190 235,195"
                  stroke="#facc15"
                  strokeWidth="2"
                  fill="none"
                />
              )}
            </g>

            {/* Femoral Blockage (Right SFA) */}
            <g className={activeZone === 'femoral' ? 'block' : 'opacity-30'}>
              {activeZone === 'femoral' ? (
                <BlockageVisual type="path" d="M 158,280 L 158,320" severity={severity} />
              ) : (
                <path d="M 158,280 L 158,320" stroke="#facc15" strokeWidth="2" fill="none" />
              )}
            </g>

            {/* Popliteal Blockage (Left) */}
            <g className={activeZone === 'popliteal' ? 'block' : 'opacity-30'}>
              {activeZone === 'popliteal' ? (
                <BlockageVisual type="circle" cx={242} cy={420} severity={severity} />
              ) : (
                <circle cx={242} cy={420} r={2} fill="#facc15" />
              )}
            </g>

            {/* Tibial Blockage (Right Anterior Tibial) */}
            <g className={activeZone === 'tibial' ? 'block' : 'opacity-30'}>
              {activeZone === 'tibial' ? (
                <BlockageVisual type="path" d="M 145,550 L 145,580" severity={severity} />
              ) : (
                <path d="M 145,550 L 145,580" stroke="#facc15" strokeWidth="1.5" />
              )}
            </g>

            {/* --- Interactive Click Zones --- */}

            {/* Iliac Zone Button */}
            <g
              onClick={() => handleZoneClick('iliac')}
              className="cursor-pointer group"
              style={{ opacity: activeZone === 'iliac' ? 1 : 0.7 }}
            >
              <circle cx="230" cy="190" r="30" fill="transparent" />
              <circle
                cx="230"
                cy="190"
                r="20"
                className={activeZone === 'iliac' ? '' : 'pulse-marker'}
                fill="none"
                stroke="white"
                strokeWidth="1.5"
              />
              <circle
                cx="230"
                cy="190"
                r="6"
                fill={
                  activeZone === 'iliac'
                    ? severityInfo[severity].visualColor
                    : 'rgba(255,255,255,0.2)'
                }
                stroke="white"
                strokeWidth="2"
                className="transition-all duration-300"
              />
              {activeZone === 'iliac' && (
                <line
                  x1="230"
                  y1="190"
                  x2="300"
                  y2="190"
                  stroke="white"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              )}
            </g>

            {/* Femoral Zone Button */}
            <g
              onClick={() => handleZoneClick('femoral')}
              className="cursor-pointer group"
              style={{ opacity: activeZone === 'femoral' ? 1 : 0.7 }}
            >
              <circle cx="158" cy="300" r="35" fill="transparent" />
              <circle
                cx="158"
                cy="300"
                r="25"
                className={activeZone === 'femoral' ? '' : 'pulse-marker'}
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                style={{ animationDelay: '0.5s' }}
              />
              <circle
                cx="158"
                cy="300"
                r="6"
                fill={
                  activeZone === 'femoral'
                    ? severityInfo[severity].visualColor
                    : 'rgba(255,255,255,0.2)'
                }
                stroke="white"
                strokeWidth="2"
                className="transition-all duration-300"
              />
            </g>

            {/* Popliteal Zone Button */}
            <g
              onClick={() => handleZoneClick('popliteal')}
              className="cursor-pointer group"
              style={{ opacity: activeZone === 'popliteal' ? 1 : 0.7 }}
            >
              <circle cx="242" cy="420" r="30" fill="transparent" />
              <circle
                cx="242"
                cy="420"
                r="22"
                className={activeZone === 'popliteal' ? '' : 'pulse-marker'}
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                style={{ animationDelay: '1s' }}
              />
              <circle
                cx="242"
                cy="420"
                r="6"
                fill={
                  activeZone === 'popliteal'
                    ? severityInfo[severity].visualColor
                    : 'rgba(255,255,255,0.2)'
                }
                stroke="white"
                strokeWidth="2"
                className="transition-all duration-300"
              />
            </g>

            {/* Tibial Zone Button */}
            <g
              onClick={() => handleZoneClick('tibial')}
              className="cursor-pointer group"
              style={{ opacity: activeZone === 'tibial' ? 1 : 0.7 }}
            >
              <circle cx="145" cy="565" r="25" fill="transparent" />
              <circle
                cx="145"
                cy="565"
                r="18"
                className={activeZone === 'tibial' ? '' : 'pulse-marker'}
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                style={{ animationDelay: '1.5s' }}
              />
              <circle
                cx="145"
                cy="565"
                r="6"
                fill={
                  activeZone === 'tibial'
                    ? severityInfo[severity].visualColor
                    : 'rgba(255,255,255,0.2)'
                }
                stroke="white"
                strokeWidth="2"
                className="transition-all duration-300"
              />
            </g>
          </svg>
        </div>

        {/* Info Sidebar */}
        <div className="lg:w-[450px] flex flex-col border-l border-slate-800 bg-white">
          {activeZone === 'none' ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-60">
              <Stethoscope className="w-20 h-20 text-slate-300 mb-6" />
              <h4 className="text-2xl text-slate-800 font-serif font-bold mb-4">
                Select an Artery
              </h4>
              <p className="text-slate-600 text-lg leading-relaxed max-w-xs">
                Click the pulsating markers on the anatomy map to view specific details about PAD in
                that region.
              </p>
            </div>
          ) : (
            <>
              <div className="p-8 border-b border-slate-100 bg-slate-50 transition-all duration-300 animate-in fade-in">
                <div className="flex items-center justify-between mb-4">
                  <Badge
                    variant="secondary"
                    className="bg-white border-slate-200 text-slate-600 px-3 py-1 text-xs"
                  >
                    Anatomy Focus
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveZone('none')}
                    className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <h3 className="text-3xl font-bold font-serif text-brand-dark mb-1">
                  {content?.title}
                </h3>
                <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">
                  {content?.location}
                </p>

                <div className="text-sm text-slate-700 space-y-3 leading-relaxed">
                  <p>
                    <strong>Anatomy:</strong> {content?.anatomy}
                  </p>
                  <p>
                    <strong>Pathology:</strong> {content?.description}
                  </p>
                </div>
              </div>

              <div className="p-8 grow bg-white flex flex-col animate-in slide-in-from-bottom-4 duration-500">
                <h4 className="flex items-center text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
                  <Activity className="w-4 h-4 mr-2 text-brand-red" />
                  Disease Severity
                </h4>

                <SeveritySelector severity={severity} setSeverity={setSeverity} />

                {stage && (
                  <div
                    className={`mt-2 rounded-xl border p-5 ${
                      severity === 'mild'
                        ? 'bg-yellow-50 border-yellow-200'
                        : severity === 'moderate'
                          ? 'bg-orange-50 border-orange-200'
                          : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h5
                        className={`font-bold text-lg ${
                          severity === 'mild'
                            ? 'text-yellow-900'
                            : severity === 'moderate'
                              ? 'text-orange-900'
                              : 'text-red-900'
                        }`}
                      >
                        {stage.label}
                      </h5>
                      <Badge
                        className={`${
                          severity === 'mild'
                            ? 'bg-yellow-200 text-yellow-900'
                            : severity === 'moderate'
                              ? 'bg-orange-200 text-orange-900'
                              : 'bg-red-200 text-red-900'
                        } hover:none border-none`}
                      >
                        {stage.pct}
                      </Badge>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {stage.symptoms.map((s, i) => (
                        <li key={i} className="flex items-start text-sm text-slate-800">
                          <ChevronRight className="w-4 h-4 mr-2 shrink-0 mt-0.5 opacity-50" />
                          {s}
                        </li>
                      ))}
                    </ul>

                    <div className="pt-4 border-t border-black/5">
                      <p className="text-xs font-bold uppercase text-slate-500 mb-1">
                        Clinical Implication
                      </p>
                      <p className="text-sm font-medium text-slate-900 italic">
                        "{stage.implication}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default InteractivePADExplorer;
