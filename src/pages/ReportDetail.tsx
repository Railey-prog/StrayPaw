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
    dateStyle: 'long',
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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 w-full space-y-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-900 transition-colors flex items-center gap-1">
            <Home size={14} /> Home
          </Link>
          <ChevronRight size={14} />
          <Link to="/reports" className="hover:text-slate-900 transition-colors">Reports</Link>
          <ChevronRight size={14} />
          <span className="text-slate-900 font-medium truncate max-w-[120px]">#{report.id.slice(0, 8)}</span>
        </nav>

        {/* Title + badges */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold text-slate-900 capitalize tracking-tight">{animalLabel}</h1>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <StatusBadge status={report.status} />
            <ConditionBadge condition={report.condition_tag} />
          </div>
          <p className="text-xs text-slate-400 font-mono">ID: {report.id}</p>
        </motion.div>

        {/* Photo card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {report.photo_url ? (
            <div
              className="relative w-full cursor-zoom-in group"
              onClick={() => setLightboxOpen(true)}>
              <img
                src={report.photo_url}
                alt="Stray animal"
                className="w-full object-cover max-h-[420px] group-hover:opacity-95 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                  <ZoomIn size={15} /> View full photo
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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-7 shadow-sm border border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Description</h3>
          <p className="text-slate-800 text-base leading-relaxed whitespace-pre-wrap">{report.description}</p>
        </motion.div>

        {/* Admin notes */}
        {report.admin_notes && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
            className="bg-blue-50 border border-blue-100 rounded-3xl p-7">
            <div className="flex items-center gap-2 text-blue-800 font-bold mb-3">
              <ShieldAlert size={20} className="text-blue-600" /> Official Admin Notes
            </div>
            <p className="text-blue-900 leading-relaxed">{report.admin_notes}</p>
          </motion.div>
        )}

        {/* Details card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl p-7 shadow-sm border border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Details</h3>
          <div className="grid grid-cols-2 gap-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 mb-0.5">Location</p>
                <p className="text-slate-900 font-semibold text-sm">{report.barangay}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 mb-0.5">Date Reported</p>
                <p className="text-slate-900 font-semibold text-sm">{date}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                <User size={18} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 mb-0.5">Reporter</p>
                <p className="text-slate-900 font-semibold text-sm">{report.reporter_name || 'Anonymous'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 mb-0.5">Last Updated</p>
                <p className="text-slate-900 font-semibold text-sm">{new Date(report.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Map card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-7 pt-6 pb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location on Map</h3>
          </div>
          <div className="h-64 w-full relative bg-slate-100">
            <MapContainer
              center={[report.latitude, report.longitude]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
              maxBounds={TAGO_BOUNDS}
              maxBoundsViscosity={1.0}
              minZoom={TAGO_MIN_ZOOM}
              maxZoom={TAGO_MAX_ZOOM}>
              <TileLayer attribution={MAP_TILE_ATTRIBUTION} url={MAP_TILE_URL} />
              <Marker position={[report.latitude, report.longitude]} icon={mapIcon} />
            </MapContainer>
          </div>
          <div className="px-7 py-4 flex items-center gap-2 text-slate-500 text-sm border-t border-slate-100">
            <MapPin size={14} className="text-[#E76F51]" />
            <span className="font-medium text-slate-700">{report.barangay}</span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-xs text-slate-400">
              {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
            </span>
          </div>
        </motion.div>

        {/* Edit button for owner */}
        {isOwner && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}>
            <button
              onClick={() => navigate(`/reports/${report.id}/edit`)}
              className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-[#2D6A4F] hover:text-[#2D6A4F] py-3.5 rounded-2xl font-semibold transition-all shadow-sm">
              <Pencil size={16} />
              Edit this Report
            </button>
          </motion.div>
        )}

      </div>
    </>
  );
}
