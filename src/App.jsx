import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Wallet, 
  Info,
  RefreshCcw,
  Search,
  Users,
  Scale,
  BarChartBig, 
  BarChart3, 
  Move,
  Plus,
  Minus,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Database,
  X,
  Save,
  MessageCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// --- DATA INITIAL (38 PROVINSI - UPDATE UMP 2026 & KHL DES 2025) ---
const INITIAL_PROVINCES = [
  // SUMATERA
  { id: 'ACEH', name: 'Aceh', umr: 3685616, expense: 3654466 },
  { id: 'SUMUT', name: 'Sumatera Utara', umr: 3228971, expense: 3599803 },
  { id: 'SUMBAR', name: 'Sumatera Barat', umr: 3182955, expense: 4076173 },
  { id: 'RIAU', name: 'Riau', umr: 3780495, expense: 4158948 },
  { id: 'JAMBI', name: 'Jambi', umr: 3471497, expense: 3931596 },
  { id: 'SUMSEL', name: 'Sumatera Selatan', umr: 3942963, expense: 3299907 },
  { id: 'BENGKULU', name: 'Bengkulu', umr: 2827250, expense: 3714932 },
  { id: 'LAMPUNG', name: 'Lampung', umr: 3047734, expense: 3343494 },
  { id: 'BABEL', name: 'Kep. Bangka Belitung', umr: 4035000, expense: 4714805 },
  { id: 'KEPRI', name: 'Kepulauan Riau', umr: 3879520, expense: 5717082 },
  // JAWA & BALI NUSA
  { id: 'DKI', name: 'DKI Jakarta', umr: 5729876, expense: 5898511 },
  { id: 'JABAR', name: 'Jawa Barat', umr: 2317601, expense: 4122871 },
  { id: 'JATENG', name: 'Jawa Tengah', umr: 2327386, expense: 3512997 },
  { id: 'DIY', name: 'DI Yogyakarta', umr: 2417495, expense: 4604982 },
  { id: 'JATIM', name: 'Jawa Timur', umr: 2446880, expense: 3575938 },
  { id: 'BANTEN', name: 'Banten', umr: 3100881, expense: 4295985 },
  { id: 'BALI', name: 'Bali', umr: 3207459, expense: 5253107 },
  { id: 'NTB', name: 'Nusa Tenggara Barat', umr: 2673861, expense: 3410833 },
  { id: 'NTT', name: 'Nusa Tenggara Timur', umr: 2455898, expense: 3054508 },
  // KALIMANTAN
  { id: 'KALBAR', name: 'Kalimantan Barat', umr: 3054552, expense: 4083420 },
  { id: 'KALTENG', name: 'Kalimantan Tengah', umr: 3686138, expense: 4279888 },
  { id: 'KALSEL', name: 'Kalimantan Selatan', umr: 3725000, expense: 4112552 },
  { id: 'KALTIM', name: 'Kalimantan Timur', umr: 3762431, expense: 5735353 },
  { id: 'KALTARA', name: 'Kalimantan Utara', umr: 3775243, expense: 4968935 },
  // SULAWESI
  { id: 'SULUT', name: 'Sulawesi Utara', umr: 4002630, expense: 3864224 },
  { id: 'SULTENG', name: 'Sulawesi Tengah', umr: 3179565, expense: 3546013 },
  { id: 'SULSEL', name: 'Sulawesi Selatan', umr: 3921088, expense: 3670085 },
  { id: 'SULTRA', name: 'Sulawesi Tenggara', umr: 3306496, expense: 3645086 },
  { id: 'GORONTALO', name: 'Gorontalo', umr: 3405144, expense: 3398395 },
  { id: 'SULBAR', name: 'Sulawesi Barat', umr: 3315934, expense: 3091442 },
  // MALUKU & PAPUA
  { id: 'MALUKU', name: 'Maluku', umr: 3334490, expense: 4168498 },
  { id: 'MALUT', name: 'Maluku Utara', umr: 3510240, expense: 4431339 },
  // PAPUA RAYA
  { id: 'PAPUA', name: 'Papua', umr: 4436283, expense: 5314281 },
  { id: 'PAPUABAR', name: 'Papua Barat', umr: 3841000, expense: 5246172 },
  { id: 'PAPUSEL', name: 'Papua Selatan', umr: 4508100, expense: 5314281 },
  { id: 'PAPUTENG', name: 'Papua Tengah', umr: 4285848, expense: 5314281 },
  { id: 'PAPUPEG', name: 'Papua Pegunungan', umr: 4508714, expense: 5314281 },
  { id: 'PAPUBARDA', name: 'Papua Barat Daya', umr: 3766000, expense: 5246172 },
];

