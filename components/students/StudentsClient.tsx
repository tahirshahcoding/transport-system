"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Users, Ban, CheckCircle, FileText } from "lucide-react";
import { addStudent, toggleStudentStatus, generateIndividualChallan } from "@/app/actions";

type Student = {
  id: string;
  name: string;
  class: string;
  institute: { name: string };
  route: { name: string } | null;
  status: string;
};

export function StudentsClient({ initialStudents, availableRoutes = [], availableInstitutes = [] }: { initialStudents: Student[], availableRoutes?: { id: string, name: string }[], availableInstitutes?: { id: string, name: string }[] }) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filteredStudents = initialStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const studentClass = formData.get("class") as string;
    const routeId = formData.get("routeId") as string;
    const instituteId = formData.get("instituteId") as string;

    startTransition(async () => {
      await addStudent({ name, class: studentClass, routeId: routeId || undefined, instituteId: instituteId || undefined });
      setIsOpen(false);
    });
  };

  return (
    <div className="px-4 pt-4 pb-4 max-w-lg mx-auto md:max-w-5xl md:px-8 md:pt-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold font-outfit text-slate-900">Students</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Add Student
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px] rounded-2xl border-slate-100 mx-4">
            <DialogHeader>
              <DialogTitle className="font-outfit text-lg">Add New Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-600">Full Name</Label>
                <Input id="name" name="name" placeholder="E.g. Ali Khan" required className="rounded-xl bg-slate-50 border-slate-200 h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class" className="text-xs font-semibold text-slate-600">Class / Grade</Label>
                <Input id="class" name="class" placeholder="E.g. 10th" required className="rounded-xl bg-slate-50 border-slate-200 h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instituteId" className="text-xs font-semibold text-slate-600">Assign Institute</Label>
                <select 
                  id="instituteId" 
                  name="instituteId" 
                  className="w-full rounded-xl bg-slate-50 border-slate-200 h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                >
                  <option value="">-- Default Institute --</option>
                  {availableInstitutes.map(i => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="routeId" className="text-xs font-semibold text-slate-600">Assign Route (Optional)</Label>
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
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-10" disabled={isPending}>
                {isPending ? "Adding..." : "Save Student"}
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
          placeholder="Search students..."
          className="pl-9 bg-white border-slate-200 rounded-xl h-10 text-sm shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Student List */}
      {filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="bg-blue-50 p-4 rounded-2xl mb-4">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No students found</p>
          <p className="text-xs text-slate-400 mt-1">Add your first student to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-start gap-4">
              <div className="bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-blue-600">{student.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-900">{student.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Class {student.class} · {student.institute.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Route: {student.route?.name || "Unassigned"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {student.route && student.status === "ACTIVE" && (
                      <button 
                        onClick={() => startTransition(() => generateIndividualChallan(student.id))}
                        className="text-[10px] flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
                      >
                        <FileText className="w-3 h-3" /> Bill
                      </button>
                    )}
                    <button 
                      onClick={() => startTransition(() => toggleStudentStatus(student.id, student.status))}
                      className={`text-[10px] flex items-center gap-1 px-2 py-1 rounded-lg font-semibold transition-colors ${
                        student.status === "ACTIVE" 
                          ? "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600" 
                          : "bg-green-50 text-green-600 hover:bg-green-100"
                      }`}
                    >
                      {student.status === "ACTIVE" ? <><Ban className="w-3 h-3" /> Deactivate</> : <><CheckCircle className="w-3 h-3" /> Activate</>}
                    </button>
                  </div>
                </div>
                <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold mt-2 ${
                  student.status === "ACTIVE" ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"
                }`}>
                  {student.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
