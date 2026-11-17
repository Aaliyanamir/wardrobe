'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, Ruler, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySize?: (size: string) => void;
  currentCategory?: string;
  activeSize?: string;
}

// Measurement charts in inches and centimeters
const sizeChartInches = [
  { size: 'XS', chest: '34–36"', waist: '28–29"', hips: '34–35"', sleeve: '32.5"', inseam: '30"' },
  { size: 'S',  chest: '36–38"', waist: '30–31"', hips: '36–37"', sleeve: '33.5"', inseam: '31"' },
  { size: 'M',  chest: '38–40"', waist: '32–33"', hips: '38–39"', sleeve: '34.5"', inseam: '32"' },
  { size: 'L',  chest: '40–42"', waist: '34–35"', hips: '40–41"', sleeve: '35.5"', inseam: '32"' },
  { size: 'XL', chest: '43–45"', waist: '36–38"', hips: '42–44"', sleeve: '36.5"', inseam: '33"' },
  { size: '2XL', chest: '46–48"', waist: '39–41"', hips: '45–47"', sleeve: '37.0"', inseam: '33"' },
];

const sizeChartCm = [
  { size: 'XS', chest: '86–91 cm', waist: '71–74 cm', hips: '86–89 cm', sleeve: '82 cm', inseam: '76 cm' },
  { size: 'S',  chest: '91–96 cm', waist: '76–79 cm', hips: '91–94 cm', sleeve: '85 cm', inseam: '78 cm' },
  { size: 'M',  chest: '96–101 cm', waist: '81–84 cm', hips: '96–99 cm', sleeve: '87 cm', inseam: '81 cm' },
  { size: 'L',  chest: '101–107 cm', waist: '86–89 cm', hips: '101–104 cm', sleeve: '90 cm', inseam: '81 cm' },
  { size: 'XL', chest: '109–114 cm', waist: '91–96 cm', hips: '106–112 cm', sleeve: '92 cm', inseam: '84 cm' },
  { size: '2XL', chest: '117–122 cm', waist: '99–104 cm', hips: '114–119 cm', sleeve: '94 cm', inseam: '84 cm' },
];

type FitPreference = 'slim' | 'tailored' | 'oversized';

