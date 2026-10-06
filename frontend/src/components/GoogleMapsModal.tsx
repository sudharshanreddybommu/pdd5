import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, ExternalLink, X, Building, CheckCircle2 } from 'lucide-react';

interface Props {
  doctor: any;
  hospital: any;
  onClose: () => void;
}

const GoogleMapsModal: React.FC<Props> = ({ doctor, hospital, onClose }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState<boolean>(false);
  const [distanceKm, setDistanceKm] = useState<string | null>(null);

  const hospitalLat = hospital?.latitude || 17.4156;
  const hospitalLng = hospital?.longitude || 78.4357;

  // Calculate Haversine distance
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(uLoc);
        const dist = calculateDistance(uLoc.lat, uLoc.lng, hospitalLat, hospitalLng);
        setDistanceKm(dist);
        setLocating(false);
      },
      () => {
        setLocating(false);
      }
    );
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const googleMapsDirectionsUrl = userLocation
    ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${hospitalLat},${hospitalLng}&travelmode=driving`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital?.name + ' ' + hospital?.address + ' ' + hospital?.city)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {hospital?.name || 'Specialty Oncology Clinic'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {doctor?.fullName} • {doctor?.specialization}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Interactive Container */}
        <div className="relative w-full h-80 bg-slate-100 dark:bg-slate-950 overflow-hidden border-b border-slate-200 dark:border-slate-800">
          <iframe
            title="Google Maps Location"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${hospitalLat},${hospitalLng}&hl=en&z=14&output=embed`}
          />

          {/* Overlay Navigation Badge */}
          <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 max-w-xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-600 dark:text-cyan-400">
              <Building className="w-4 h-4" />
              <span>{hospital?.name}</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
              {hospital?.address}, {hospital?.city}, {hospital?.state}
            </p>
            {distanceKm && (
              <div className="mt-2 flex items-center space-x-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Estimated Distance: {distanceKm} km</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer & Actions */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Clinic Contact: {hospital?.phone || doctor?.phone || '+91 40 2334 8899'}</span>
            </div>
            <div>Consultation Hours: {doctor?.availableHours || '09:00 AM - 05:00 PM'}</div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={getUserLocation}
              disabled={locating}
              className="px-3.5 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-1.5"
            >
              <Navigation className="w-3.5 h-3.5 text-cyan-500" />
              <span>{locating ? 'Locating...' : 'My Location'}</span>
            </button>
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-5 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-500/20 flex items-center justify-center space-x-2"
            >
              <span>Get Directions in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GoogleMapsModal;
