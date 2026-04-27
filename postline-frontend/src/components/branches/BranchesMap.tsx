import { useEffect, useMemo } from 'react';
import { divIcon, latLngBounds } from 'leaflet';
import { MapPin } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { type Branch } from '../../types/branches';

interface Props {
  branches: Branch[];
  selectedBranchId?: number | null;
  onBranchSelect?: (id: number) => void;
  isLoading?: boolean;
  error?: string | null;
}

const DEFAULT_CENTER: [number, number] = [49.0275, 31.4828];

const createBranchIcon = (branch: Branch, isSelected: boolean) =>
  divIcon({
    className: '',
    html: `<div style="width:${isSelected ? 42 : 34}px;height:${isSelected ? 42 : 34}px;border-radius:16px;background:${isSelected ? '#1a362d' : branch.openNow ? '#0f766e' : '#64748b'};color:white;display:flex;align-items:center;justify-content:center;font-weight:900;border:3px solid white;box-shadow:0 10px 24px rgba(15,23,42,.24);font-size:12px;">${branch.number.replace('№', '')}</div>`,
    iconSize: [isSelected ? 42 : 34, isSelected ? 42 : 34],
    iconAnchor: [isSelected ? 21 : 17, isSelected ? 21 : 17],
  });

const BranchMapController = ({
  branches,
  selectedBranch,
}: {
  branches: Branch[];
  selectedBranch?: Branch;
}) => {
  const map = useMap();

  useEffect(() => {
    if (selectedBranch) {
      map.flyTo([selectedBranch.lat, selectedBranch.lng], 15, { duration: 0.8 });
      return;
    }

    if (branches.length === 1) {
      map.setView([branches[0].lat, branches[0].lng], 13);
      return;
    }

    if (branches.length > 1) {
      const bounds = latLngBounds(branches.map((branch) => [branch.lat, branch.lng]));
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
    }
  }, [branches, map, selectedBranch]);

  return null;
};

export const BranchesMap = ({
  branches,
  selectedBranchId,
  onBranchSelect,
  isLoading,
  error,
}: Props) => {
  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.id === selectedBranchId),
    [branches, selectedBranchId]
  );

  const center: [number, number] = selectedBranch
    ? [selectedBranch.lat, selectedBranch.lng]
    : branches[0]
      ? [branches[0].lat, branches[0].lng]
      : DEFAULT_CENTER;

  if (isLoading) {
    return (
      <div className="flex-1 bg-slate-200 rounded-3xl border border-slate-200 shadow-inner min-h-[400px] animate-pulse" />
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-white rounded-3xl border border-rose-100 shadow-sm min-h-[400px] flex items-center justify-center p-10 text-center">
        <div>
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin size={28} />
          </div>
          <h3 className="text-xl font-black text-slate-900">Карту не вдалося побудувати</h3>
          <p className="text-slate-500 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 rounded-3xl border border-slate-200 shadow-inner relative overflow-hidden min-h-[400px] hover:border-slate-300 transition-all bg-slate-200">
      <MapContainer center={center} zoom={branches.length ? 12 : 6} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <BranchMapController branches={branches} selectedBranch={selectedBranch} />

        {branches.map((branch) => {
          const isSelected = branch.id === selectedBranchId;

          return (
            <Marker
              key={branch.id}
              position={[branch.lat, branch.lng]}
              icon={createBranchIcon(branch, isSelected)}
              eventHandlers={{
                click: () => onBranchSelect?.(branch.id),
              }}
            >
              <Popup>
                <strong>{branch.name}</strong>
                <br />
                {branch.city}, {branch.address}
                <br />
                {branch.schedule}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="absolute left-6 top-6 z-[500] bg-white/90 backdrop-blur rounded-3xl shadow-lg border border-white/60 p-5 max-w-sm">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Мережа PostLine</p>
        <h3 className="text-2xl font-black text-slate-900 mt-1">
          {branches.length > 0 ? `${branches.length} точок на мапі` : 'Відділень не знайдено'}
        </h3>
        <p className="text-sm text-slate-500 mt-2">
          {selectedBranch
            ? `${selectedBranch.name}: ${selectedBranch.city}, ${selectedBranch.address}`
            : 'Оберіть відділення у списку або маркер на мапі, щоб наблизити карту.'}
        </p>
      </div>
    </div>
  );
};