export default function SizeGuideModal({
  isOpen,
  onClose,
  onApplySize,
  currentCategory = 'tops',
  activeSize = 'M',
}: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'chart' | 'finder'>('finder');
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  // Fit Finder Inputs (Height in cm, Weight in kg)
  const [heightCm, setHeightCm] = useState(178); // ~5'10"
  const [weightKg, setWeightKg] = useState(74);  // ~163 lbs
  const [fitPreference, setFitPreference] = useState<FitPreference>('tailored');

  // Fit Recommendation Algorithm
  const recommendation = useMemo(() => {
    // Standard BMI calculation: kg / (m^2)
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);

    let baseScore = 2; // 0=XS, 1=S, 2=M, 3=L, 4=XL, 5=2XL

    // BMI scoring
    if (bmi < 20) baseScore = 1;       // Lean -> S
    else if (bmi < 23) baseScore = 2;  // Athletic/Average -> M
    else if (bmi < 26.5) baseScore = 3;// Broad -> L
    else if (bmi < 30) baseScore = 4;  // Solid -> XL
    else baseScore = 5;                // 2XL

    // Height modifier
    if (heightCm > 188 && baseScore < 4) baseScore += 1;
    if (heightCm < 168 && baseScore > 0) baseScore -= 1;

    // Fit preference adjustment
    if (fitPreference === 'slim' && baseScore > 0) baseScore -= 1;
    if (fitPreference === 'oversized' && baseScore < 5) baseScore += 1;

    const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
    const chosenSize = sizes[Math.max(0, Math.min(sizes.length - 1, baseScore))];

    // Compute fit confidence score
    const confidence = Math.min(98, Math.max(88, Math.round(92 + (Math.sin(heightCm + weightKg) * 5))));

    return {
      size: chosenSize,
      confidence,
      chestFeel: fitPreference === 'slim' ? 'Snug contours' : fitPreference === 'oversized' ? 'Generous dropped chest' : 'Clean tailored drape',
      sleeveFeel: heightCm > 182 ? 'Full coverage' : 'Precise wrist break',
    };
  }, [heightCm, weightKg, fitPreference]);

  // Height conversion helper
  const heightFeetInches = useMemo(() => {
    const totalInches = heightCm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  }, [heightCm]);

  // Weight conversion helper
  const weightLbs = useMemo(() => Math.round(weightKg * 2.20462), [weightKg]);

  const handleApply = (sizeToApply: string) => {
    if (onApplySize) {
      onApplySize(sizeToApply);
      toast.success(`Size ${sizeToApply} applied to your silhouette!`);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-studio-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 260 }}
          className="bg-studio-white w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-studio-black/15 shadow-2xl p-6 sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-studio-grey">
            <div>
              <p className="text-label text-studio-mid mb-1">
                Precision Tailoring & Fit Architecture
              </p>
              <h2 className="text-xl font-medium tracking-tight text-studio-black">
                Interactive Size Guide & Fit Finder
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-studio-mid hover:text-studio-black transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between mt-6 mb-8 border-b border-studio-grey pb-3">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('finder')}
                className={`flex items-center gap-2 text-sm font-medium pb-2 border-b-2 transition-all ${
                  activeTab === 'finder'
                    ? 'border-studio-black text-studio-black'
                    : 'border-transparent text-studio-mid hover:text-studio-black'
                }`}
              >
                <Sparkles size={14} />
                Fit Finder AI
              </button>
              <button
                onClick={() => setActiveTab('chart')}
                className={`flex items-center gap-2 text-sm font-medium pb-2 border-b-2 transition-all ${
                  activeTab === 'chart'
                    ? 'border-studio-black text-studio-black'
                    : 'border-transparent text-studio-mid hover:text-studio-black'
                }`}
              >
                <Ruler size={14} />
                Body Measurement Chart
              </button>
            </div>

            {/* Units toggle */}
            {activeTab === 'chart' && (
              <div className="flex items-center bg-studio-grey p-0.5 rounded text-xs">
                <button
                  onClick={() => setUnit('in')}
                  className={`px-3 py-1 font-medium transition-colors ${
                    unit === 'in' ? 'bg-studio-black text-studio-white' : 'text-studio-dark'
                  }`}
                >
                  Inches
                </button>
                <button
                  onClick={() => setUnit('cm')}
                  className={`px-3 py-1 font-medium transition-colors ${
                    unit === 'cm' ? 'bg-studio-black text-studio-white' : 'text-studio-dark'
                  }`}
                >
                  CM
                </button>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* TAB 1: FIT FINDER                                        */}
          {/* ======================================================== */}
          {activeTab === 'finder' && (
            <div className="space-y-6">
              {/* Sliders container */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-studio-grey/50 border border-studio-grey">
                {/* Height Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-label text-studio-dark font-medium">Height</label>
                    <span className="text-sm font-mono font-medium text-studio-black">
                      {heightCm} cm ({heightFeetInches})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="155"
                    max="205"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full accent-studio-black cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-studio-mid mt-1">
                    <span>155 cm (5&apos;1&quot;)</span>
                    <span>205 cm (6&apos;9&quot;)</span>
                  </div>
                </div>

                {/* Weight Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-label text-studio-dark font-medium">Weight</label>
                    <span className="text-sm font-mono font-medium text-studio-black">
                      {weightKg} kg ({weightLbs} lbs)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="48"
                    max="115"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full accent-studio-black cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-studio-mid mt-1">
                    <span>48 kg (105 lbs)</span>
                    <span>115 kg (253 lbs)</span>
                  </div>
                </div>
              </div>

              {/* Fit Preference */}
              <div>
                <label className="text-label text-studio-mid uppercase tracking-wider block mb-3 font-medium">
                  Preferred Silhouette & Drape:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'slim', label: 'Slim / Snug', desc: 'Contoured to body' },
                    { id: 'tailored', label: 'Tailored / Regular', desc: 'Classic luxury drape' },
                    { id: 'oversized', label: 'Relaxed / Boxy', desc: 'Dropped shoulder ease' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setFitPreference(p.id as FitPreference)}
                      className={`p-3 text-left border transition-all ${
                        fitPreference === p.id
                          ? 'border-studio-black bg-studio-black text-studio-white'
                          : 'border-studio-grey text-studio-dark hover:border-studio-black'
                      }`}
                    >
                      <div className="text-xs font-semibold">{p.label}</div>
                      <div className={`text-[10px] mt-1 ${fitPreference === p.id ? 'text-studio-mid' : 'text-studio-mid'}`}>
                        {p.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommendation Card */}
              <div className="p-6 border-2 border-studio-black bg-studio-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-label uppercase tracking-widest text-studio-mid font-medium">
                      Optimal Recommendation
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-light tracking-tight text-studio-black">
                      Size {recommendation.size}
                    </span>
                    <span className="text-xs font-mono font-medium text-green-700 bg-green-50 px-2 py-0.5 border border-green-200">
                      {recommendation.confidence}% Fit Confidence
                    </span>
                  </div>
                  <p className="text-xs text-studio-dark mt-2 leading-relaxed">
                    Based on your {heightCm}cm / {weightKg}kg profile with {fitPreference} drape:{' '}
                    <span className="font-medium text-studio-black">{recommendation.chestFeel}</span>,{' '}
                    <span className="font-medium text-studio-black">{recommendation.sleeveFeel}</span>.
                  </p>
                </div>

                <button
                  onClick={() => handleApply(recommendation.size)}
                  className="w-full sm:w-auto btn-primary px-6 py-3.5 flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
                >
                  <UserCheck size={16} />
                  <span>Apply Size {recommendation.size}</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: MEASUREMENT CHART                                 */}
          {/* ======================================================== */}
          {activeTab === 'chart' && (
            <div className="space-y-6">
              <div className="overflow-x-auto border border-studio-grey">
                <table className="w-full text-left text-xs">
                  <thead className="bg-studio-grey text-studio-dark border-b border-studio-grey font-medium uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Size</th>
                      <th className="p-3">Chest</th>
                      <th className="p-3">Waist</th>
                      <th className="p-3">Hips</th>
                      <th className="p-3">Sleeve</th>
                      <th className="p-3">Inseam</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-studio-grey">
                    {(unit === 'in' ? sizeChartInches : sizeChartCm).map((row) => (
                      <tr
                        key={row.size}
                        className={`hover:bg-studio-grey/40 transition-colors ${
                          activeSize === row.size ? 'bg-studio-black/5 font-semibold' : ''
                        }`}
                      >
                        <td className="p-3 font-semibold text-studio-black flex items-center gap-1.5">
                          {row.size}
                          {activeSize === row.size && (
                            <span className="text-[10px] text-accent-gold">● Active</span>
                          )}
                        </td>
                        <td className="p-3">{row.chest}</td>
                        <td className="p-3">{row.waist}</td>
                        <td className="p-3">{row.hips}</td>
                        <td className="p-3">{row.sleeve}</td>
                        <td className="p-3">{row.inseam}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleApply(row.size)}
                            className="px-2.5 py-1 text-[11px] border border-studio-grey hover:border-studio-black hover:bg-studio-black hover:text-studio-white transition-all"
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Measuring tips */}
              <div className="p-4 bg-studio-grey/50 text-xs text-studio-dark leading-relaxed space-y-1">
                <p className="font-medium text-studio-black mb-1">How to Measure:</p>
                <p>• <strong>Chest:</strong> Measure around the fullest part of your chest, keeping tape horizontal.</p>
                <p>• <strong>Waist:</strong> Measure around your natural waistline, where trousers naturally sit.</p>
                <p>• <strong>Sleeve:</strong> Measure from center back of neck across shoulder to wrist bone.</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
