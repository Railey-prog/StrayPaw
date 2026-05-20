import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  MapPin,
  Calendar,
  User,
  Clock,
  ShieldAlert,
  Home,
  X,
  ZoomIn,
  Pencil,
  PawPrint,
} from 'lucide-react';
import { useReports } from '../context/ReportContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, ConditionBadge } from '../components/Badge';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';
import {
  TAGO_BOUNDS,
  TAGO_MIN_ZOOM,
  TAGO_MAX_ZOOM,
  MAP_TILE_URL,
  MAP_TILE_ATTRIBUTION,
} from '../data/tagoBounds';

export function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const { reports } = useReports();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const report = reports.find((r) => r.id === id);

  if (!report) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Report Not Found</h2>
        <button onClick={() => navigate('/reports')} className="text-[#2D6A4F] hover:underline font-medium">
          Back to Reports
        </button>
      </div>
    );
  }

  const date = new Date(report.created_at).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const mapIcon = divIcon({
    className: 'custom-leaflet-icon',
    html: `<div class="w-5 h-5 rounded-full bg-[#E76F51] border-2 border-white shadow-[0_0_15px_rgba(231,111,81,0.6)]"></div>`,
    iconSize: [20, 20],
  });

  const isOwner = user && report.reporter_user_id === user.id;
  const animalLabel =
    report.animal_type === 'other' && report.other_animal_type
      ? report.other_animal_type
      : report.animal_type;

  return (
    <>
      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && report.photo_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}>
            <button
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={() => setLightboxOpen(false)}>
              <X size={20} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={report.photo_url}
              alt="Stray animal full view"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-full flex flex-col px-4 sm:px-6 lg:px-8 py-6 gap-4 w-full">

        {/* Top bar: breadcrumb + edit */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-slate-900 transition-colors flex items-center gap-1">
              <Home size={14} /> Home
            </Link>
            <ChevronRight size={14} />
            <Link to="/reports" className="hover:text-slate-900 transition-colors">Reports</Link>
            <ChevronRight size={14} />
            <span className="text-slate-900 font-medium capitalize">{animalLabel}</span>
          </nav>
          {isOwner && (
            <button
              onClick={() => navigate(`/reports/${report.id}/edit`)}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-[#2D6A4F] hover:text-[#2D6A4F] px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm">
              <Pencil size={14} /> Edit Report
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">

          {/* LEFT — Photo + Description */}
          <div className="flex flex-col gap-4">

            {/* Photo card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-shrink-0">
              {report.photo_url ? (
                <div
                  className="relative w-full cursor-zoom-in group"
                  onClick={() => setLightboxOpen(true)}>
                  <img
                    src={report.photo_url}
                    alt="Stray animal"
                    className="w-full object-cover h-64 sm:h-80 group-hover:opacity-95 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                      <ZoomIn size={14} /> View full photo
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-slate-100 text-slate-400 font-medium">
                  No Photo Available
                </div>
              )}
            </motion.div>

            {/* Description card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Description</p>
              <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{report.description}</p>

              {report.admin_notes && (
                <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-800 font-bold mb-2 text-sm">
                    <ShieldAlert size={16} className="text-blue-600" /> Admin Notes
                  </div>
                  <p className="text-blue-900 text-sm leading-relaxed">{report.admin_notes}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* RIGHT — Title/badges + Details + Map */}
          <div className="flex flex-col gap-4">

            {/* Title card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                  <PawPrint size={24} className="text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-extrabold text-slate-900 capitalize tracking-tight leading-tight mb-2">
                    {animalLabel}
                  </h1>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <StatusBadge status={report.status} />
                    <ConditionBadge condition={report.condition_tag} />
                  </div>
                  <p className="text-xs text-slate-400 font-mono">ID: {report.id}</p>
                </div>
              </div>
            </motion.div>

            {/* Details card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Details</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                    <MapPin size={17} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Location</p>
                    <p className="text-slate-900 font-semibold text-sm">{report.barangay}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                    <Calendar size={17} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Reported</p>
                    <p className="text-slate-900 font-semibold text-sm">{date}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                    <User size={17} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Reporter</p>
                    <p className="text-slate-900 font-semibold text-sm">{report.reporter_name || 'Anonymous'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                    <Clock size={17} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Last Updated</p>
                    <p className="text-slate-900 font-semibold text-sm">{new Date(report.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Map card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-[220px]">
              <div className="px-6 pt-5 pb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location on Map</p>
              </div>
              <div className="flex-1 relative min-h-[180px]">
                <MapContainer
                  center={[report.latitude, report.longitude]}
                  zoom={15}
                  style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }}
                  scrollWheelZoom={false}
                  maxBounds={TAGO_BOUNDS}
                  maxBoundsViscosity={1.0}
                  minZoom={TAGO_MIN_ZOOM}
                  maxZoom={TAGO_MAX_ZOOM}>
                  <TileLayer attribution={MAP_TILE_ATTRIBUTION} url={MAP_TILE_URL} />
                  <Marker position={[report.latitude, report.longitude]} icon={mapIcon} />
                </MapContainer>
              </div>
              <div className="px-6 py-3 flex items-center gap-2 text-sm border-t border-slate-100 bg-white">
                <MapPin size={13} className="text-[#E76F51] shrink-0" />
                <span className="font-semibold text-slate-700 text-sm">{report.barangay}</span>
                <span className="text-slate-300">·</span>
                <span className="font-mono text-xs text-slate-400">
                  {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                </span>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </>
  );
}
