import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  Camera,
  Search,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  Stethoscope,
  Sparkles,
  AlertCircle,
  Clock,
  HeartHandshake,
  CheckCircle2,
  Sliders,
  MapPin,
  Star,
  Layers,
  ChevronRight,
  Shield,
  Zap,
  Info,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedDisorder, setSelectedDisorder] = useState<number>(0);

  const disorders = [
    {
      title: 'Leukoplakia',
      abbr: 'LP',
      tag: 'Pre-cancerous White Patch',
      risk: 'Medium to High Risk',
      riskColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
      description: 'Predominantly white lesions of the oral mucosa that cannot be characterized as any other definable lesion. Highly linked with chewable tobacco and chronic irritation.',
      keySigns: ['Non-wipeable thick white patches', 'Rough, corrugated mucosal surface', 'Common on tongue borders & buccal mucosa'],
      biomarker: 'Keratinization & cellular dysplasia'
    },
    {
      title: 'Erythroplakia',
      abbr: 'EP',
      tag: 'Pre-cancerous Red Patch',
      risk: 'Highest Transformation Risk (>85%)',
      riskColor: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
      description: 'Fiery red, velvety patches of the mucous membrane. Clinically significant due to high occurrence of severe epithelial dysplasia or carcinoma in situ.',
      keySigns: ['Bright crimson velvety plaques', 'Bleeds easily on gentle palpation', 'Often on floor of mouth and soft palate'],
      biomarker: 'Submucosal vascularity & severe atypia'
    },
    {
      title: 'Oral Submucous Fibrosis',
      abbr: 'OSMF',
      tag: 'Fibrotic Collagen Disorder',
      risk: 'Progressive Debilitating Risk',
      riskColor: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800',
      description: 'Debilitating condition triggered by Areca nut / Gutkha chewing. Characterized by dense collagen deposition leading to trismus (restricted mouth opening).',
      keySigns: ['Intense burning sensation with spices', 'Blanched marble-white fibrous bands', 'Progressive loss of mouth opening (<3 fingers)'],
      biomarker: 'Excessive collagen cross-linking'
    },
    {
      title: 'Oral Lichen Planus',
      abbr: 'OLP',
      tag: 'Chronic Inflammatory Mucosa',
      risk: 'Low to Moderate Risk',
      riskColor: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800',
      description: 'T-cell mediated chronic autoimmune disease affecting oral epithelium, manifesting in lace-like Wickham striae or painful erosions.',
      keySigns: ['Lace-like white reticular lines', 'Bilateral buccal mucosa involvement', 'Chronic soreness and mucosal sensitivity'],
      biomarker: 'Band-like subepithelial lymphocytic infiltrate'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28">
        {/* Background ambient lighting */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-500/20 via-teal-500/15 to-indigo-500/15 blur-[140px] pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Hero Content */}
            <div className="lg:col-span-7 text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-100/90 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-800/80 text-cyan-800 dark:text-cyan-300 text-xs font-bold mb-6 animate-in fade-in slide-in-from-top-3 shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span>{t('hero.demoBadge')}</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-6">
                {t('hero.titlePart1')}{' '}
                <span className="bg-gradient-to-r from-cyan-600 via-teal-500 to-blue-600 bg-clip-text text-transparent">
                  {t('hero.titlePart2')}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed max-w-2xl">
                {t('hero.subtitle')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
                <Link
                  to="/screening"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-700 hover:from-cyan-500 hover:to-teal-500 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-3 group transition-all transform hover:-translate-y-0.5 active:scale-95"
                >
                  <Camera className="w-5 h-5 text-cyan-200 group-hover:scale-110 transition-transform" />
                  <span>{t('hero.startScreeningBtn')}</span>
                  <ArrowRight className="w-5 h-5 text-cyan-200 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/find-doctors"
                  className="w-full sm:w-auto px-7 py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm rounded-2xl shadow-sm flex items-center justify-center space-x-2.5 transition-all active:scale-95"
                >
                  <Search className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <span>{t('hero.findDoctorBtn')}</span>
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{t('hero.badgeVerified')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-cyan-500" />
                  <span>{t('hero.badgeInstantPdf')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-indigo-500" />
                  <span>{t('hero.badgeEncrypted')}</span>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive AI Scanner Visual Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm sm:max-w-md rounded-3xl bg-slate-900 text-white p-5 sm:p-6 shadow-2xl border border-cyan-500/30 glow-cyan">
                
                {/* Scanner Header Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="font-mono text-cyan-400 text-[11px] font-bold uppercase tracking-wider">
                      LIVE AI SCANNER ACTIVE
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono">
                    60 FPS • 1080p
                  </span>
                </div>

                {/* Viewfinder Display Area */}
                <div className="relative my-4 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group">
                  <img
                    src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80"
                    alt="Oral Screening Viewfinder"
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Animated Scanner Beam Line */}
                  <div className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_15px_3px_rgba(6,182,212,0.9)] scan-beam" />

                  {/* Anatomical Reticle Grid */}
                  <div className="absolute inset-4 border border-cyan-400/40 rounded-xl pointer-events-none flex items-center justify-center">
                    <div className="w-8 h-8 border-t-2 border-l-2 border-cyan-400 absolute top-0 left-0" />
                    <div className="w-8 h-8 border-t-2 border-r-2 border-cyan-400 absolute top-0 right-0" />
                    <div className="w-8 h-8 border-b-2 border-l-2 border-cyan-400 absolute bottom-0 left-0" />
                    <div className="w-8 h-8 border-b-2 border-r-2 border-cyan-400 absolute bottom-0 right-0" />
                    <span className="text-[10px] font-mono uppercase text-cyan-300 bg-slate-950/80 px-2 py-1 rounded-md">
                      BUCCAL MUCOSA: OPTIMAL FOCUS
                    </span>
                  </div>

                  {/* Floating AI Prediction Tag */}
                  <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Visual Biomarker</p>
                      <p className="font-bold text-white text-[12px]">Homogeneous Keratinization</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Confidence 94.2%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Metrics Row */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <p className="text-[10px] text-slate-400">Lighting</p>
                    <p className="font-bold text-emerald-400 text-xs">98% Good</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <p className="text-[10px] text-slate-400">Sharpness</p>
                    <p className="font-bold text-cyan-400 text-xs">Clear (0.91)</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <p className="text-[10px] text-slate-400">Position</p>
                    <p className="font-bold text-teal-400 text-xs">Centered</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Clinical Workflow Steps */}
      <section className="py-16 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-cyan-600 dark:text-cyan-400 mb-2">
              {t('home.stepsBadge')}
            </h2>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {t('home.stepsTitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 relative hover:-translate-y-1 hover:shadow-xl hover:border-cyan-500/50 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white flex items-center justify-center font-black text-lg mb-4 shadow-md shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                {t('home.step1Title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('home.step1Desc')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 relative hover:-translate-y-1 hover:shadow-xl hover:border-teal-500/50 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center font-black text-lg mb-4 shadow-md shadow-teal-500/20 group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                {t('home.step2Title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('home.step2Desc')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 relative hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/50 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-black text-lg mb-4 shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                {t('home.step3Title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('home.step3Desc')}
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 relative hover:-translate-y-1 hover:shadow-xl hover:border-indigo-500/50 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center font-black text-lg mb-4 shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                {t('home.step4Title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('home.step4Desc')}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive OPMD Pre-Malignant Disorders Explorer */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-cyan-600 dark:text-cyan-400 mb-2">
              {t('home.knowledgeBadge')}
            </h2>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {t('home.knowledgeTitle')}
            </p>
          </div>

          {/* Interactive Disorder Selection Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {disorders.map((d, idx) => (
              <button
                key={d.title}
                onClick={() => setSelectedDisorder(idx)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                  selectedDisorder === idx
                    ? 'bg-white dark:bg-slate-800 border-cyan-500 shadow-md ring-2 ring-cyan-500/20 scale-[1.02]'
                    : 'bg-slate-100/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">{d.abbr}</span>
                  {selectedDisorder === idx && <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{d.title}</h4>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{d.tag}</p>
              </button>
            ))}
          </div>

          {/* Detailed Disorder Card */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold px-3 py-1 rounded-full border bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800">
                  {disorders[selectedDisorder].tag}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${disorders[selectedDisorder].riskColor}`}>
                  {disorders[selectedDisorder].risk}
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {disorders[selectedDisorder].title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {disorders[selectedDisorder].description}
              </p>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  {t('home.diagnosticFeatures')}
                </p>
                <ul className="space-y-1.5">
                  {disorders[selectedDisorder].keySigns.map((sign, i) => (
                    <li key={i} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="md:col-span-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-center">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-bold text-lg mx-auto mb-3 shadow-md shadow-cyan-500/20">
                {disorders[selectedDisorder].abbr}
              </div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">{t('home.biomarkerTarget')}</h4>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4">
                {disorders[selectedDisorder].biomarker}
              </p>
              <Link
                to="/screening"
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 inline-flex items-center justify-center space-x-2"
              >
                <span>{t('home.screenFor')} {disorders[selectedDisorder].abbr}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-gradient-to-r from-cyan-700 via-teal-700 to-blue-800 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            {t('home.ctaTitle')}
          </h2>
          <p className="text-sm sm:text-base text-cyan-100 max-w-2xl mx-auto mb-8">
            {t('home.ctaSubtitle')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/screening"
              className="px-8 py-4 bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-slate-950/20 flex items-center space-x-2 transition-transform hover:scale-105 active:scale-95"
            >
              <Camera className="w-4 h-4 text-cyan-600" />
              <span>{t('home.ctaScreeningBtn')}</span>
            </Link>
            <Link
              to="/find-doctors"
              className="px-8 py-4 bg-cyan-900/60 hover:bg-cyan-900/80 border border-white/20 text-white font-bold text-xs rounded-2xl transition-all"
            >
              <span>{t('home.ctaDoctorBtn')}</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
