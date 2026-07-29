"use client";

import { useState, useTransition } from "react";
import { Map, Plus, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addRoute, deleteRoute } from "@/app/actions";

type Route = {
  id: string;
  name: string;
  feeAmount: number;
  _count: { students: number, vehicles: number };
};

export function RoutesClient({ initialRoutes }: { initialRoutes: Route[] }) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filteredRoutes = initialRoutes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const fee = parseInt(formData.get("fee") as string, 10);

    startTransition(async () => {
      await addRoute({ name, fee });
      setIsOpen(false);
    });
  };

  return (
    <div className="px-4 pt-4 pb-4 max-w-lg mx-auto md:max-w-5xl md:px-8 md:pt-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold font-outfit text-slate-900">Routes</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Add Route
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px] rounded-2xl border-slate-100 mx-4">
            <DialogHeader>
              <DialogTitle className="font-outfit text-lg">Add New Route</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-600">Route Name</Label>
                <Input id="name" name="name" placeholder="E.g. Mingora Central" required className="rounded-xl bg-slate-50 border-slate-200 h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee" className="text-xs font-semibold text-slate-600">Monthly Fee (Rs)</Label>
                <Input id="fee" name="fee" type="number" placeholder="E.g. 2500" required className="rounded-xl bg-slate-50 border-slate-200 h-10" />
              </div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 rounded-xl h-10" disabled={isPending}>
                {isPending ? "Adding..." : "Save Route"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          type="search"
          placeholder="Search routes..."
          className="pl-9 bg-white border-slate-200 rounded-xl h-10 text-sm shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Route List */}
      {filteredRoutes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="bg-orange-50 p-4 rounded-2xl mb-4">
            <Map className="w-8 h-8 text-orange-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No routes found</p>
          <p className="text-xs text-slate-400 mt-1">Add your first route to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRoutes.map((route) => (
            <div key={route.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-start gap-4">
              <div className="bg-green-50 p-3 rounded-xl shrink-0">
                <Map className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-900">{route.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {route._count.students} Students
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {route._count.vehicles} Vehicle(s)
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this route? Students will be unassigned from this route.")) {
                        startTransition(() => deleteRoute(route.id));
                      }
                    }}
                    className="text-red-400 p-1 hover:text-red-600 transition-colors bg-red-50 rounded-lg h-7 w-7 flex items-center justify-center"
                    disabled={isPending}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
