"use client";

import { useState, useTransition } from "react";
import { Building2, Plus, Search, MapPin, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addInstitute, updateInstitute, deleteInstitute } from "@/app/actions";
import { useAppDialog } from "@/components/ui/app-dialog";
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
  const [editingInstitute, setEditingInstitute] = useState<Institute | null>(null);
  const [isPending, startTransition] = useTransition();
  const dialog = useAppDialog();

  const filteredInstitutes = initialInstitutes.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    startTransition(async () => {
      await addInstitute({ name });
      setIsOpen(false);
    });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingInstitute) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    startTransition(async () => {
      await updateInstitute(editingInstitute.id, { name });
      setEditingInstitute(null);
    });
  };

  const handleDelete = async (institute: Institute) => {
    const confirmed = await dialog.showConfirm(
      "Delete Institute",
      `Are you sure you want to delete "${institute.name}"? Students will be reassigned.`
    );
    if (confirmed) {
      startTransition(async () => {
        await deleteInstitute(institute.id);
      });
    }
  };

  return (
    <div className="px-4 pt-4 pb-4 max-w-lg mx-auto md:max-w-5xl md:px-8 md:pt-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold font-outfit text-slate-900">Institutes</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Add Institute
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px] rounded-2xl border-slate-100 mx-4">
            <DialogHeader>
              <DialogTitle className="font-outfit text-lg">Add New Institute</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-600">Institute Name</Label>
                <Input id="name" name="name" placeholder="E.g. ABC Grammar School" required className="rounded-xl bg-slate-50 border-slate-200 h-10" />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-10" disabled={isPending}>
                {isPending ? "Saving..." : "Save Institute"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingInstitute} onOpenChange={(open) => !open && setEditingInstitute(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl border-slate-100 mx-4">
          <DialogHeader>
            <DialogTitle className="font-outfit text-lg">Edit Institute</DialogTitle>
          </DialogHeader>
          {editingInstitute && (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-xs font-semibold text-slate-600">Institute Name</Label>
                <Input id="edit-name" name="name" defaultValue={editingInstitute.name} required className="rounded-xl bg-slate-50 border-slate-200 h-10" />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-10" disabled={isPending}>
                {isPending ? "Updating..." : "Update Institute"}
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
              <div key={institute.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-start gap-4">
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
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingInstitute(institute)}
                        className="text-slate-400 p-1.5 hover:text-blue-600 transition-colors bg-slate-50 rounded-lg h-7 w-7 flex items-center justify-center"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(institute)}
                        className="text-red-400 p-1.5 hover:text-red-600 transition-colors bg-red-50 rounded-lg h-7 w-7 flex items-center justify-center"
                        disabled={isPending}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    {institute._count.students} Students · {routeCount} Routes
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="inline-block text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-semibold">
                      Active
                    </span>
                    <Link
                      href={`/students?institute=${institute.id}`}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-0.5"
                    >
                      View Students →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
