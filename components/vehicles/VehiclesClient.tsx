"use client";

import { useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { Bus, Plus, Search, Trash2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addVehicle, updateVehicle, deleteVehicle } from "@/app/actions";
import { useAppDialog } from "@/components/ui/app-dialog";

type Vehicle = {
  id: string;
  registrationNumber: string;
  capacity: number | null;
  route: { name: string } | null;
  _count: { students: number };
};

export function VehiclesClient({ initialVehicles, availableRoutes = [] }: { initialVehicles: Vehicle[], availableRoutes?: { id: string, name: string }[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isPending, startTransition] = useTransition();
  const dialog = useAppDialog();

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setIsOpen(true);
    }
  }, [searchParams]);

  const filteredVehicles = initialVehicles.filter(v =>
    v.registrationNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const registration = formData.get("registration") as string;
    const capacity = parseInt(formData.get("capacity") as string, 10);
    const routeId = formData.get("routeId") as string;

    startTransition(async () => {
      await addVehicle({ registration, capacity, routeId: routeId || undefined });
      setIsOpen(false);
    });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingVehicle) return;
    const formData = new FormData(e.currentTarget);
    const registration = formData.get("registration") as string;
    const capacity = parseInt(formData.get("capacity") as string, 10);
    const routeId = formData.get("routeId") as string;

    startTransition(async () => {
      await updateVehicle(editingVehicle.id, { registration, capacity, routeId: routeId || undefined });
      setEditingVehicle(null);
    });
  };

  return (
    <div className="px-4 pt-4 pb-4 max-w-lg mx-auto md:max-w-5xl md:px-8 md:pt-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold font-outfit text-slate-900">Vehicles</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Add Vehicle
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px] rounded-3xl border-slate-100 p-6">
            <DialogHeader>
              <DialogTitle className="font-outfit text-lg">Add New Vehicle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="registration" className="text-xs font-semibold text-slate-600">Registration Number</Label>
                <Input id="registration" name="registration" placeholder="E.g. LES-1234" required className="rounded-xl bg-slate-50 border-slate-200 h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-xs font-semibold text-slate-600">Seating Capacity</Label>
                <Input id="capacity" name="capacity" type="number" placeholder="E.g. 40" required className="rounded-xl bg-slate-50 border-slate-200 h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="routeId" className="text-xs font-semibold text-slate-600">Assign to Route (Optional)</Label>
                <select 
                  id="routeId" 
                  name="routeId" 
                  className="w-full rounded-xl bg-slate-50 border-slate-200 h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                >
                  <option value="">-- No Route Assigned --</option>
                  {availableRoutes.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 rounded-xl h-10" disabled={isPending}>
                {isPending ? "Adding..." : "Save Vehicle"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Vehicle Dialog */}
      <Dialog open={!!editingVehicle} onOpenChange={(open) => !open && setEditingVehicle(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl border-slate-100 p-6">
          <DialogHeader>
            <DialogTitle className="font-outfit text-lg">Edit Vehicle</DialogTitle>
          </DialogHeader>
          {editingVehicle && (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="edit-registration" className="text-xs font-semibold text-slate-600">Registration Number</Label>
                <Input id="edit-registration" name="registration" defaultValue={editingVehicle.registrationNumber} required className="rounded-xl bg-slate-50 border-slate-200 h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-capacity" className="text-xs font-semibold text-slate-600">Seating Capacity</Label>
                <Input id="edit-capacity" name="capacity" type="number" defaultValue={editingVehicle.capacity || 40} required className="rounded-xl bg-slate-50 border-slate-200 h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-routeId" className="text-xs font-semibold text-slate-600">Assign to Route (Optional)</Label>
                <select 
                  id="edit-routeId" 
                  name="routeId" 
                  defaultValue={availableRoutes.find(r => r.name === editingVehicle.route?.name)?.id || ""}
                  className="w-full rounded-xl bg-slate-50 border-slate-200 h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                >
                  <option value="">-- No Route Assigned --</option>
                  {availableRoutes.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 rounded-xl h-10" disabled={isPending}>
                {isPending ? "Updating..." : "Update Vehicle"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          type="search"
          placeholder="Search vehicles..."
          className="pl-9 bg-white border-slate-200 rounded-xl h-10 text-sm shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Vehicle List */}
      {filteredVehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="bg-green-50 p-4 rounded-2xl mb-4">
            <Bus className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No vehicles found</p>
          <p className="text-xs text-slate-400 mt-1">Add your first vehicle to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-start gap-4">
              <div className="bg-slate-100 p-3 rounded-xl shrink-0">
                <Bus className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-900">
                      {vehicle.registrationNumber}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {vehicle.capacity ? `${vehicle.capacity} Seats` : "N/A"} · {vehicle._count.students} Students
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Route: <span className="font-semibold text-slate-600">{vehicle.route?.name || "None"}</span>
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setEditingVehicle(vehicle)}
                      className="text-slate-400 p-1 hover:text-blue-600 transition-colors bg-slate-50 rounded-lg h-7 w-7 flex items-center justify-center"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={async () => {
                        const confirmed = await dialog.showConfirm(
                          "Delete Vehicle",
                          `Are you sure you want to delete ${vehicle.registrationNumber}? Students assigned to it will be unassigned.`
                        );
                        if (confirmed) {
                          startTransition(() => deleteVehicle(vehicle.id));
                        }
                      }}
                      className="text-red-400 p-1 hover:text-red-600 transition-colors bg-red-50 rounded-lg h-7 w-7 flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <span className="inline-block text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-semibold mt-2">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