// --- GEOJSON MAP COMPONENT ---
const IndonesiaGeoMap = ({ selectedProvId, onSelectProvince }) => {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredName, setHoveredName] = useState(null);
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
  const selectedCentroidRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const GEOJSON_URL = "https://gist.githubusercontent.com/denyherianto/aae0dd09837a4cfd7c834e28a5ed4b8c/raw/indonesia-38-provinces.geojson";

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then(res => res.json())
      .then(data => {
        setGeoData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal memuat peta:", err);
        setLoading(false);
      });
  }, []);

  // Map Scroll Lock & Zoom Logic
  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const handleWheelNative = (e) => {
      e.preventDefault(); 
      const scaleFactor = 1.1;
      const direction = e.deltaY > 0 ? (1 / scaleFactor) : scaleFactor;
      handleZoom(direction);
    };

    svgElement.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => {
      svgElement.removeEventListener('wheel', handleWheelNative);
    };
  }, [geoData]); 

  // Projection Helper
  const project = (lon, lat) => {
    const width = 800;
    const height = 350;
    const minLon = 95.0;
    const maxLon = 141.5;
    const minLat = -11.0;
    const maxLat = 6.5;

    const x = ((lon - minLon) / (maxLon - minLon)) * width;
    const y = ((maxLat - lat) / (maxLat - minLat)) * height;
    return [x, y];
  };

  const getCentroid = (geometry) => {
    let totalX = 0, totalY = 0, count = 0;
    const addPoints = (ring) => {
      ring.forEach(point => {
        const [x, y] = project(point[0], point[1]);
        totalX += x;
        totalY += y;
        count++;
      });
    };
    if (geometry.type === "Polygon") {
      geometry.coordinates.forEach(ring => addPoints(ring));
    } else if (geometry.type === "MultiPolygon") {
      geometry.coordinates.forEach(poly => poly.forEach(ring => addPoints(ring)));
    }
    return count > 0 ? { x: totalX / count, y: totalY / count } : { x: 400, y: 175 };
  };

  const getProvinceIdByFeature = (properties) => {
    const geoName = properties.Provinsi || properties.NAME_1 || properties.name || properties.PROVINSI || "";
    if (!geoName) return null;
    
    let clean = geoName.toLowerCase().trim();
    clean = clean.replace(/^propinsi\s+/, "").replace(/^provinsi\s+/, "").replace(/^daerah istimewa\s+/, "").replace(/^di\s+/, "");
    clean = clean.replace("nusatenggara", "nusa tenggara");

    if (clean.includes("papua barat daya")) return "PAPUBARDA";
    if (clean.includes("papua barat") && !clean.includes("daya")) return "PAPUABAR";
    if (clean.includes("papua selatan")) return "PAPUSEL";
    if (clean.includes("papua tengah")) return "PAPUTENG";
    if (clean.includes("papua pegunungan")) return "PAPUPEG";
    if (clean === "papua" || clean === "irian jaya") return "PAPUA";

    if (clean.includes("kepulauan riau") || clean.includes("kep. riau")) return "KEPRI";
    if (clean === "riau") return "RIAU"; 

    if (clean.includes("bangka") || clean.includes("belitung")) return "BABEL";

    if (clean.includes("maluku utara")) return "MALUT";
    if (clean === "maluku") return "MALUKU";

    if (clean.includes("barat") && clean.includes("nusa tenggara")) return "NTB";
    if (clean.includes("timur") && clean.includes("nusa tenggara")) return "NTT";

    if (clean.includes("jakarta")) return "DKI";
    if (clean.includes("yogyakarta") || clean.includes("jogja")) return "DIY";
    if (clean.includes("banten")) return "BANTEN";
    if (clean.includes("bali")) return "BALI";
    if (clean.includes("jawa barat")) return "JABAR";
    if (clean.includes("jawa tengah")) return "JATENG";
    if (clean.includes("jawa timur")) return "JATIM";

    if (clean.includes("aceh") || clean.includes("nanggroe")) return "ACEH";
    if (clean.includes("sumatera utara") || clean.includes("sumatra utara")) return "SUMUT";
    if (clean.includes("sumatera barat") || clean.includes("sumatra barat")) return "SUMBAR";
    if (clean.includes("jambi")) return "JAMBI";
    if (clean.includes("sumatera selatan") || clean.includes("sumatra selatan")) return "SUMSEL";
    if (clean.includes("bengkulu")) return "BENGKULU";
    if (clean.includes("lampung")) return "LAMPUNG";

    if (clean.includes("kalimantan barat")) return "KALBAR";
    if (clean.includes("kalimantan tengah")) return "KALTENG";
    if (clean.includes("kalimantan selatan")) return "KALSEL";
    if (clean.includes("kalimantan timur")) return "KALTIM";
    if (clean.includes("kalimantan utara")) return "KALTARA";

    if (clean.includes("gorontalo")) return "GORONTALO";
    if (clean.includes("sulawesi utara")) return "SULUT";
    if (clean.includes("sulawesi tengah")) return "SULTENG";
    if (clean.includes("sulawesi barat")) return "SULBAR";
    if (clean.includes("sulawesi selatan")) return "SULSEL";
    if (clean.includes("sulawesi tenggara")) return "SULTRA";

    return null;
  };

  const isFeatureActive = (featureProvId, selectedId) => {
    return featureProvId && selectedId && featureProvId === selectedId;
  };

  useEffect(() => {
    if (!geoData || !selectedProvId) {
      setTransform({ k: 1, x: 0, y: 0 });
      selectedCentroidRef.current = null;
      return;
    }

    const feature = geoData.features.find(f => {
      const fId = getProvinceIdByFeature(f.properties);
      return isFeatureActive(fId, selectedProvId);
    });

    if (feature) {
      const center = getCentroid(feature.geometry);
      selectedCentroidRef.current = center; 
      const scale = 4.0;
      const tx = 400 - (center.x * scale);
      const ty = 175 - (center.y * scale);
      setTransform({ k: scale, x: tx, y: ty });
    } else {
      setTransform({ k: 1, x: 0, y: 0 });
      selectedCentroidRef.current = null;
    }
  }, [selectedProvId, geoData]);

  const handleZoom = (factor) => {
    setTransform(prev => {
      const newScale = Math.max(0.5, Math.min(prev.k * factor, 12));
      let newX, newY;
      if (selectedCentroidRef.current) {
        newX = 400 - (selectedCentroidRef.current.x * newScale);
        newY = 175 - (selectedCentroidRef.current.y * newScale);
      } else {
        const centerX = 400;
        const centerY = 175;
        newX = centerX - (centerX - prev.x) * (newScale / prev.k);
        newY = centerY - (centerY - prev.y) * (newScale / prev.k);
      }
      return { k: newScale, x: newX, y: newY };
    });
  };

  const handleResetMap = () => {
    setTransform({ k: 1, x: 0, y: 0 });
    onSelectProvince(''); 
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => setIsDragging(false);

  const generatePath = (geometry) => {
    if (!geometry) return "";
    let pathStr = "";
    const processRing = (ring) => {
      let d = "";
      ring.forEach((point, i) => {
        const [x, y] = project(point[0], point[1]);
        d += (i === 0 ? "M" : "L") + `${x.toFixed(1)},${y.toFixed(1)} `;
      });
      d += "Z ";
      return d;
    };
    if (geometry.type === "Polygon") {
      geometry.coordinates.forEach(ring => { pathStr += processRing(ring); });
    } else if (geometry.type === "MultiPolygon") {
      geometry.coordinates.forEach(poly => poly.forEach(ring => { pathStr += processRing(ring); }));
    }
    return pathStr;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
        <RefreshCcw className="w-8 h-8 animate-spin mb-2 text-[#6155F5]" />
        <span className="text-xs font-medium">Memuat Peta...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group overflow-hidden rounded-3xl bg-slate-50/30 border border-slate-100">
      
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20">
        <button onClick={() => handleZoom(1.2)} className="bg-white border border-slate-200 p-1.5 rounded-t-lg hover:bg-slate-50 active:bg-slate-100 transition text-slate-600 shadow-sm" title="Zoom In"><Plus className="w-4 h-4" /></button>
        <div className="h-[1px] w-full bg-slate-200"></div>
        <button onClick={() => handleZoom(0.8)} className="bg-white border border-slate-200 p-1.5 rounded-b-lg hover:bg-slate-50 active:bg-slate-100 transition text-slate-600 shadow-sm" title="Zoom Out"><Minus className="w-4 h-4" /></button>
      </div>

      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
         <div className="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] text-slate-500 flex items-center gap-1 shadow-sm border border-slate-100 w-fit pointer-events-none opacity-50 hover:opacity-100 transition-opacity">
            <Move className="w-3 h-3" /> Geser Peta
         </div>
      </div>

      {/* RESET BUTTON (POJOK KIRI BAWAH) */}
      <div className="absolute bottom-3 left-3 z-20">
         <button 
           onClick={handleResetMap}
           className="bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md hover:bg-emerald-600 active:scale-95 transition flex items-center gap-1.5"
         >
           <RotateCcw className="w-3 h-3" /> Reset Peta
         </button>
      </div>

      {hoveredName && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-slate-800/90 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
            <MapPin className="w-3 h-3 text-[#6155F5]"/>
            {hoveredName}
          </div>
        </div>
      )}

      <svg 
        ref={svgRef}
        viewBox="0 0 800 350" 
        className={`w-full h-full drop-shadow-sm ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g style={{ transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)', transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})` }}>
          {geoData && geoData.features.map((feature, idx) => {
            const provId = getProvinceIdByFeature(feature.properties);
            const isSelected = isFeatureActive(provId, selectedProvId);
            
            let displayName = feature.properties.Propinsi || "Unknown";
            displayName = displayName.replace("NusaTenggara", "Nusa Tenggara");

            const dbProv = INITIAL_PROVINCES.find(p => p.id === provId);
            if (dbProv) displayName = dbProv.name;

            const isHovered = hoveredName === displayName;

            let fill = "#cbd5e1"; 
            if (isSelected) fill = "#10b981"; 
            else if (isHovered) fill = "#94a3b8"; 
            if (!provId) fill = "#e2e8f0"; 

            return (
              <path
                key={idx}
                d={generatePath(feature.geometry)}
                fill={fill}
                stroke="white"
                strokeWidth={isSelected ? 0.2 / transform.k : 0.5 / transform.k} 
                onMouseEnter={() => setHoveredName(displayName)}
                onMouseLeave={() => setHoveredName(null)}
                onClick={(e) => {
                  if (isDragging) return; 
                  e.stopPropagation(); 
                  if (provId) onSelectProvince(provId);
                  else alert(`Peta untuk ${displayName} belum terhubung.`);
                }}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function SalaryMapApp() {
  const [provincesData, setProvincesData] = useState(INITIAL_PROVINCES);
  const [salary, setSalary] = useState('');
  const [dependents, setDependents] = useState('1'); 
  const [selectedProvId, setSelectedProvId] = useState('');
  const [result, setResult] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const handleSalaryChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (rawVal === '') {
      setSalary('');
      return;
    }
    const formatted = new Intl.NumberFormat('id-ID').format(parseInt(rawVal));
    setSalary(formatted);
  };

  const handleDependentsChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setDependents('');
    } else if (/^\d+$/.test(val)) {
      setDependents(val);
    }
  };

  // --- AUTO CALCULATION ---
  useEffect(() => {
    if (!salary || !selectedProvId || dependents === '') {
      if (result) setResult(null); 
      return;
    }

    const cleanSalary = salary.replace(/\./g, '');
    const numSalary = parseFloat(cleanSalary);
    
    if (isNaN(numSalary)) return;

    const province = provincesData.find(p => p.id === selectedProvId);
    const numDependents = Math.max(1, parseInt(dependents) || 1); 
    
    const totalFamilyExpense = province.expense * numDependents;
    const netSavings = numSalary - totalFamilyExpense;
    
    const umrRatio = numSalary / province.umr;
    let umrPercentage = (umrRatio * 100).toFixed(0);
    if (umrRatio >= 1) umrPercentage = 100;

    const needsRatio = numSalary / totalFamilyExpense;
    let needsPercentage = 0;
    if (needsRatio >= 1) needsPercentage = 100;
    else needsPercentage = (needsRatio * 100).toFixed(0);

    const surplusRatio = netSavings / totalFamilyExpense;

    let statusInfo = {};
    let analysisDesc = "";

    if (netSavings < 0) {
      statusInfo = {
        label: 'Defisit',
        color: 'text-rose-600',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
        needsBarColor: 'bg-rose-500', 
        icon: <AlertCircle className="w-8 h-8 text-rose-600" />,
      };
      analysisDesc = `Dengan gaji yang kamu masukkan, kamu masih kekurangan dana sebesar ${formatRupiah(Math.abs(netSavings))} per bulan untuk memenuhi kebutuhan dasar ${numDependents} orang tanggungan di daerah ini.`;
    } else if (surplusRatio >= 0 && surplusRatio <= 0.1) {
      statusInfo = {
        label: 'Pas-pasan',
        color: 'text-amber-600', 
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        needsBarColor: 'bg-amber-500', 
        icon: <AlertTriangle className="w-8 h-8 text-amber-600" />,
      };
      analysisDesc = `Gaji kamu cukup untuk kebutuhan dasar, namun kondisi keuanganmu sangat ketat (pas-pasan). Sisa dana hanya ${formatRupiah(netSavings)} per bulan, yang membuatmu rentan terhadap pengeluaran mendadak.`;
    } else if (surplusRatio > 0.1 && surplusRatio <= 0.3) {
      statusInfo = {
        label: 'Cukup',
        color: 'text-gray-700', 
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        needsBarColor: 'bg-emerald-500', 
        icon: <CheckCircle2 className="w-8 h-8 text-gray-700" />,
      };
      analysisDesc = `Kondisi keuanganmu tergolong sehat. Kamu bisa memenuhi kebutuhan dasar dengan baik dan memiliki sisa dana sekitar ${formatRupiah(netSavings)} per bulan untuk tabungan atau dana darurat.`;
    } else {
      statusInfo = {
        label: 'Surplus',
        color: 'text-emerald-600', 
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        needsBarColor: 'bg-emerald-500', 
        icon: <TrendingUp className="w-8 h-8 text-emerald-600" />,
      };
      analysisDesc = `Luar biasa! Kamu memiliki keleluasaan finansial yang sangat baik. Dengan sisa dana ${formatRupiah(netSavings)} per bulan (>30% kebutuhan), kamu bisa berinvestasi atau menabung secara agresif di daerah ini.`;
    }

    const umrBarColor = umrRatio < 1 ? 'bg-rose-500' : 'bg-emerald-500';

    setResult({
      province,
      userSalary: numSalary,
      numDependents,
      totalFamilyExpense,
      netSavings,
      umrPercentage,
      needsPercentage,
      umrRatio: umrRatio.toFixed(2),
      needsRatio: (needsRatio * 100).toFixed(0), 
      umrBarColor,
      analysisDesc,
      ...statusInfo
    });

  }, [salary, dependents, selectedProvId, provincesData]); 

  const faqs = [
    {
      question: "Apakah angka UMR disini akurat?",
      answer: "Angka Upah Minimum di kalkulator ini menggunakan data resmi tahun 2026 - kecuali untuk provinsi Aceh, karena sementara ini angka yang digunakan adalah standar tahun 2025 dikarenakan pemerintah setempat menetapkan status darurat bencana banjir di akhir tahun 2025, yang mengakibatkan penundaan penetapan kenaikan upah minimum untuk tahun 2026."
    },
    {
      question: "Apa itu angka KHL? Dan apakah akurat untuk perhitungan kebutuhan hidup?",
      answer: "Angka KHL (Kebutuhan Hidup Layak) adalah metode perhitungan bersifat normatif yang menghitung biaya dari 64 komponen kebutuhan riil (makanan, tempat tinggal, kesehatan, pendidikan, hingga rekreasi) agar seseorang dapat hidup dengan layak dan bermartabat sesuai standar internasional (ILO). Angka yang tertera di kalkulator ini adalah data resmi dari Kemenaker RI per Desember 2025. Namun, perlu diingat bahwa kebutuhan hidup tiap individu atau keluarga bisa berbeda-beda tergantung gaya hidup, lokasi, dan kondisi ekonomi masing-masing."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800" style={{ fontFamily: '"Tiktok Sans", "Helvetica", "Inter", sans-serif' }}>
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#6155F5] p-2 rounded-lg"><BarChartBig className="w-5 h-5 text-white" /></div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Kalkulator <span className="text-slate-900">Gaji UMR</span></span>
          </div>
        </div>
      </nav>

      {/* HERO & CONTENT */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* HEADER & INPUT SECTION (CENTERED) */}
        <div className="max-w-2xl mx-auto mb-10">
          {/* TITLE & DESCRIPTION */}
          <div className="text-center mb-8 animate-fade-in-up">
            <h1 className="text-3xl lg:text-5xl font-semibold text-slate-900 mb-4 leading-tight">
              Seberapa Bernilai <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6155F5] to-[#8b82ff]">Gaji Kamu?</span>
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-lg mx-auto">
              Hitung beban pengeluaran kamu berdasarkan upah minimum, estimasi pengeluaran per kapita per bulan, dan jumlah tanggungan keluarga di setiap provinsi.
            </p>
          </div>

          {/* INPUT CARD */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 md:p-8 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6155F5] via-[#8b82ff] to-[#a39aff]"></div>
             <div className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Wallet className="w-4 h-4 text-[#6155F5]" />Penghasilan Bulanan</label>
                <div className="relative group">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-bold group-focus-within:text-[#6155F5] transition-colors">Rp</span>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-lg font-semibold rounded-xl focus:ring-2 focus:ring-[#6155F5] focus:border-[#6155F5] block w-full pl-12 p-3 transition-all outline-none" 
                    placeholder="Contoh: 5.000.000" 
                    value={salary} 
                    onChange={handleSalaryChange} 
                    required 
                  />
                </div>
                <p className="text-[11px] text-slate-400 italic ml-1">*Nominal gaji bersih dikurangi pajak</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Users className="w-4 h-4 text-[#6155F5]" />Jumlah Tanggungan (Termasuk kamu)</label>
                <div className="relative group">
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-lg font-semibold rounded-xl focus:ring-2 focus:ring-[#6155F5] focus:border-[#6155F5] block w-full pl-4 p-3 transition-all outline-none" placeholder="Minimal 1 orang" value={dependents} onChange={handleDependentsChange} required />
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400 text-sm font-medium">Orang</div>
                </div>
                <p className="text-xs text-slate-400 italic">*Masukkan 1 jika kamu lajang (menanggung diri sendiri)</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><MapPin className="w-4 h-4 text-[#6155F5]" />Pilih Provinsi</label>
                <div className="relative group">
                  <select className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-[#6155F5] focus:border-[#6155F5] block w-full p-3 pr-10 appearance-none cursor-pointer outline-none transition-all" value={selectedProvId} onChange={(e) => setSelectedProvId(e.target.value)} required>
                    <option value="" disabled>-- Pilih Lokasi --</option>
                    {provincesData.map(prov => (<option key={prov.id} value={prov.id}>{prov.name}</option>))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500 group-focus-within:text-[#6155F5] transition-colors"><Search className="w-4 h-4" /></div>
                </div>
                <p className="text-xs text-[#6155F5] italic pt-1 flex items-center gap-1"><Info className="w-3 h-3"/> Klik peta untuk pilih provinsi secara otomatis.</p>
              </div>
             </div>
          </div>
        </div>

        {/* BOTTOM SECTION: MAP + ANALYSIS (HORIZONTAL on Desktop, STACK on Mobile) */}
        <div className="grid lg:grid-cols-2 gap-6 items-stretch w-full">
          
          {/* LEFT: MAP CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-2 h-[400px] lg:h-auto min-h-[400px] relative overflow-hidden group flex flex-col">
             <div className="w-full h-full flex items-center justify-center bg-slate-50/30 relative rounded-2xl overflow-hidden">
               <IndonesiaGeoMap selectedProvId={selectedProvId} onSelectProvince={setSelectedProvId} />
             </div>
             {!selectedProvId && (
               <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
                 <p className="text-xs md:text-sm font-medium text-slate-500 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-slate-100 animate-bounce-slow">👆 Klik provinsi di peta untuk analisa cepat</p>
               </div>
             )}
          </div>

          {/* RIGHT: RESULT CARD */}
          <div className="h-full w-full">
            {result ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500 ring-1 ring-slate-100 h-full flex flex-col" id="result-section">
                <div className="p-6 md:p-8 space-y-4 flex-grow">
                  
                  {/* SECTION 1: UMR ANALYSIS */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-[#6155F5]"/> Analisis Penghasilan Bulanan Kamu</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold"><span className="text-slate-500">Perbandingan gaji kamu vs UMR</span><span className="text-slate-700">{result.umrRatio}x UMR</span></div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200 relative">
                        <div className={`h-full ${result.umrBarColor} transition-all duration-1000 ease-out`} style={{ width: `${Math.min(result.umrPercentage, 100)}%` }}></div>
                      </div>
                      <p className="text-sm text-slate-500 text-right pt-1">
                         Standar UMR {result.province.name}: <strong>{formatRupiah(result.province.umr)}</strong>
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 italic">Gaji kamu saat ini <strong>{result.umrRatio} kali lipat</strong> dari standar UMR yang berlaku di {result.province.name}.</p>
                  </div>

                  <div className="h-px bg-slate-100 w-full"></div>

                  {/* SECTION 2: FINANCIAL STATUS (LEFT ALIGNED) */}
                  <div className="bg-slate-50 rounded-xl p-5 text-left border border-slate-100">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Status Keuangan Kamu</p>
                      <div className="flex items-center justify-start gap-3 mb-2">
                         {result.icon}
                         <h2 className={`text-3xl font-bold ${result.color}`}>{result.label}</h2>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {result.analysisDesc}
                      </p>
                  </div>

                  <div className="h-px bg-slate-100 w-full"></div>

                  {/* SECTION 3: RINCIAN & NEEDS */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Scale className="w-4 h-4 text-[#6155F5]"/> Analisis Pengeluaran Bulanan Kamu</h4>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold"><span className="text-slate-500">Estimasi Hidup Cukup</span><span className={result.color}>{result.needsPercentage}% Terpenuhi</span></div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200 relative">
                        <div className={`h-full ${result.needsBarColor} transition-all duration-1000 ease-out`} style={{ width: `${Math.min(result.needsPercentage, 100)}%` }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                       <div className="text-center sm:text-left">
                          <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1">Pemasukan</p>
                          <p className="text-sm font-bold text-blue-600">{formatRupiah(result.userSalary)}</p>
                       </div>
                       <div className="text-center sm:text-left border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
                          <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1">Total Kebutuhan ({result.numDependents} Orang)</p>
                          <p className="text-sm font-bold text-slate-700">{formatRupiah(result.totalFamilyExpense)}</p>
                          <p className="text-sm text-slate-500 mt-0.5">
                            (Rerata/kapita: {formatRupiah(result.province.expense)})
                          </p>
                       </div>
                       <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
                          <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1">Net Cashflow / Bulan</p>
                          <p className={`text-lg font-bold ${result.color}`}>{result.netSavings > 0 ? '+' : ''}{formatRupiah(result.netSavings)}</p>
                       </div>
                    </div>
                    
                    <div className="text-xs text-slate-400 italic text-center mt-4">
                         Data pengeluaran/kapita yang ada di website ini diambil berdasarkan <a href="https://www.instagram.com/p/DSfOLNHE8Kr/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==" target="_blank" rel="noopener noreferrer" className="text-[#6155F5] hover:underline">Metode Perhitungan KHL resmi dari Kementerian Ketenagakerjaan</a> di bulan Desember 2025.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-8 h-full min-h-[400px]">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4"><TrendingUp className="w-8 h-8 text-slate-300" /></div>
                <h3 className="text-slate-500 font-medium">Menunggu Data</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-xs">Analisa penghasilan dan pengeluaran bulanan kamu akan muncul disini.</p>
              </div>
            )}
          </div>
        </div>

        {/* FAQ SECTION */}
        <div className="max-w-4xl mx-auto mt-16 space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Question</h2>
            </div>
          </div>

          <div className="grid gap-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-[#6155F5]/30 transition-all cursor-pointer"
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
              >
                <div className="p-5 flex items-center justify-between select-none">
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-3">
                    {faq.question}
                  </h3>
                  {openFaqIndex === index ? <ChevronUp className="text-slate-400 w-5 h-5" /> : <ChevronDown className="text-slate-400 w-5 h-5" />}
                </div>
                {openFaqIndex === index && (
                  <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="h-px bg-slate-100 mb-4 w-full"></div>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="w-full bg-[#6155F5] py-3 text-center text-white text-sm font-medium">
           Dibuat oleh @fraviato dengan bantuan Gemini AI Pro
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col items-center justify-center gap-4">
           <p className="text-slate-600 font-medium">Saran & Feedback?</p>
           <a 
             href="https://x.com/fraviato" 
             target="_blank" 
             rel="noopener noreferrer"
             className="bg-black text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-slate-900 transition flex items-center gap-2"
           >
             <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
             DM @fraviato
           </a>
        </div>
      </footer>
    </div>
  );
}