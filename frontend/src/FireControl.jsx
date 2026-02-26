import React, { useState, useCallback, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios'
import 'leaflet/dist/leaflet.css'

const UNIT_TYPES = {
    infantry: { label: 'Піхота', defaultRadius: 400, category: 'main' },
    battery: { label: 'Батарея (Арта)', defaultRadius: 0, category: 'main' },
    ksp: { label: 'КСП', defaultRadius: 5000, category: 'main' },
    tank_brigade: { label: 'Танкова бригада', defaultRadius: 2500, category: 'main' },
    uav: { label: 'Підрозділ БПЛА', defaultRadius: 15000, category: 'main' },
    ew: { label: 'РЕБ', defaultRadius: 8000, category: 'main' },

    recon_patrol: { label: 'Розвідувальний дозор', defaultRadius: 0, category: 'recon' },
    recon_detachment: { label: 'Розвідувальний загін', defaultRadius: 0, category: 'recon' },
    recon_group: { label: 'Розвідувальна група', defaultRadius: 0, category: 'recon' },
    patrol_squad: { label: 'Дозорне відділення', defaultRadius: 0, category: 'recon' },

    tank: { label: 'Танк', defaultRadius: 0, category: 'vehicle' },
    bmp: { label: 'БМП', defaultRadius: 0, category: 'vehicle' },
    btr: { label: 'БТР', defaultRadius: 0, category: 'vehicle' },
    auto: { label: 'Автомобіль', defaultRadius: 0, category: 'vehicle' },

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

const COLORS = ['#4d9fff', '#00e676', '#bf5af2', '#ffca28', '#ff4081', '#00e5ff', '#ff5252', '#ff6d00']

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

function getTrajectoryArc(lat1, lng1, lat2, lng2) {
    const points = []
    const dLat = lat2 - lat1
    const dLng = lng2 - lng1

    const midLat = (lat1 + lat2) / 2
    const midLng = (lng1 + lng2) / 2

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

function MapController({ mapRef }) {
    const map = useMap()
    useEffect(() => {
        if (mapRef) mapRef.current = map
    }, [map, mapRef])
    return null
}

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
    const mapRef = useRef(null)

    const [gotoLat, setGotoLat] = useState('')
    const [gotoLng, setGotoLng] = useState('')

    const handleGoto = () => {
        const lat = parseFloat(gotoLat)
        const lng = parseFloat(gotoLng)
        if (!isNaN(lat) && !isNaN(lng) && mapRef.current) {
            mapRef.current.flyTo([lat, lng], 13, { duration: 1.5 })
        }
    }

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

    const handleFire = async () => {
        if (!selectedUnit || selectedUnit.type !== 'battery') return

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

            {/* ═══ LEFT PANEL — Deployment ═══ */}
            <div className="fc-panel fc-panel-left">
                <h3 className="fc-panel-title">Розгортання військ</h3>

                <div className="fc-faction-row" style={{ marginTop: '14px' }}>
                    <button
                        onClick={() => setPlacementFaction('friendly')}
                        className={`fc-faction-btn ${placementFaction === 'friendly' ? 'fc-friendly-active' : ''}`}
                    >Наші</button>
                    <button
                        onClick={() => setPlacementFaction('enemy')}
                        className={`fc-faction-btn ${placementFaction === 'enemy' ? 'fc-enemy-active' : ''}`}
                    >Ворог</button>
                </div>

                {placementFaction === 'friendly' && (
                    <div className="fc-color-row">
                        {COLORS.map(c => (
                            <div
                                key={c}
                                onClick={() => setPlacementColor(c)}
                                className={`fc-color-swatch ${placementColor === c ? 'active' : ''}`}
                                style={{ background: c }}
                            />
                        ))}
                    </div>
                )}

                {placementMode && (
                    <div className="fc-placement-banner">
                        <span>▶ Ставимо: <strong>{UNIT_TYPES[placementMode].label}</strong></span>
                        <button onClick={() => setPlacementMode(null)} className="fc-placement-close">✕</button>
                    </div>
                )}

                {Object.entries(CATEGORIES).map(([catKey, catLabel]) => (
                    <div key={catKey} className="fc-cat-group">
                        <h4 className="fc-cat-header">{catLabel}</h4>
                        <div className="fc-cat-list">
                            {Object.entries(UNIT_TYPES)
                                .filter(([_, cfg]) => cfg.category === catKey)
                                .map(([key, cfg]) => (
                                    <button
                                        key={key}
                                        onClick={() => setPlacementMode(key)}
                                        className={`fc-unit-btn ${placementMode === key ? 'active' : ''}`}
                                        style={placementMode === key ? { borderColor: placementColor } : undefined}
                                    >
                                        {cfg.label}
                                    </button>
                                ))}
                        </div>
                    </div>
                ))}

                <div className="fc-divider" />

                <button onClick={clearAll} className="fc-clear-btn">
                    Стерти всі одиниці
                </button>

                <div className="fc-divider" />

                <div className="fc-cat-group">
                    <h4 className="fc-cat-header">Навігація</h4>
                    <div className="fc-coord-box">
                        <div className="fc-coord-row">
                            <span className="fc-coord-label">LAT</span>
                            <input
                                type="number"
                                step="0.00001"
                                value={gotoLat}
                                onChange={(e) => setGotoLat(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGoto()}
                                className="fc-coord-input"
                                placeholder="49.0"
                            />
                        </div>
                        <div className="fc-coord-row">
                            <span className="fc-coord-label">LNG</span>
                            <input
                                type="number"
                                step="0.00001"
                                value={gotoLng}
                                onChange={(e) => setGotoLng(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGoto()}
                                className="fc-coord-input"
                                placeholder="31.0"
                            />
                        </div>
                        <button onClick={handleGoto} className="fc-unit-btn" style={{ width: '100%', marginTop: '8px', textAlign: 'center' }}>
                            Перейти ▶
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══ MAP ═══ */}
            <div className="fc-map-wrap">
                <MapContainer center={[49.0, 31.0]} zoom={6} className="fc-map" zoomControl={false}>
                    <TileLayer
                        attribution='&copy; OpenTopoMap'
                        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                        maxZoom={17}
                    />
                    <MapController mapRef={mapRef} />
                    <MapClickHandler
                        placementMode={placementMode}
                        placementFaction={placementFaction}
                        placementColor={placementColor}
                        onPlace={placeUnit}
                    />

                    {units.map((u) => {
                        let isDisconnected = false;

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

            {/* ═══ RIGHT PANEL — Unit Info ═══ */}
            <div className="fc-panel fc-panel-right">
                <h3 className="fc-panel-title">Управління одиницею</h3>

                {!selectedUnit ? (
                    <p className="fc-info-text" style={{ marginTop: '14px' }}>Оберіть одиницю на мапі для взаємодії.</p>
                ) : (
                    <div style={{ marginTop: '14px' }}>
                        <div className="fc-selected-badge" style={{ borderLeftColor: selectedUnit.color, background: `${selectedUnit.color}20` }}>
                            {selectedUnit.faction === 'enemy' ? 'ВОРОГ: ' : ''}{UNIT_TYPES[selectedUnit.type].label}
                        </div>

                        <div className="fc-coord-box">
                            <div className="fc-coord-row">
                                <span className="fc-coord-label">LAT</span>
                                <input
                                    type="number"
                                    step="0.00001"
                                    value={selectedUnit.lat}
                                    onChange={(e) => updateSelectedUnit('lat', parseFloat(e.target.value) || 0)}
                                    className="fc-coord-input"
                                />
                            </div>
                            <div className="fc-coord-row">
                                <span className="fc-coord-label">LNG</span>
                                <input
                                    type="number"
                                    step="0.00001"
                                    value={selectedUnit.lng}
                                    onChange={(e) => updateSelectedUnit('lng', parseFloat(e.target.value) || 0)}
                                    className="fc-coord-input"
                                />
                            </div>
                        </div>

                        <div className="fc-field-group">
                            <label className="fc-field-label">Назва / Позивний / Нотатка</label>
                            <input
                                type="text"
                                value={selectedUnit.customName || ''}
                                onChange={(e) => updateSelectedUnit('customName', e.target.value)}
                                className="fc-text-input"
                                placeholder="Напр: 1мБ 13 ОМБр"
                            />
                        </div>

                        {UNIT_TYPES[selectedUnit.type].category === 'main' && (
                            <>
                                {selectedUnit.type !== 'battery' && (
                                    <div className="fc-field-group">
                                        <label className="fc-field-label">Радіус дії / зв'язку (м)</label>
                                        <input
                                            type="number"
                                            value={selectedUnit.radius || 0}
                                            onChange={(e) => updateSelectedUnit('radius', parseInt(e.target.value) || 0)}
                                            className="fc-text-input"
                                        />
                                    </div>
                                )}

                                {selectedUnit.faction === 'friendly' && selectedUnit.type !== 'ksp' && (
                                    <div className="fc-field-group">
                                        <label className="fc-field-label">Підпорядкування (КСП)</label>
                                        <select
                                            value={selectedUnit.linkedKspId || ''}
                                            onChange={(e) => updateSelectedUnit('linkedKspId', parseInt(e.target.value) || null)}
                                            className="fc-select"
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

                        <div className="fc-divider" />

                        {selectedUnit.type === 'battery' && (
                            <div className="fc-battery-box">
                                <label className="fc-field-label">Гармата</label>
                                <select
                                    value={cannonModelIdx}
                                    onChange={(e) => setCannonModelIdx(parseInt(e.target.value))}
                                    className="fc-select"
                                >
                                    {cannons.map((c, i) => (
                                        <option key={i} value={i}>{c.name}</option>
                                    ))}
                                </select>

                                <div className="fc-battery-stats">
                                    <div>Швидкість: <span>{currentCannon?.muzzle_velocity_ms ?? '—'}</span> м/с</div>
                                    <div>Дальність: <span>{currentCannon?.max_range_m ?? '—'}</span> м</div>
                                </div>

                                <label className="fc-field-label">Ціль (Ворог)</label>
                                {enemies.length > 0 ? (
                                    <select
                                        value={targetId || ''}
                                        onChange={(e) => setTargetId(parseInt(e.target.value))}
                                        className="fc-select"
                                    >
                                        <option value="" disabled>-- Оберіть ціль --</option>
                                        {enemies.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {UNIT_TYPES[t.type].label} {t.customName ? `(${t.customName})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="fc-no-targets">Спочатку розгорніть ворога на мапі!</p>
                                )}

                                <button
                                    onClick={handleFire}
                                    disabled={loading || enemies.length === 0 || !targetId}
                                    className="fc-fire-btn"
                                >
                                    {loading ? (
                                        <><div className="fc-spinner" /> Розрахунок...</>
                                    ) : 'ВОГОНЬ'}
                                </button>

                                {result && (
                                    <div className="fc-result fc-result-success">
                                        <span className="fc-result-badge">✅ ВЛУЧАННЯ МОЖЛИВЕ</span>
                                        <div className="fc-stat-row">
                                            <span className="fc-stat-label">Відстань</span>
                                            <span className="fc-stat-value">{result.distance} м</span>
                                        </div>
                                        <div className="fc-stat-row">
                                            <span className="fc-stat-label">Азимут</span>
                                            <span className="fc-stat-value">{result.azimuth}°</span>
                                        </div>
                                        <div className="fc-stat-row">
                                            <span className="fc-stat-label">Кут підйому</span>
                                            <span className="fc-stat-value">{result.elevation}°</span>
                                        </div>
                                    </div>
                                )}
                                {error && (
                                    <div className="fc-result fc-result-error">
                                        <span className="fc-result-badge">ПОМИЛКА</span>
                                        <p>{error}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <button onClick={() => deleteUnit(selectedUnit.id)} className="fc-delete-btn">
                            Прибрати одиницю
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
