import { useState, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios'
import 'leaflet/dist/leaflet.css'

/* ═══════════════════════════════════════════════════════════════
   CANNON DATABASE — 20 real-world artillery pieces
   ═══════════════════════════════════════════════════════════════ */
const CANNONS = [
    { name: '10.5 cm leFH 18', caliber_mm: 105, muzzle_velocity_ms: 470, max_range_m: 10675 },
    { name: '100 mm field gun M1944 (BS-3)', caliber_mm: 100, muzzle_velocity_ms: 900, max_range_m: 20000 },
    { name: '122 mm gun M1931/37 (A-19)', caliber_mm: 122, muzzle_velocity_ms: 806, max_range_m: 20400 },
    { name: '122 mm howitzer 2A18 (D-30)', caliber_mm: 122, muzzle_velocity_ms: 690, max_range_m: 21900 },
    { name: '122 mm howitzer M1938 (M-30)', caliber_mm: 121.92, muzzle_velocity_ms: 515, max_range_m: 11800 },
    { name: '130 mm towed field gun M1954 (M-46)', caliber_mm: 130, muzzle_velocity_ms: 930, max_range_m: 27150 },
    { name: '15 cm sFH 18', caliber_mm: 149, muzzle_velocity_ms: 520, max_range_m: 18200 },
    { name: '152 mm gun-howitzer D-20', caliber_mm: 152.4, muzzle_velocity_ms: 650, max_range_m: 24000 },
    { name: '152 mm howitzer 2A65 Msta-B', caliber_mm: 152.4, muzzle_velocity_ms: 828, max_range_m: 24700 },
    { name: '152 mm howitzer M1943 (D-1)', caliber_mm: 152.4, muzzle_velocity_ms: 508, max_range_m: 12400 },
    { name: '152 mm howitzer-gun M1937 (ML-20)', caliber_mm: 152.4, muzzle_velocity_ms: 655, max_range_m: 17230 },
    { name: '155 mm gun M1 (Long Tom)', caliber_mm: 155, muzzle_velocity_ms: 853, max_range_m: 23700 },
    { name: '203 mm howitzer M1931 (B-4)', caliber_mm: 203.2, muzzle_velocity_ms: 607, max_range_m: 18000 },
    { name: '85 mm divisional gun D-44', caliber_mm: 85, muzzle_velocity_ms: 1030, max_range_m: 15650 },
    { name: 'Canon de 75 modèle 1897', caliber_mm: 75, muzzle_velocity_ms: 500, max_range_m: 11000 },
    { name: 'M102 howitzer', caliber_mm: 105, muzzle_velocity_ms: 494, max_range_m: 15100 },
    { name: 'M114 155 mm howitzer', caliber_mm: 155, muzzle_velocity_ms: 563, max_range_m: 14600 },
    { name: 'M198 howitzer', caliber_mm: 155, muzzle_velocity_ms: 684, max_range_m: 40000 },
    { name: 'M777 Lightweight Towed Howitzer', caliber_mm: 155, muzzle_velocity_ms: 827, max_range_m: 40000 },
    { name: 'Ordnance QF 25-pounder', caliber_mm: 87.6, muzzle_velocity_ms: 532, max_range_m: 12253 },
]

/* ═══════════════════════════════════════════════════════════════
   UNIT TYPE CONFIG
   ═══════════════════════════════════════════════════════════════ */
const UNIT_TYPES = {
    infantry: {
        label: 'Infantry',
        labelUa: 'Мехбат',
        iconHtml: '',
        iconClass: 'nato-icon-friendly',
        color: '#3b82f6',
    },
    cannon: {
        label: 'Artillery',
        labelUa: 'Гармата',
        iconHtml: '●',
        iconClass: 'nato-icon-friendly',
        color: '#22c55e',
    },
    ksp: {
        label: 'CP',
        labelUa: 'КСП',
        iconHtml: '||',
        iconClass: 'nato-icon-friendly',
        color: '#a855f7',
    },
    target: {
        label: 'Target',
        labelUa: 'Ціль',
        iconHtml: '✖',
        iconClass: 'nato-icon-enemy',
        color: '#ef4444',
    },
}

/* ═══════════════════════════════════════════════════════════════
   LEAFLET ICON FACTORY
   ═══════════════════════════════════════════════════════════════ */
function makeIcon(type) {
    const cfg = UNIT_TYPES[type]
    const isEnemy = type === 'target'
    const bg = isEnemy ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)'
    const border = isEnemy ? '#ef4444' : '#3b82f6'
    const color = isEnemy ? '#ef4444' : '#3b82f6'

    // NATO symbols have diagonal lines for friendly units
    const bgImage = isEnemy
        ? ''
        : `background-image:
            linear-gradient(to top right, transparent 46%, ${border} 46%, ${border} 54%, transparent 54%),
            linear-gradient(to bottom right, transparent 46%, ${border} 46%, ${border} 54%, transparent 54%);`

    return new L.DivIcon({
        className: '',
        html: `<div style="
            width:40px;height:28px;
            background:${bg};
            border:2px solid ${border};
            color:${color};
            text-align:center;
            font-weight:bold;
            line-height:24px;
            font-size:${type === 'target' ? '16px' : '12px'};
            font-family:'Share Tech Mono',monospace;
            ${bgImage}
            box-shadow:0 0 10px ${border}44;
        ">${cfg.iconHtml}</div>`,
        iconSize: [40, 28],
        iconAnchor: [20, 14],
    })
}

