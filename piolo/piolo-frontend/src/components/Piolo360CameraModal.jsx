// src/components/Piolo360CameraModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  OrientationTracker,
  cameraToWorldMatrix,
  headingOf,
  getScreenAngle,
  viewLonLat
} from '../lib/pano/orientation';
import { TARGET_GRID, TOTAL_TARGETS, projectTargetToScreen, findBestTarget } from '../lib/pano/targets';
import { stitchClientPreview } from '../lib/pano/clientPreview';
import { propertiesApi } from '../services/api';

// ── Synthétiseur audio Web Audio API (sans fichier externe) ───────────────────
function playAudioChime(type = 'capture') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'capture') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // La 5
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'finish') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.12, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.4);
      });
    }
  } catch (_) {
    // Audio context ignoré si non supporté
  }
}

export default function Piolo360CameraModal({
  isOpen,
  onClose,
  propertyId,
  onSave360Image,
  onSceneCreated
}) {
  const { t } = useTranslation();

  // Détection smartphone
  const isMobile = typeof navigator !== 'undefined' &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // États du flux
  const [step, setStep] = useState('capture'); // 'desktop_barrier' | 'permission' | 'capture' | 'review' | 'uploading'
  const [cameraError, setCameraError] = useState(null);
  const [capturedFrames, setCapturedFrames] = useState({}); // { [targetId]: { canvas, R, focal, yaw, pitch, id } }
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [roomName, setRoomName] = useState('Salon principal');

  // Preview local
  const [previewBlob, setPreviewBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isClientStitching, setIsClientStitching] = useState(false);

  // Réf tracking AR
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const hudCanvasRef = useRef(null);
  const trackerRef = useRef(null);
  const yaw0Ref = useRef(null);
  const animFrameRef = useRef(null);
  const previewPanoRef = useRef(null);
  const previewViewerRef = useRef(null);

  // État temps réel pour la capture automatique
  const alignTimeRef = useRef(0);
  const currentRRef = useRef(null);
  const nearestTargetRef = useRef(null);
  const [nearestTargetState, setNearestTargetState] = useState(null);
  const [currentHeadingState, setCurrentHeadingState] = useState({ lon: 0, lat: 0 });

  const capturedCount = Object.keys(capturedFrames).length;

  // ── 1. Démarrage caméra ──────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(tr => tr.stop());
      }

      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Erreur caméra:', err);
      setCameraError("Impossible d'accéder à la caméra arrière. Vérifiez les autorisations de votre navigateur.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(tr => tr.stop());
      streamRef.current = null;
    }
    if (trackerRef.current) {
      trackerRef.current.stop();
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  // ── 2. Déclenchement capture d'une cible ─────────────────────────────────────
  const triggerCapture = useCallback((target) => {
    if (!videoRef.current || !target) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    // Vibration haptique
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([35, 25, 35]);
    }
    playAudioChime('capture');

    // Sauvegarde de l'image
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const R = currentRRef.current ? [...currentRRef.current] : null;
    if (!R) return;

    // Estimation focale
    const focal = (canvas.height / 2) / Math.tan((65 * Math.PI) / 360);

    const frameData = {
      canvas,
      R,
      focal,
      yaw: target.yaw,
      pitch: target.pitch,
      id: target.id,
    };

    setCapturedFrames((prev) => {
      const next = { ...prev, [target.id]: frameData };
      if (Object.keys(next).length === TOTAL_TARGETS) {
        playAudioChime('finish');
      }
      return next;
    });

    alignTimeRef.current = 0;
  }, []);

  // ── 3. Boucle AR HUD (rendu à 60 FPS) ───────────────────────────────────────
  const startArLoop = useCallback(() => {
    const hud = hudCanvasRef.current;
    const video = videoRef.current;
    const tracker = trackerRef.current;
    if (!hud || !video || !tracker) return;

    const ctx = hud.getContext('2d');

    const renderFrame = () => {
      const w = hud.clientWidth;
      const h = hud.clientHeight;
      if (hud.width !== w || hud.height !== h) {
        hud.width = w;
        hud.height = h;
      }

      ctx.clearRect(0, 0, w, h);

      if (tracker.q) {
        const screenAngle = getScreenAngle();

        // Étalonnage initial de l'azimut de départ (Yaw 0)
        if (yaw0Ref.current === null) {
          yaw0Ref.current = headingOf(tracker.q, screenAngle);
        }

        const R = cameraToWorldMatrix(tracker.q, yaw0Ref.current, screenAngle);
        currentRRef.current = R;

        const focal = (h / 2) / Math.tan((65 * Math.PI) / 360);
        const { target: best, angleDeg: minAngle } = findBestTarget(R, capturedFrames);
        nearestTargetRef.current = best;

        // Mise à jour de l'orientation affichée
        const { lon, lat } = viewLonLat(R);
        setCurrentHeadingState({ lon: Math.round(lon), lat: Math.round(lat) });
        setNearestTargetState(best ? { ...best, angleDeg: Math.round(minAngle) } : null);

        // Dessin des 38 cibles projetées en 3D
        TARGET_GRID.forEach((t) => {
          const isCaptured = !!capturedFrames[t.id];
          const isNearest = best && t.id === best.id;
          const { visible, screenX, screenY, cz, angleDeg } = projectTargetToScreen(t, R, w, h, focal);

          if (!visible || cz <= 0.1) return;

          // Taille dynamique selon la distance angulaire
          const scale = Math.max(0.6, Math.min(1.4, 1.2 - angleDeg / 60));
          const baseRadius = (isNearest ? 18 : 10) * scale;

          ctx.save();
          ctx.translate(screenX, screenY);

          if (isCaptured) {
            // Cible déjà capturée : pastille verte douce
            ctx.beginPath();
            ctx.arc(0, 0, baseRadius * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(46, 204, 113, 0.4)';
            ctx.fill();
            ctx.strokeStyle = '#2ECC71';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          } else if (isNearest) {
            // Cible courante à viser : pulsation dorée / émeraude si aligné
            const inTolerance = angleDeg <= 3.8;
            const ringColor = inTolerance ? '#2ECC71' : '#F6D365';
            const glowColor = inTolerance ? 'rgba(46, 204, 113, 0.35)' : 'rgba(212, 175, 55, 0.25)';

            // Halo externe
            ctx.beginPath();
            ctx.arc(0, 0, baseRadius + 10, 0, Math.PI * 2);
            ctx.fillStyle = glowColor;
            ctx.fill();

            // Cercle cible
            ctx.beginPath();
            ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
            ctx.strokeStyle = ringColor;
            ctx.lineWidth = inTolerance ? 3.5 : 2;
            ctx.stroke();

            // Point focal central
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fillStyle = ringColor;
            ctx.fill();
          } else {
            // Autre cible en attente : anneau doré discret
            ctx.beginPath();
            ctx.arc(0, 0, baseRadius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }

          ctx.restore();
        });

        // Détection de l'alignement et déclenchement automatique
        if (best && minAngle <= 3.8) {
          // Vérification de la stabilité (téléphone immobile)
          const isStable = tracker.angularSpeed < 14;

          if (isStable) {
            alignTimeRef.current += 16; // ~16ms par frame
            if (alignTimeRef.current >= 220) { // 220ms de maintien stable
              triggerCapture(best);
            }
          } else {
            alignTimeRef.current = Math.max(0, alignTimeRef.current - 10);
          }
        } else {
          alignTimeRef.current = 0;
        }

        // Dessin du réticule central
        const cx = w / 2;
        const cy = h / 2;
        const inAlignment = best && minAngle <= 3.8;

        ctx.save();
        ctx.translate(cx, cy);

        // Cercle central du viseur
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.strokeStyle = inAlignment ? '#2ECC71' : 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = inAlignment ? 3 : 1.5;
        if (inAlignment) {
          ctx.fillStyle = 'rgba(46, 204, 113, 0.12)';
          ctx.fill();
        }
        ctx.stroke();

        // Réticule en croix
        ctx.beginPath();
        ctx.moveTo(-10, 0); ctx.lineTo(10, 0);
        ctx.moveTo(0, -10); ctx.lineTo(0, 10);
        ctx.strokeStyle = inAlignment ? '#2ECC71' : '#F6D365';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(renderFrame);
    };

    animFrameRef.current = requestAnimationFrame(renderFrame);
  }, [capturedFrames, triggerCapture]);

  // Initialisation à l'ouverture
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPreviewBlob(null);
      setCapturedFrames({});
      setStep(isMobile ? 'capture' : 'desktop_barrier');
      yaw0Ref.current = null;
      document.body.classList.remove('pro-modal-open', 'modal-open');
      return;
    }

    document.body.classList.add('pro-modal-open', 'modal-open');

    if (!isMobile) {
      setStep('desktop_barrier');
      return;
    }

    setStep('capture');
    startCamera();

    const tracker = new OrientationTracker();
    trackerRef.current = tracker;
    tracker.start();

    // Lancer la boucle de rendu HUD
    startArLoop();

    return () => {
      stopCamera();
    };
  }, [isOpen, isMobile, startCamera, stopCamera, startArLoop]);

  // ── 4. Passer à l'écran de prévisualisation (Stitch Client) ──────────────────
  const handleProceedToReview = async () => {
    const frames = Object.values(capturedFrames);
    if (frames.length < 4) return;

    setIsClientStitching(true);
    setStep('review');
    stopCamera();

    try {
      const blob = await stitchClientPreview(frames, 2048);
      const url = URL.createObjectURL(blob);
      setPreviewBlob(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Erreur prévisualisation client:', err);
    } finally {
      setIsClientStitching(false);
    }
  };

  // ── 5. Montage du lecteur Pannellum sur le blob ─────────────────────────────
  useEffect(() => {
    if (step !== 'review' || !previewUrl || !previewPanoRef.current) return;

    if (window.pannellum) {
      if (previewViewerRef.current) {
        try { previewViewerRef.current.destroy(); } catch (_) {}
      }
      previewViewerRef.current = window.pannellum.viewer(previewPanoRef.current, {
        type: 'equirectangular',
        panorama: previewUrl,
        autoLoad: true,
        showControls: true,
        touchPanSpeedCoeffFactor: 1.2,
      });
    }

    return () => {
      if (previewViewerRef.current) {
        try { previewViewerRef.current.destroy(); } catch (_) {}
        previewViewerRef.current = null;
      }
    };
  }, [step, previewUrl]);

  // ── 6. Sauvegarde HD Serveur (OpenCV SIFT + MultiBandBlender) ────────────────
  const handleSaveHdServer = async () => {
    const frames = Object.values(capturedFrames);
    if (frames.length < 4) return;

    setStep('uploading');
    setUploadProgress(10);
    setUploadStatusText('Préparation des prises de vue…');

    try {
      const fd = new FormData();
      fd.append('room_name', roomName.trim());
      fd.append('out_width', '4096');
      fd.append('refine', 'true');

      // Préparer les fichiers et les métadonnées
      const metadata = [];
      for (let i = 0; i < frames.length; i++) {
        const f = frames[i];
        metadata.push({
          id: f.id,
          yaw: f.yaw,
          pitch: f.pitch,
          R: f.R,
          focal: f.focal,
        });

        // Convertir le canvas en Blob JPEG
        const blob = await new Promise((res) => f.canvas.toBlob(res, 'image/jpeg', 0.9));
        fd.append('frames', blob, `frame_${i}.jpg`);
      }
      fd.append('metadata', JSON.stringify(metadata));

      setUploadProgress(35);
      setUploadStatusText('Envoi vers le serveur Piolo…');

      const res = await propertiesApi.stitchTourScene(propertyId, fd, (pe) => {
        if (pe.total) {
          const p = 35 + Math.round((pe.loaded / pe.total) * 40);
          setUploadProgress(Math.min(75, p));
          setUploadStatusText('Assemblage OpenCV en cours sur le serveur…');
        }
      });

      setUploadProgress(100);
      setUploadStatusText('Visite 360° générée avec succès !');

      if (onSceneCreated) {
        onSceneCreated(res.data);
      } else if (onSave360Image) {
        onSave360Image(previewBlob, roomName.trim());
      }
      onClose();
    } catch (err) {
      console.error('Erreur assemblage serveur:', err);
      // Repli sur l'image locale en cas de coupure réseau
      alert("Le serveur n'a pas pu finaliser l'assemblage HD. Nous enregistrons l'aperçu local haute qualité.");
      if (previewBlob && onSave360Image) {
        const file = new File([previewBlob], `${roomName.trim().toLowerCase().replace(/\s+/g, '_')}_360.jpg`, { type: 'image/jpeg' });
        onSave360Image(file, roomName.trim());
      }
      onClose();
    }
  };

  // ── 7. Sauvegarde directe du preview local (Fallback) ────────────────────────
  const handleSaveClientDirect = () => {
    if (!previewBlob) return;
    const fileName = `${roomName.trim().toLowerCase().replace(/\s+/g, '_')}_360.jpg`;
    const file = new File([previewBlob], fileName, { type: 'image/jpeg' });
    onSave360Image(file, roomName.trim());
    onClose();
  };

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(currentUrl)}`;

  return (
    <div className="pro-modal-backdrop" style={{ zIndex: 100060, padding: 0 }}>
      <div style={{
        position: 'fixed', inset: 0, width: '100vw', height: '100vh', height: '100dvh',
        background: '#0F0D09', display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>

        {/* ── TOPBAR IMMERSIVE AVEC SÉCURITÉ IPHONE ── */}
        <header style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
          paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)',
          paddingBottom: '12px',
          paddingLeft: 'max(env(safe-area-inset-left, 0px), 16px)',
          paddingRight: 'max(env(safe-area-inset-right, 0px), 16px)',
          background: 'linear-gradient(180deg, rgba(15,13,9,0.92) 0%, rgba(15,13,9,0) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          pointerEvents: 'auto'
        }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            style={{
              width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)', color: '#FFF', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700,
              cursor: 'pointer', backdropFilter: 'blur(8px)', flexShrink: 0
            }}
          >
            ✕
          </button>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)',
              padding: '3px 12px', borderRadius: 20, color: '#F6D365', fontSize: 11, fontWeight: 800
            }}>
              <span>📸 PHOTOSPHÈRE 360° AR</span>
            </div>
            <p style={{ margin: '3px 0 0', color: '#FFFFFF', fontSize: 12.5, fontWeight: 700 }}>
              {step === 'review'
                ? 'Aperçu Interactif 360°'
                : nearestTargetState
                  ? `Alignez : ${nearestTargetState.label} (${nearestTargetState.angleDeg}°)`
                  : 'Capturez la pièce à 360°'}
            </p>
          </div>

          <div style={{ width: 44, display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
            {step === 'capture' && (
              <span style={{
                background: capturedCount >= 8 ? '#2ECC71' : 'linear-gradient(135deg, #D4AF37, #AA820A)',
                color: '#0F0D09', fontSize: 11, fontWeight: 900,
                padding: '4px 8px', borderRadius: 12, whiteSpace: 'nowrap'
              }}>
                {capturedCount}/{TOTAL_TARGETS}
              </span>
            )}
          </div>
        </header>

        {/* ── BARRIÈRE DESKTOP : INVITATION À SCANNER SUR MOBILE ── */}
        {step === 'desktop_barrier' && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: 24, textAlign: 'center', color: '#FFF',
            background: 'radial-gradient(circle at center, #1C1813 0%, #0F0D09 100%)',
            zIndex: 40
          }}>
            <div style={{
              maxWidth: 460, background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(212,175,55,0.3)',
              borderRadius: 24, padding: '32px 28px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(16px)'
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%', background: 'rgba(212,175,55,0.15)',
                color: '#F6D365', display: 'grid', placeItems: 'center', fontSize: 28, margin: '0 auto 16px'
              }}>
                📱
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 10px', color: '#FFF' }}>
                Capture 360° sur Smartphone
              </h2>
              <p style={{ fontSize: 13.5, color: '#AAA', lineHeight: 1.6, margin: '0 0 24px' }}>
                La photosphère utilise les <strong>capteurs gyroscopiques</strong> de votre smartphone pour guider la capture et assembler la pièce sans matériel externe.
              </p>

              <div style={{
                background: '#FFF', padding: 14, borderRadius: 16, display: 'inline-block',
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)', marginBottom: 20
              }}>
                <img
                  src={qrCodeUrl}
                  alt="Scannez pour ouvrir sur smartphone"
                  style={{ width: 190, height: 190, display: 'block' }}
                />
              </div>

              <div style={{ fontSize: 12.5, color: '#D4AF37', fontWeight: 700, marginBottom: 16 }}>
                Scannez ce QR Code avec l'appareil photo de votre smartphone
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="pro-btn-secondary"
                  style={{ minWidth: 140 }}
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(currentUrl);
                    alert('Lien copié dans le presse-papier !');
                  }}
                  className="pro-btn-gold"
                  style={{ minWidth: 140 }}
                >
                  Copier le lien
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODE CAPTURE : AR HUD ET FLUX CAMÉRA ── */}
        {step === 'capture' && (
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                background: '#000'
              }}
            />

            {/* Canvas AR de projection des 38 cibles */}
            <canvas
              ref={hudCanvasRef}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                pointerEvents: 'none'
              }}
            />

            {/* Erreur Caméra */}
            {cameraError && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: 24, textAlign: 'center', color: '#FFF', zIndex: 45
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
                <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 800 }}>Caméra requise</h3>
                <p style={{ fontSize: 13, color: '#BBB', maxWidth: 320, margin: '0 0 16px' }}>{cameraError}</p>
                <button type="button" onClick={startCamera} className="pro-btn-gold">
                  Autoriser la caméra
                </button>
              </div>
            )}

            {/* Radar / Mini-Boussole en bas à gauche */}
            <div style={{
              position: 'absolute', bottom: 'max(env(safe-area-inset-bottom, 0px), 88px)',
              left: 16, zIndex: 30, background: 'rgba(15,13,9,0.85)',
              border: '1px solid rgba(212,175,55,0.4)', borderRadius: 16, padding: '8px 12px',
              backdropFilter: 'blur(8px)', color: '#FFF', fontSize: 11, fontWeight: 700
            }}>
              <div style={{ color: '#F6D365', marginBottom: 2 }}>📍 Boussole 360°</div>
              <div>Cap: {currentHeadingState.lon}° | Incl: {currentHeadingState.lat}°</div>
              <div style={{ color: capturedCount >= 8 ? '#2ECC71' : '#AAA', marginTop: 2 }}>
                {capturedCount >= 8 ? '✓ Prêt pour l’assemblage' : `Encore ${8 - capturedCount} pour l'horizon`}
              </div>
            </div>

            {/* Contrôles du bas de l'écran */}
            <div style={{
              position: 'absolute', bottom: 'max(env(safe-area-inset-bottom, 0px), 18px)',
              left: 16, right: 16, zIndex: 40, display: 'flex', gap: 12, justifyContent: 'center'
            }}>
              {/* Déclencheur manuel si besoin */}
              <button
                type="button"
                onClick={() => {
                  if (nearestTargetRef.current) {
                    triggerCapture(nearestTargetRef.current);
                  }
                }}
                style={{
                  flex: 1, maxWidth: 190, height: 48, borderRadius: 14,
                  border: '1.5px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.14)', color: '#FFF', fontWeight: 800,
                  fontSize: 12.5, cursor: 'pointer', backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}
              >
                <span>📷 Déclencher</span>
              </button>

              {/* Bouton Générer accessible dès 6 prises */}
              {capturedCount >= 6 && (
                <button
                  type="button"
                  onClick={handleProceedToReview}
                  className="pro-btn-gold"
                  style={{
                    flex: 1.3, maxWidth: 220, height: 48,
                    boxShadow: '0 6px 20px rgba(212,175,55,0.4)'
                  }}
                >
                  <span>Assembler 360° ({capturedCount})</span>
                  <span>✨</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── MODE REVUE : PANNELLUM INTERACTIF & CHOIX D'ASSEMBLAGE ── */}
        {step === 'review' && (
          <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
            {isClientStitching ? (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', background: '#0F0D09', color: '#FFF'
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', border: '4px solid #333',
                  borderTopColor: '#D4AF37', animation: 'spin 0.8s linear infinite', marginBottom: 16
                }} />
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#F6D365', margin: '0 0 6px' }}>
                  Génération de l'aperçu 360°…
                </h3>
                <p style={{ fontSize: 12.5, color: '#AAA' }}>Projection sphérique équirectangulaire instantanée</p>
              </div>
            ) : (
              <>
                <div ref={previewPanoRef} style={{ flex: 1, width: '100%', height: '100%', background: '#000' }} />

                <div style={{
                  position: 'absolute', top: 'max(env(safe-area-inset-top, 0px), 64px)',
                  left: '50%', transform: 'translateX(-50%)', zIndex: 20,
                  background: 'rgba(15,13,9,0.85)', border: '1px solid rgba(212,175,55,0.4)',
                  color: '#F6D365', padding: '6px 14px', borderRadius: 20,
                  fontSize: 12, fontWeight: 700, pointerEvents: 'none'
                }}>
                  🔄 Glissez sur l&apos;écran pour regarder à 360°
                </div>

                {/* Panneau de validation */}
                <div style={{
                  background: 'rgba(15,13,9,0.96)', borderTop: '1.5px solid rgba(212,175,55,0.4)',
                  padding: '16px 20px max(env(safe-area-inset-bottom, 0px), 16px)',
                  display: 'flex', flexDirection: 'column', gap: 12, zIndex: 30
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#F6D365', textTransform: 'uppercase', marginBottom: 6 }}>
                      Nom de la pièce *
                    </label>
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Ex: Salon principal, Chambre avec balcon…"
                      style={{
                        width: '100%', height: 44, borderRadius: 12, border: '1.5px solid #E5E0D5',
                        padding: '0 14px', fontSize: 13.5, background: '#FAF9F6', color: '#0F0D09',
                        outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('capture');
                        startCamera();
                        if (trackerRef.current) trackerRef.current.start();
                        startArLoop();
                      }}
                      className="pro-btn-secondary"
                      style={{ flex: 1, height: 46 }}
                    >
                      📷 Reprendre
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveHdServer}
                      className="pro-btn-gold"
                      style={{ flex: 1.8, height: 46 }}
                    >
                      🚀 Assembler en HD Pro (Serveur)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveClientDirect}
                    style={{
                      background: 'transparent', border: 'none', color: '#9B9690',
                      fontSize: 11.5, cursor: 'pointer', textDecoration: 'underline', textAlign: 'center'
                    }}
                  >
                    Enregistrer cet aperçu direct (sans traitement serveur)
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── MODE TÉLÉVERSEMENT ET ASSEMBLAGE SERVEUR ── */}
        {step === 'uploading' && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: 24, textAlign: 'center', color: '#FFF',
            background: 'rgba(15,13,9,0.96)', zIndex: 60
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%', border: '4px solid #333',
              borderTopColor: '#D4AF37', animation: 'spin 0.8s linear infinite', marginBottom: 20
            }} />
            <h3 style={{ margin: '0 0 10px', fontSize: 19, fontWeight: 800, color: '#F6D365' }}>
              Assemblage Photosphère HD…
            </h3>
            <p style={{ fontSize: 13, color: '#AAA', maxWidth: 340, margin: '0 0 20px', lineHeight: 1.5 }}>
              {uploadStatusText}
            </p>

            <div style={{ width: 240, height: 7, background: 'rgba(255,255,255,0.15)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${uploadProgress}%`,
                background: 'linear-gradient(90deg, #D4AF37, #F6D365)', transition: 'width 0.3s ease'
              }} />
            </div>
            <span style={{ fontSize: 12, color: '#888', marginTop: 10 }}>{uploadProgress}%</span>
          </div>
        )}

      </div>
    </div>
  );
}
