import React from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, ShieldAlert, Heart, PhoneCall, Globe2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Warning Banner */}
        <div className="mb-10 p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-start space-x-3 text-amber-200">
          <ShieldAlert className="w-6 h-6 flex-shrink-0 text-amber-400 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <span className="font-bold text-amber-300 block mb-1">
              {t('demoNotice')}
            </span>
            {t('disclaimer')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-wide">OPMD Care</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {t('tagline')}
            </p>
            <div className="text-xs text-cyan-400 font-medium">
              EfficientNetB0 + XGBoost Ensemble Platform
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Clinical Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/screening" className="hover:text-cyan-400 transition-colors">Start Oral Screening</Link></li>
              <li><Link to="/find-doctors" className="hover:text-cyan-400 transition-colors">Find Verified Specialists</Link></li>
              <li><Link to="/patient/appointments" className="hover:text-cyan-400 transition-colors">Appointments & Reports</Link></li>
              <li><Link to="/register?role=DOCTOR" className="hover:text-cyan-400 transition-colors">Doctor Portal Registration</Link></li>
            </ul>
          </div>

          {/* Health Information & Guidelines */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Clinical Conditions
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><span className="text-slate-300 font-medium">Leukoplakia</span> – White patch lesions</li>
              <li><span className="text-slate-300 font-medium">Erythroplakia</span> – High-risk red patches</li>
              <li><span className="text-slate-300 font-medium">Oral Submucous Fibrosis</span> – Trismus</li>
              <li><span className="text-slate-300 font-medium">Lichen Planus</span> – Reticular & erosive</li>
            </ul>
          </div>

          {/* Emergency & Support */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Helplines & Support
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>National Tobacco Quitline: <strong>1800-11-2356</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Cancer Helpline: <strong>1800-22-1951</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe2 className="w-4 h-4 text-cyan-400" />
                <span>24/7 Platform Support: support@opmdcare.org</span>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} OPMD Care Platform. All rights reserved.
          </div>
          <div className="flex space-x-4 mt-3 sm:mt-0">
            <span>HIPAA/NABH Compliance Architectural Standards</span>
            <span>Prisma + PostgreSQL</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
