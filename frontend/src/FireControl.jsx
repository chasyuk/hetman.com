import React, { useState, useCallback, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios'
import 'leaflet/dist/leaflet.css'

/* ═══════════════════════════════════════════════════════════════
   CANNON DATABASE
   ═══════════════════════════════════════════════════════════════ */
/* CANNONS are fetched from the backend /api/weapons endpoint */

/* ═══════════════════════════════════════════════════════════════
   UNIT TYPE CONFIG & COLORS
   ═══════════════════════════════════════════════════════════════ */
const UNIT_TYPES = {
    // ── ОСНОВНІ ──
    infantry: { label: 'Піхота', defaultRadius: 400, category: 'main' },
    battery: { label: 'Батарея (Арта)', defaultRadius: 0, category: 'main' },
    ksp: { label: 'КСП', defaultRadius: 5000, category: 'main' },
    tank_brigade: { label: 'Танкова бригада', defaultRadius: 2500, category: 'main' },
    uav: { label: 'Підрозділ БПЛА', defaultRadius: 15000, category: 'main' },
    ew: { label: 'РЕБ', defaultRadius: 8000, category: 'main' },

    // ── РОЗВІДКА (З фото) ──
    recon_patrol: { label: 'Розвідувальний дозор', defaultRadius: 0, category: 'recon' },
    recon_detachment: { label: 'Розвідувальний загін', defaultRadius: 0, category: 'recon' },
    recon_group: { label: 'Розвідувальна група', defaultRadius: 0, category: 'recon' },
    patrol_squad: { label: 'Дозорне відділення', defaultRadius: 0, category: 'recon' },

    // ── ТЕХНІКА (З фото) ──
    tank: { label: 'Танк', defaultRadius: 0, category: 'vehicle' },
    bmp: { label: 'БМП', defaultRadius: 0, category: 'vehicle' },
    btr: { label: 'БТР', defaultRadius: 0, category: 'vehicle' },
    auto: { label: 'Автомобіль', defaultRadius: 0, category: 'vehicle' },

    // ── ОЗБРОЄННЯ (З фото) ──
    mortar_gen: { label: 'Загальне позначення мінометів', defaultRadius: 0, category: 'weapon' },
    mortar_light: { label: 'Малого калібру (до 60 мм)', defaultRadius: 0, category: 'weapon' },
    mortar_med: { label: 'Середнього калібру (до 107мм)', defaultRadius: 0, category: 'weapon' },
    mortar_heavy: { label: 'Великого калібру (107мм і більше)', defaultRadius: 0, category: 'weapon' },

    mg_light: { label: 'Легкий (ручний) кулемет', defaultRadius: 0, category: 'weapon' },
    mg_med: { label: 'Середній (ротний/станковий) кулемет', defaultRadius: 0, category: 'weapon' },
    mg_heavy: { label: 'Важкий (великокаліберний) кулемет', defaultRadius: 0, category: 'weapon' },

    gl_gen: { label: 'Гранатомет', defaultRadius: 0, category: 'weapon' },
    gl_light: { label: 'Легкий гранатомет (підствольний)', defaultRadius: 0, category: 'weapon' },
    gl_multi: { label: 'Багатозарядний гранатомет', defaultRadius: 0, category: 'weapon' },
    gl_heavy: { label: 'Важкий (автоматичний) гранатомет', defaultRadius: 0, category: 'weapon' },

    atgm_light: { label: 'Протитанкова ракета легка', defaultRadius: 0, category: 'weapon' },
    atgm_med: { label: 'Протитанкова ракета середня', defaultRadius: 0, category: 'weapon' },
    atgm_heavy: { label: 'Протитанкова ракета важка', defaultRadius: 0, category: 'weapon' },
}

const CATEGORIES = {
    main: 'Основні підрозділи',
    recon: 'Розвідка',
    vehicle: 'Техніка',
    weapon: 'Озброєння'
}

const COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ec4899', '#14b8a6', '#ef4444', '#000000']

/* ═══════════════════════════════════════════════════════════════
   LEAFLET NATO ICON FACTORY
   ═══════════════════════════════════════════════════════════════ */
function makeIcon(unit, isDisconnected) {
    const isEnemy = unit.faction === 'enemy'
    const strokeColor = isDisconnected ? '#9ca3af' : unit.color
    const bgColor = isDisconnected ? 'rgba(156,163,175,0.2)' : `${strokeColor}33`
    const strokeWidth = 2.5

    let shapeHtml = ''
    if (isEnemy) {
        shapeHtml = `<polygon points="24,4 44,24 24,44 4,24" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
    } else {
        shapeHtml = `<rect x="4" y="10" width="40" height="28" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
    }

    let symbolHtml = ''
    let echelonHtml = ''
    const t = unit.type

    const drawEchelon = (dots, lines) => {
        let h = ''
        if (dots === 1) h += `<circle cx="24" cy="4" r="2" fill="${strokeColor}"/>`
        if (dots === 2) h += `<circle cx="20" cy="4" r="2" fill="${strokeColor}"/><circle cx="28" cy="4" r="2" fill="${strokeColor}"/>`
        if (dots === 3) h += `<circle cx="16" cy="4" r="2" fill="${strokeColor}"/><circle cx="24" cy="4" r="2" fill="${strokeColor}"/><circle cx="32" cy="4" r="2" fill="${strokeColor}"/>`
        if (lines === 2) h += `<line x1="20" y1="0" x2="20" y2="8" stroke="${strokeColor}" stroke-width="${strokeWidth}"/><line x1="28" y1="0" x2="28" y2="8" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
        return h
    }

    const drawWeapon = (baseType, crossLines) => {
        let h = `<line x1="24" y1="32" x2="24" y2="14" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
        h += `<polyline points="20,18 24,14 28,18" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`

        if (baseType === 'mortar') h += `<circle cx="24" cy="35" r="3" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
        else if (baseType === 'mg') h += `<line x1="18" y1="34" x2="30" y2="34" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
        else if (baseType === 'gl') h += `<circle cx="24" cy="23" r="3" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
        else if (baseType === 'atgm') h += `<polyline points="18,10 24,4 30,10" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`

        let yStart = baseType === 'mortar' ? 28 : 34
        if (crossLines >= 1) h += `<line x1="19" y1="${yStart}" x2="29" y2="${yStart}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
        if (crossLines >= 2) h += `<line x1="19" y1="${yStart - 4}" x2="29" y2="${yStart - 4}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
        if (crossLines >= 3) h += `<line x1="19" y1="${yStart - 8}" x2="29" y2="${yStart - 8}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
        return h
    }

    if (t === 'recon_patrol') {
        symbolHtml = `<ellipse cx="24" cy="24" rx="14" ry="7" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/><line x1="4" y1="38" x2="44" y2="10" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
        echelonHtml = drawEchelon(3, 0)
    } else if (t === 'recon_detachment') {
        symbolHtml = `<ellipse cx="24" cy="24" rx="14" ry="7" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/><line x1="4" y1="38" x2="44" y2="10" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
        echelonHtml = drawEchelon(0, 2)
    } else if (t === 'recon_group') {
        symbolHtml = `<line x1="4" y1="38" x2="44" y2="10" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
        echelonHtml = drawEchelon(2, 0)
    } else if (t === 'patrol_squad') {
        symbolHtml = `<ellipse cx="24" cy="24" rx="14" ry="7" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/><line x1="4" y1="38" x2="44" y2="10" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
        echelonHtml = drawEchelon(1, 0)
    } else if (t === 'tank' || t === 'tank_brigade') {
        symbolHtml = `<rect x="14" y="20" width="20" height="8" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/><line x1="8" y1="24" x2="40" y2="24" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
    } else if (t === 'bmp') {
        symbolHtml = `<polyline points="18,16 12,24 18,32" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/><polyline points="30,16 36,24 30,32" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/><line x1="24" y1="16" x2="24" y2="32" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
    } else if (t === 'btr') {
        symbolHtml = `<polygon points="16,30 16,22 24,16 32,22 32,30" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
    } else if (t === 'auto') {
        symbolHtml = `<polyline points="16,16 16,30 32,30 32,16" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
    } else if (t.startsWith('mortar_')) {
        symbolHtml = drawWeapon('mortar', t.includes('heavy') ? 2 : (t.includes('med') ? 1 : 0))
    } else if (t.startsWith('mg_')) {
        symbolHtml = drawWeapon('mg', t.includes('heavy') ? 2 : (t.includes('med') ? 1 : 0))
    } else if (t.startsWith('gl_')) {
        symbolHtml = drawWeapon('gl', t.includes('heavy') ? 3 : (t.includes('multi') ? 2 : (t.includes('light') ? 1 : 0)))
    } else if (t.startsWith('atgm_')) {
        symbolHtml = drawWeapon('atgm', t.includes('heavy') ? 3 : (t.includes('med') ? 2 : 1))
    } else if (t === 'infantry') {
        symbolHtml = isEnemy ? `<line x1="14" y1="14" x2="34" y2="34" stroke="${strokeColor}" stroke-width="${strokeWidth}"/><line x1="34" y1="14" x2="14" y2="34" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>` : `<line x1="4" y1="10" x2="44" y2="38" stroke="${strokeColor}" stroke-width="${strokeWidth}"/><line x1="44" y1="10" x2="4" y2="38" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
    } else if (t === 'battery') {
        symbolHtml = `<circle cx="24" cy="24" r="5" fill="${strokeColor}"/>`
    } else if (t === 'ksp') {
        shapeHtml += `<line x1="4" y1="10" x2="4" y2="58" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
        symbolHtml = `<text x="24" y="29" fill="${strokeColor}" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">КСП</text>`
    } else if (t === 'uav') {
        symbolHtml = `<text x="24" y="29" fill="${strokeColor}" font-family="monospace" font-size="20" font-weight="bold" text-anchor="middle">✈</text>`
    } else if (t === 'ew') {
        symbolHtml = `<text x="24" y="29" fill="${strokeColor}" font-family="monospace" font-size="20" font-weight="bold" text-anchor="middle">⚡</text>`
    }

    return new L.DivIcon({
        className: '',
        html: `<div style="width:48px; height:64px; filter: drop-shadow(0 0 3px ${strokeColor}66);">
            <svg width="48" height="64" viewBox="0 0 48 64">
                ${shapeHtml}
                ${symbolHtml}
                ${echelonHtml}
            </svg>
        </div>`,
        iconSize: [48, 64],
        iconAnchor: [24, 24],
    })
}

/* ═══════════════════════════════════════════════════════════════
   TRAJECTORY ARC — Перпендикулярна випукла лінія вгору (на Північ)
   ═══════════════════════════════════════════════════════════════ */
function getTrajectoryArc(lat1, lng1, lat2, lng2) {
    const points = []
    const dLat = lat2 - lat1
    const dLng = lng2 - lng1

    const midLat = (lat1 + lat2) / 2
    const midLng = (lng1 + lng2) / 2

    // Розраховуємо вектор нормалі (завжди вказує на північ)
    let nLat = dLng;
    let nLng = -dLat;

    if (nLat < 0) {
        nLat = -nLat;
        nLng = -nLng;
    }
    if (nLat === 0) {
        nLng = Math.abs(nLng);
    }

    const cpLat = midLat + (nLat * 0.2)
    const cpLng = midLng + (nLng * 0.2)

    for (let t = 0; t <= 1; t += 0.04) {
        const lat = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * cpLat + t * t * lat2
        const lng = (1 - t) * (1 - t) * lng1 + 2 * (1 - t) * t * cpLng + t * t * lng2
        points.push([lat, lng])
    }
    return points
}

/* ═══════════════════════════════════════════════════════════════
   MAP CLICK HANDLER
   ═══════════════════════════════════════════════════════════════ */
function MapClickHandler({ placementMode, placementFaction, placementColor, onPlace }) {
    useMapEvents({
        click: (e) => {
            if (placementMode) {
                onPlace(placementMode, placementFaction, placementColor, e.latlng.lat, e.latlng.lng)
            }
        },
    })
    return null
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function FireControl() {
    const [cannons, setCannons] = useState([])
    const [units, setUnits] = useState([])

    const [placementMode, setPlacementMode] = useState(null)
    const [placementFaction, setPlacementFaction] = useState('friendly')
    const [placementColor, setPlacementColor] = useState(COLORS[0])

    const [selectedUnit, setSelectedUnit] = useState(null)
    const [cannonModelIdx, setCannonModelIdx] = useState(0)
    const [targetId, setTargetId] = useState(null)

    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [trajectory, setTrajectory] = useState(null)
    const [explosion, setExplosion] = useState(null)

    const idCounter = useRef(1)

    // Fetch weapons from the database on mount
    useEffect(() => {
        axios.get('/api/weapons')
            .then(res => setCannons(res.data))
            .catch(err => console.error('Failed to load weapons:', err))
    }, [])

    const clearAll = () => {
        setUnits([])
        setSelectedUnit(null)
        setTrajectory(null)
        setExplosion(null)
        setResult(null)
        setError(null)
    }

    const placeUnit = useCallback((type, faction, color, lat, lng) => {
        const defaultColor = faction === 'enemy' ? '#ef4444' : color
        const newUnit = {
            id: idCounter.current++,
            type,
            faction,
            lat,
            lng,
            customName: '',
            color: defaultColor,
            radius: UNIT_TYPES[type].defaultRadius,
            linkedKspId: null
        }
        setUnits((prev) => [...prev, newUnit])
        setPlacementMode(null)
    }, [])

    const deleteUnit = (id) => {
        setUnits((prev) => prev.filter((u) => u.id !== id))
        if (selectedUnit?.id === id) {
            setSelectedUnit(null)
            setResult(null)
            setError(null)
        }
        setTrajectory(null)
        setExplosion(null)
    }

    const updateSelectedUnit = (key, value) => {
        setUnits(prev => prev.map(u => u.id === selectedUnit.id ? { ...u, [key]: value } : u))
        setSelectedUnit(prev => ({ ...prev, [key]: value }))
    }

    const selectUnit = (unit) => {
        setSelectedUnit(unit)
        setResult(null)
        setError(null)
        setTrajectory(null)
        setExplosion(null)

        if (unit.type === 'battery') {
            setCannonModelIdx(0)
            const targets = units.filter((u) => u.faction === 'enemy')
            setTargetId(targets.length > 0 ? targets[0].id : null)
        }
    }

    /* ── ФУНКЦІЯ ПОСТРІЛУ ── */
    const handleFire = async () => {
        if (!selectedUnit || selectedUnit.type !== 'battery') return

        // 1. ПЕРЕВІРКА: ЧИ ГАРМАТА В АВТОНОМНОМУ РЕЖИМІ (відірвана від КСП)
        let isDisconnected = false;
        if (selectedUnit.faction === 'friendly' && !selectedUnit.linkedKspId) {
            isDisconnected = true;
        } else if (selectedUnit.faction === 'friendly' && selectedUnit.linkedKspId) {
            const ksp = units.find(k => k.id === selectedUnit.linkedKspId);
            if (ksp) {
                const dist = L.latLng(selectedUnit.lat, selectedUnit.lng).distanceTo(L.latLng(ksp.lat, ksp.lng));
                if (dist > ksp.radius) isDisconnected = true;
            } else {
                isDisconnected = true;
            }
        }

        if (isDisconnected) {
            setError('Дії неможливі: гармата в автономному режимі (відсутній зв\'язок з КСП)!')
            return
        }

        // 2. ПЕРЕВІРКА ЦІЛІ
        const target = units.find((u) => u.id === targetId)
        if (!target) {
            setError('Оберіть ціль для пострілу!')
            return
        }

        const cannonCfg = cannons[cannonModelIdx]
        setLoading(true)
        setResult(null)
        setError(null)
        setTrajectory(null)
        setExplosion(null)

        try {
            const res = await axios.post('/api/calculate_shot', {
                cannon_lat: selectedUnit.lat,
                cannon_lng: selectedUnit.lng,
                target_lat: target.lat,
                target_lng: target.lng,
                velocity: cannonCfg.muzzle_velocity_ms,
                max_range: cannonCfg.max_range_m,
            })

            if (res.data.status === 'error') {
                setError(res.data.message)
            } else {
                setResult(res.data)
                setTrajectory(getTrajectoryArc(selectedUnit.lat, selectedUnit.lng, target.lat, target.lng))

                // Відображаємо вибух і ховаємо через 3 секунди
                setExplosion({ lat: target.lat, lng: target.lng })
                setTimeout(() => setExplosion(null), 3000)
            }
        } catch {
            setError("Помилка зв'язку з сервером.")
        } finally {
            setLoading(false)
        }
    }

    const enemies = units.filter((u) => u.faction === 'enemy')
    const currentCannon = cannons[cannonModelIdx]

    return (
        <div className="fc-root">

            {/* ═══ ЛІВА ПАНЕЛЬ — Розміщення ═══ */}
            <div className="fc-panel fc-panel-left">
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '10px' }}>Розгортання військ</h3>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <button
                        onClick={() => setPlacementFaction('friendly')}
                        style={{ flex: 1, padding: '8px', background: placementFaction === 'friendly' ? '#3b82f6' : '#333', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                    >Наші</button>
                    <button
                        onClick={() => setPlacementFaction('enemy')}
                        style={{ flex: 1, padding: '8px', background: placementFaction === 'enemy' ? '#ef4444' : '#333', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                    >Ворог</button>
                </div>

                {placementFaction === 'friendly' && (
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '15px', flexWrap: 'wrap' }}>
                        {COLORS.map(c => (
                            <div
                                key={c}
                                onClick={() => setPlacementColor(c)}
                                style={{ width: '24px', height: '24px', background: c, cursor: 'pointer', borderRadius: '50%', border: placementColor === c ? '2px solid white' : '2px solid transparent' }}
                            />
                        ))}
                    </div>
                )}

                {placementMode && (
                    <div style={{ marginBottom: '15px', padding: '10px', background: '#3b82f644', border: '1px solid #3b82f6', borderRadius: '4px', fontSize: '13px' }}>
                        ▶ Ставимо: <strong>{UNIT_TYPES[placementMode].label}</strong>
                        <button onClick={() => setPlacementMode(null)} style={{ float: 'right', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
                    </div>
                )}

                {/* Групування кнопок по категоріям */}
                {Object.entries(CATEGORIES).map(([catKey, catLabel]) => (
                    <div key={catKey} style={{ marginBottom: '15px' }}>
                        <h4 style={{ color: '#aaa', fontSize: '12px', borderBottom: '1px solid #444', paddingBottom: '4px', marginBottom: '8px', marginTop: 0 }}>
                            {catLabel}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {Object.entries(UNIT_TYPES)
                                .filter(([_, cfg]) => cfg.category === catKey)
                                .map(([key, cfg]) => (
                                    <button
                                        key={key}
                                        onClick={() => setPlacementMode(key)}
                                        style={{
                                            padding: '6px 10px',
                                            textAlign: 'left',
                                            fontSize: '13px',
                                            background: placementMode === key ? '#444' : '#2a2a2a',
                                            color: '#fff',
                                            border: `1px solid ${placementMode === key ? placementColor : '#444'}`,
                                            borderRadius: '3px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {cfg.label}
                                    </button>
                                ))}
                        </div>
                    </div>
                ))}

                <hr style={{ borderColor: '#444', margin: '20px 0' }} />

                <button
                    onClick={clearAll}
                    style={{ width: '100%', padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Стерти всі одиниці
                </button>
            </div>

            {/* ═══ КАПТА ═══ */}
            <div className="fc-map-wrap">
                <MapContainer center={[49.0, 31.0]} zoom={6} className="fc-map" zoomControl={false}>
                    <TileLayer
                        attribution='&copy; OpenTopoMap'
                        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                        maxZoom={17}
                    />
                    <MapClickHandler
                        placementMode={placementMode}
                        placementFaction={placementFaction}
                        placementColor={placementColor}
                        onPlace={placeUnit}
                    />

                    {units.map((u) => {
                        let isDisconnected = false;

                        // Відключаємо логіку КСП для нових сутностей (вони завжди кольорові)
                        if (u.faction === 'friendly' && UNIT_TYPES[u.type].category === 'main' && u.type !== 'ksp') {
                            if (!u.linkedKspId) {
                                isDisconnected = true;
                            } else {
                                const ksp = units.find(k => k.id === u.linkedKspId);
                                if (ksp) {
                                    const dist = L.latLng(u.lat, u.lng).distanceTo(L.latLng(ksp.lat, ksp.lng));
                                    if (dist > ksp.radius) isDisconnected = true;
                                } else {
                                    isDisconnected = true;
                                }
                            }
                        }

                        const isSelected = selectedUnit?.id === u.id;
                        let currentRadius = u.radius;
                        if (u.type === 'battery' && isSelected && cannons[cannonModelIdx]) {
                            currentRadius = cannons[cannonModelIdx].max_range_m;
                        }

                        // Малюємо радіус тільки для "основних" сутностей
                        const shouldDrawRadius = isSelected && currentRadius > 0 && UNIT_TYPES[u.type].category === 'main';

                        return (
                            <React.Fragment key={u.id}>
                                <Marker
                                    position={[u.lat, u.lng]}
                                    icon={makeIcon(u, isDisconnected)}
                                    eventHandlers={{ click: () => selectUnit(u) }}
                                />

                                {shouldDrawRadius && (
                                    <Circle
                                        center={[u.lat, u.lng]}
                                        radius={currentRadius}
                                        pathOptions={{
                                            color: u.color,
                                            fillColor: u.color,
                                            fillOpacity: 0.15,
                                            weight: 2,
                                            dashArray: '5, 10'
                                        }}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}

                    {trajectory && (
                        <Polyline
                            positions={trajectory}
                            pathOptions={{ color: '#ff0000', weight: 4, dashArray: '10 10', opacity: 0.9 }}
                        />
                    )}
                    {explosion && (
                        <Marker
                            position={[explosion.lat, explosion.lng]}
                            icon={L.divIcon({
                                html: '<span style="font-size: 24px; filter: drop-shadow(0 0 10px red);">💥</span>',
                                className: 'explosion-marker',
                                iconSize: [30, 30],
                                iconAnchor: [15, 15]
                            })}
                        />
                    )}
                </MapContainer>
            </div>

            {/* ═══ ПРАВА ПАНЕЛЬ — Інфо ═══ */}
            <div className="fc-panel fc-panel-right">
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '10px' }}>Управління одиницею</h3>

                {!selectedUnit ? (
                    <p style={{ color: '#aaa', fontSize: '14px' }}>Оберіть одиницю на мапі для взаємодії.</p>
                ) : (
                    <div>
                        <div style={{ padding: '8px 10px', background: selectedUnit.color + '33', borderLeft: `4px solid ${selectedUnit.color}`, marginBottom: '15px', borderRadius: '0 4px 4px 0' }}>
                            <strong>{selectedUnit.faction === 'enemy' ? 'ВОРОГ: ' : ''}{UNIT_TYPES[selectedUnit.type].label}</strong>
                        </div>

                        <div style={{ marginBottom: '15px', fontSize: '14px', background: '#2a2a2a', padding: '10px', borderRadius: '4px' }}>
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ color: '#aaa', display: 'inline-block', width: '45px' }}>Lat:</span>
                                <input
                                    type="number"
                                    step="0.00001"
                                    value={selectedUnit.lat}
                                    onChange={(e) => updateSelectedUnit('lat', parseFloat(e.target.value) || 0)}
                                    style={{ width: '130px', padding: '6px', background: '#333', border: '1px solid #555', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <span style={{ color: '#aaa', display: 'inline-block', width: '45px' }}>Lng:</span>
                                <input
                                    type="number"
                                    step="0.00001"
                                    value={selectedUnit.lng}
                                    onChange={(e) => updateSelectedUnit('lng', parseFloat(e.target.value) || 0)}
                                    style={{ width: '130px', padding: '6px', background: '#333', border: '1px solid #555', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        {/* Назва / Нотатка (для всіх) */}
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Назва / Позивний / Нотатка:</label>
                            <input
                                type="text"
                                value={selectedUnit.customName || ''}
                                onChange={(e) => updateSelectedUnit('customName', e.target.value)}
                                style={{ width: '100%', padding: '8px', background: '#333', border: '1px solid #555', color: '#fff', boxSizing: 'border-box', borderRadius: '4px' }}
                                placeholder="Напр: 1мБ 13 ОМБр"
                            />
                        </div>

                        {/* Радіус та КСП показуємо ТІЛЬКИ для основної категорії */}
                        {UNIT_TYPES[selectedUnit.type].category === 'main' && (
                            <>
                                {selectedUnit.type !== 'battery' && (
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Радіус дії / зв'язку (м):</label>
                                        <input
                                            type="number"
                                            value={selectedUnit.radius || 0}
                                            onChange={(e) => updateSelectedUnit('radius', parseInt(e.target.value) || 0)}
                                            style={{ width: '100%', padding: '8px', background: '#333', border: '1px solid #555', color: '#fff', boxSizing: 'border-box', borderRadius: '4px' }}
                                        />
                                    </div>
                                )}

                                {selectedUnit.faction === 'friendly' && selectedUnit.type !== 'ksp' && (
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Підпорядкування (КСП):</label>
                                        <select
                                            value={selectedUnit.linkedKspId || ''}
                                            onChange={(e) => updateSelectedUnit('linkedKspId', parseInt(e.target.value) || null)}
                                            style={{ width: '100%', padding: '8px', background: '#333', border: '1px solid #555', color: '#fff', boxSizing: 'border-box', borderRadius: '4px' }}
                                        >
                                            <option value="">-- Без зв'язку (Автономно) --</option>
                                            {units.filter(u => u.type === 'ksp' && u.faction === 'friendly').map(ksp => (
                                                <option key={ksp.id} value={ksp.id}>
                                                    {ksp.customName || `КСП #${ksp.id}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </>
                        )}

                        <hr style={{ borderColor: '#444', margin: '20px 0' }} />

                        {/* ── ЛОГІКА ПОСТРІЛУ ДЛЯ БАТАРЕЇ ── */}
                        {selectedUnit.type === 'battery' && (
                            <div style={{ background: '#2a2a2a', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Гармата:</label>
                                <select
                                    value={cannonModelIdx}
                                    onChange={(e) => setCannonModelIdx(parseInt(e.target.value))}
                                    style={{ width: '100%', padding: '8px', background: '#333', border: '1px solid #555', color: '#fff', marginBottom: '10px', boxSizing: 'border-box', borderRadius: '4px' }}
                                >
                                    {cannons.map((c, i) => (
                                        <option key={i} value={i}>{c.name}</option>
                                    ))}
                                </select>

                                <div style={{ fontSize: '12px', color: '#bbb', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div>Швидкість: {currentCannon?.muzzle_velocity_ms ?? '—'} м/с</div>
                                    <div>Дальність: {currentCannon?.max_range_m ?? '—'} м</div>
                                </div>

                                <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Ціль (Ворог):</label>
                                {enemies.length > 0 ? (
                                    <select
                                        value={targetId || ''}
                                        onChange={(e) => setTargetId(parseInt(e.target.value))}
                                        style={{ width: '100%', padding: '8px', background: '#333', border: '1px solid #555', color: '#fff', marginBottom: '15px', boxSizing: 'border-box', borderRadius: '4px' }}
                                    >
                                        <option value="" disabled>-- Оберіть ціль --</option>
                                        {enemies.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {UNIT_TYPES[t.type].label} {t.customName ? `(${t.customName})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p style={{ color: '#ef4444', fontSize: '12px' }}>Спочатку розгорніть ворога на мапі!</p>
                                )}

                                <button
                                    onClick={handleFire}
                                    disabled={loading || enemies.length === 0 || !targetId}
                                    style={{ width: '100%', padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                                >
                                    {loading ? 'Розрахунок...' : 'ВОГОНЬ'}
                                </button>

                                {result && (
                                    <div style={{ marginTop: '15px', padding: '10px', background: '#22c55e22', border: '1px solid #22c55e', borderRadius: '4px', color: '#4ade80', fontSize: '14px' }}>
                                        <strong style={{ display: 'block', marginBottom: '8px' }}>✅ ВЛУЧАННЯ МОЖЛИВЕ</strong>
                                        <div>Відстань: {result.distance} м</div>
                                        <div>Азимут: {result.azimuth}°</div>
                                        <div>Кут підйому: {result.elevation}°</div>
                                    </div>
                                )}
                                {error && (
                                    <div style={{ marginTop: '15px', padding: '10px', background: '#ef444422', border: '1px solid #ef4444', borderRadius: '4px', color: '#ff8888', fontSize: '14px' }}>
                                        <strong>ПОМИЛКА:</strong> {error}
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={() => deleteUnit(selectedUnit.id)}
                            style={{ width: '100%', padding: '10px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Прибрати одиницю
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
