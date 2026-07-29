"use client";

import { useState, useTransition } from "react";
import { Building2, Plus, Search, MapPin, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addInstitute } from "@/app/actions";
import Link from "next/link";

type Institute = {
  id: string;
  name: string;
  _count: { students: number };
  students: { routeId: string | null }[];
};

export function InstitutesClient({ initialInstitutes }: { initialInstitutes: Institute[] }) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filteredInstitutes = initialInstitutes.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    startTransition(async () => {
      await addInstitute({ name });
      setIsOpen(false);
    });
  };

  return (
    <div className="px-4 pt-4 pb-4 max-w-lg mx-auto md:max-w-5xl md:px-8 md:pt-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold font-outfit text-slate-900">Institutes</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger className="bg-blue-600 text-white p-2 rounded-xl shadow-sm">
            <Plus className="w-5 h-5" />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px] rounded-2xl border-slate-100 mx-4">
            <DialogHeader>
              <DialogTitle className="font-outfit text-lg">Add New Institute</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-600">Institute Name</Label>
                <Input id="name" name="name" placeholder="E.g. ABC Grammar School" required className="rounded-xl bg-slate-50 border-slate-200 h-10" />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-10" disabled={isPending}>
                {isPending ? "Adding..." : "Save Institute"}
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
          placeholder="Search institutes..."
          className="pl-9 bg-white border-slate-200 rounded-xl h-10 text-sm shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Institute List */}
      {filteredInstitutes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="bg-blue-50 p-4 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No institutes yet</p>
          <p className="text-xs text-slate-400 mt-1">Add your first institute to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInstitutes.map((institute) => {
            const routeCount = institute.students.filter(s => s.routeId !== null).length;
            return (
              <Link href={`/institutes/${institute.id}`} key={institute.id}>
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className="bg-red-50 p-3 rounded-xl shrink-0">
                    <Building2 className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-sm text-slate-900">{institute.name}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> Swat, Khyber Pakhtunkhwa
                        </p>
                      </div>
                      <button className="text-slate-400 p-1">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      {institute._count.students} Students · {routeCount} Routes
                    </p>
                    <span className="inline-block text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-semibold mt-2">
                      Active
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