/* ═══════════════════════════════════════════════════════════════
   TRAJECTORY ARC — Bézier curve (always arcs north/up)
   ═══════════════════════════════════════════════════════════════ */
function getTrajectoryArc(lat1, lng1, lat2, lng2) {
    const points = []
    const dLat = lat2 - lat1
    const dLng = lng2 - lng1
    const dist = Math.sqrt(dLat * dLat + dLng * dLng)

    const cpLat = (lat1 + lat2) / 2 + dist * 0.25
    const cpLng = (lng1 + lng2) / 2

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
function MapClickHandler({ placementMode, onPlace }) {
    useMapEvents({
        click: (e) => {
            if (placementMode) {
                onPlace(placementMode, e.latlng.lat, e.latlng.lng)
            }
        },
    })
    return null
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function FireControl() {
    const [units, setUnits] = useState([])
    const [placementMode, setPlacementMode] = useState(null)
    const [selectedUnit, setSelectedUnit] = useState(null)
    const [cannonModelIdx, setCannonModelIdx] = useState(0)
    const [targetId, setTargetId] = useState(null)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [trajectory, setTrajectory] = useState(null)
    const [manualType, setManualType] = useState('infantry')
    const [manualLat, setManualLat] = useState('')
    const [manualLng, setManualLng] = useState('')
    const idCounter = useRef(1)

    /* ── Place unit on map ── */
    const placeUnit = useCallback((type, lat, lng) => {
        const newUnit = { id: idCounter.current++, type, lat, lng }
        setUnits((prev) => [...prev, newUnit])
        setPlacementMode(null)
    }, [])

    /* ── Manual coordinate entry ── */
    const addByCoords = () => {
        const lat = parseFloat(manualLat)
        const lng = parseFloat(manualLng)
        if (isNaN(lat) || isNaN(lng)) return
        placeUnit(manualType, lat, lng)
        setManualLat('')
        setManualLng('')
    }

    /* ── Delete unit ── */
    const deleteUnit = (id) => {
        setUnits((prev) => prev.filter((u) => u.id !== id))
        if (selectedUnit?.id === id) {
            setSelectedUnit(null)
            setResult(null)
            setError(null)
        }
        setTrajectory(null)
    }

    /* ── Select unit on click ── */
    const selectUnit = (unit) => {
        setSelectedUnit(unit)
        setResult(null)
        setError(null)

        if (unit.type === 'cannon') {
            setCannonModelIdx(0)
            const targets = units.filter((u) => u.type === 'target')
            setTargetId(targets.length > 0 ? targets[0].id : null)
        }
    }

    /* ── Fire! ── */
    const handleFire = async () => {
        if (!selectedUnit || selectedUnit.type !== 'cannon') return
        const target = units.find((u) => u.id === targetId)
        if (!target) {
            setError('Оберіть ціль для пострілу!')
            return
        }

        const cannonCfg = CANNONS[cannonModelIdx]

        setLoading(true)
        setResult(null)
        setError(null)
        setTrajectory(null)

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
                setTrajectory(
                    getTrajectoryArc(selectedUnit.lat, selectedUnit.lng, target.lat, target.lng)
                )
            }
        } catch {
            setError("Помилка зв'язку з сервером.")
        } finally {
            setLoading(false)
        }
    }

    const targets = units.filter((u) => u.type === 'target')
    const currentCannon = CANNONS[cannonModelIdx]

    return (
        <div className="fc-root">
            {/* ═══ LEFT PANEL — Unit Placement ═══ */}
            <div className="fc-panel fc-panel-left">
                {/* Header */}
                <div className="fc-panel-header">
                    <span className="fc-blink-dot" />
                    <span className="fc-label">Unit Deployment</span>
                </div>

                {/* Placement buttons */}
                <p className="fc-hint">Click button, then click on map:</p>
                {Object.entries(UNIT_TYPES).map(([key, cfg]) => (
                    <button
                        key={key}
                        onClick={() => setPlacementMode(key)}
                        className={`fc-place-btn ${placementMode === key ? 'active' : ''}`}
                        style={{ '--btn-accent': cfg.color }}
                    >
                        <span className="fc-place-dot" style={{ background: cfg.color }} />
                        {cfg.label}
                        <span className="fc-place-ua">({cfg.labelUa})</span>
                    </button>
                ))}

                {placementMode && (
                    <div className="fc-mode-banner">
                        ▶ Placing: {UNIT_TYPES[placementMode].label}
                        <button onClick={() => setPlacementMode(null)} className="fc-cancel-btn">✕</button>
                    </div>
                )}

                {/* Divider */}
                <div className="fc-divider" />

                {/* Manual coordinates */}
                <span className="fc-sublabel">Or enter coordinates:</span>
                <select
                    value={manualType}
                    onChange={(e) => setManualType(e.target.value)}
                    className="fc-select"
                >
                    {Object.entries(UNIT_TYPES).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label} ({cfg.labelUa})</option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Latitude (e.g. 49.01)"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    className="fire-control-input"
                />
                <input
                    type="text"
                    placeholder="Longitude (e.g. 31.02)"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    className="fire-control-input"
                />
                <button onClick={addByCoords} className="fc-action-btn fc-add-btn">
                    Add by Coordinates
                </button>
            </div>

            {/* ═══ MAP ═══ */}
            <MapContainer
                center={[49.0, 31.0]}
                zoom={6}
                className="fc-map"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; OpenTopoMap'
                    url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                    maxZoom={17}
                />
                <MapClickHandler placementMode={placementMode} onPlace={placeUnit} />

                {units.map((u) => (
                    <Marker
                        key={u.id}
                        position={[u.lat, u.lng]}
                        icon={makeIcon(u.type)}
                        eventHandlers={{ click: () => selectUnit(u) }}
                    />
                ))}

                {trajectory && (
                    <Polyline
                        positions={trajectory}
                        pathOptions={{
                            color: '#ef4444',
                            weight: 3,
                            dashArray: '6 8',
                            opacity: 0.85,
                        }}
                    />
                )}
            </MapContainer>

            {/* ═══ RIGHT PANEL — Control & Info ═══ */}
            <div className="fc-panel fc-panel-right">
                <div className="fc-panel-header">
                    <span className="fc-blink-dot" />
                    <span className="fc-label">Control Panel</span>
                </div>

                {!selectedUnit && (
                    <div className="fc-empty-state">
                        <span className="fc-hint">Select a unit on the map to interact.</span>
                    </div>
                )}

                {selectedUnit && selectedUnit.type === 'cannon' && (
                    <div className="fc-cannon-panel">
                        <div className="fc-section-badge" style={{ color: '#22c55e', borderColor: '#22c55e44' }}>
                            Artillery Position
                        </div>

                        <div className="fc-stat-row">
                            <span className="fc-stat-label">Position:</span>
                            <span className="fc-stat-value">{selectedUnit.lat.toFixed(5)}, {selectedUnit.lng.toFixed(5)}</span>
                        </div>

                        {/* Cannon model selector */}
                        <span className="fc-sublabel">Cannon Model:</span>
                        <select
                            value={cannonModelIdx}
                            onChange={(e) => setCannonModelIdx(parseInt(e.target.value))}
                            className="fc-select"
                        >
                            {CANNONS.map((c, i) => (
                                <option key={i} value={i}>{c.name}</option>
                            ))}
                        </select>

                        {/* Cannon stats */}
                        <div className="fc-stats-box">
                            <div className="fc-stat-row">
                                <span className="fc-stat-label">Caliber:</span>
                                <span className="fc-stat-value">{currentCannon.caliber_mm} mm</span>
                            </div>
                            <div className="fc-stat-row">
                                <span className="fc-stat-label">Muzzle Vel.:</span>
                                <span className="fc-stat-value">{currentCannon.muzzle_velocity_ms} m/s</span>
                            </div>
                            <div className="fc-stat-row">
                                <span className="fc-stat-label">Max Range:</span>
                                <span className="fc-stat-value">{currentCannon.max_range_m} m</span>
                            </div>
                        </div>

                        <div className="fc-divider" />

                        {/* Target selector */}
                        <span className="fc-sublabel">Select Target:</span>
                        {targets.length > 0 ? (
                            <select
                                value={targetId || ''}
                                onChange={(e) => setTargetId(parseInt(e.target.value))}
                                className="fc-select"
                            >
                                {targets.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        Target ({t.lat.toFixed(2)}, {t.lng.toFixed(2)})
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="fc-warning">Place a TARGET on the map first!</p>
                        )}

                        {/* Fire button */}
                        <button
                            onClick={handleFire}
                            disabled={loading || targets.length === 0}
                            className="fc-fire-btn"
                        >
                            {loading ? (
                                <>
                                    <span className="fc-spinner" />
                                    Computing...
                                </>
                            ) : (
                                '🔥 FIRE'
                            )}
                        </button>

                        {/* Results */}
                        {result && (
                            <div className="fc-result fc-result-success">
                                <span className="fc-result-badge">✅ HIT POSSIBLE</span>
                                <div className="fc-stat-row"><span className="fc-stat-label">Distance:</span><span className="fc-stat-value">{result.distance} m</span></div>
                                <div className="fc-stat-row"><span className="fc-stat-label">Azimuth:</span><span className="fc-stat-value">{result.azimuth}°</span></div>
                                <div className="fc-stat-row"><span className="fc-stat-label">Elevation:</span><span className="fc-stat-value">{result.elevation}°</span></div>
                            </div>
                        )}
                        {error && (
                            <div className="fc-result fc-result-error">
                                <span className="fc-result-badge">❌ ERROR</span>
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="fc-divider" />
                        <button onClick={() => deleteUnit(selectedUnit.id)} className="fc-delete-btn">
                            🗑 Remove Cannon
                        </button>
                    </div>
                )}

                {selectedUnit && selectedUnit.type !== 'cannon' && (
                    <div className="fc-unit-panel">
                        <div
                            className="fc-section-badge"
                            style={{ color: UNIT_TYPES[selectedUnit.type].color, borderColor: UNIT_TYPES[selectedUnit.type].color + '44' }}
                        >
                            {UNIT_TYPES[selectedUnit.type].label}
                        </div>
                        <div className="fc-stat-row">
                            <span className="fc-stat-label">Position:</span>
                            <span className="fc-stat-value">{selectedUnit.lat.toFixed(5)}, {selectedUnit.lng.toFixed(5)}</span>
                        </div>
                        <div className="fc-divider" />
                        <button onClick={() => deleteUnit(selectedUnit.id)} className="fc-delete-btn">
                            🗑 Remove from Map
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
