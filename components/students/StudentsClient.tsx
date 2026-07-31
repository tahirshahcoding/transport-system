"use client";

import { useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2, Users, FileText, Ban, CheckCircle, Phone, Send, Loader2, Calendar } from "lucide-react";
import { addStudent, updateStudent, deleteStudent, toggleStudentStatus, generateIndividualChallan } from "@/app/actions";
import { useAppDialog } from "@/components/ui/app-dialog";

const MONTHS_LIST = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

type Student = {
  id: string;
  name: string;
  fatherName: string;
  mobileNumber: string;
  class: string;
  institute: { id: string; name: string };
  route: { id: string; name: string } | null;
  vehicle: { id: string; registrationNumber: string } | null;
  status: string;
};

export function StudentsClient({ 
  initialStudents, 
  availableRoutes = [], 
  availableInstitutes = [],
  availableVehicles = [] 
}: { 
  initialStudents: Student[], 
  availableRoutes?: { id: string, name: string, feeAmount: number }[], 
  availableInstitutes?: { id: string, name: string }[],
  availableVehicles?: { id: string, registrationNumber: string, routeId: string | null }[]
}) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  
  // Filters
  const [filterInstitute, setFilterInstitute] = useState("");
  const [filterRoute, setFilterRoute] = useState("");
  const [filterVehicle, setFilterVehicle] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [editSelectedRouteId, setEditSelectedRouteId] = useState("");
  const [monthlyFee, setMonthlyFee] = useState<string>("");
  const [editMonthlyFee, setEditMonthlyFee] = useState<string>("");
  const [pendingStudentId, setPendingStudentId] = useState<string | null>(null);

  const handleRouteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const routeId = e.target.value;
    setSelectedRouteId(routeId);
    const route = availableRoutes.find(r => r.id === routeId);
    if (route) {
      setMonthlyFee(route.feeAmount.toString());
    } else {
      setMonthlyFee("");
    }
  };

  const handleEditRouteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const routeId = e.target.value;
    setEditSelectedRouteId(routeId);
    const route = availableRoutes.find(r => r.id === routeId);
    if (route) {
      setEditMonthlyFee(route.feeAmount.toString());
    } else {
      setEditMonthlyFee("");
    }
  };
  
  // Bill Modal State
  const now = new Date();
  const [billModalStudent, setBillModalStudent] = useState<Student | null>(null);
  const [billMonth, setBillMonth] = useState<string>(now.toLocaleString('default', { month: 'long' }));
  const [billYear, setBillYear] = useState<string>(now.getFullYear().toString());
  
  const [isPending, startTransition] = useTransition();
  const dialog = useAppDialog();

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setIsOpen(true);
    }
    const instParam = searchParams.get("institute");
    if (instParam) {
      setFilterInstitute(instParam);
    }
  }, [searchParams]);

  const filteredStudents = initialStudents.filter(s => {
    const q = search.trim().toLowerCase();
    const matchesSearch = q
      ? s.name.toLowerCase().includes(q) ||
        (s.fatherName && s.fatherName.toLowerCase().includes(q)) ||
        (s.mobileNumber && s.mobileNumber.toLowerCase().includes(q)) ||
        s.class.toLowerCase().includes(q)
      : true;
    const matchesInstitute = filterInstitute ? s.institute.id === filterInstitute : true;
    const matchesRoute = filterRoute ? s.route?.id === filterRoute : true;
    const matchesVehicle = filterVehicle ? s.vehicle?.id === filterVehicle : true;
    const matchesStatus = filterStatus ? s.status === filterStatus : true;
    return matchesSearch && matchesInstitute && matchesRoute && matchesVehicle && matchesStatus;
  });

  const getVehiclesForRoute = (routeId: string) => {
    if (!routeId) return availableVehicles;
    const matching = availableVehicles.filter(v => v.routeId === routeId);
    const others = availableVehicles.filter(v => v.routeId !== routeId);
    return [...matching, ...others];
  };

  const vehiclesForSelectedRoute = getVehiclesForRoute(selectedRouteId);
  const vehiclesForEditRoute = getVehiclesForRoute(editSelectedRouteId);

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const fatherName = formData.get("fatherName") as string;
    const mobileNumber = formData.get("mobileNumber") as string;
    const studentClass = formData.get("class") as string;
    const routeId = formData.get("routeId") as string;
    const instituteId = formData.get("instituteId") as string;
    const vehicleId = formData.get("vehicleId") as string;
    const mFeeVal = formData.get("monthlyFee") as string;
    const parsedFee = mFeeVal ? parseFloat(mFeeVal) : null;

    startTransition(async () => {
      await addStudent({ 
        name, fatherName, mobileNumber, class: studentClass, 
        routeId: routeId || undefined, instituteId: instituteId || undefined, vehicleId: vehicleId || undefined,
        monthlyFee: parsedFee 
      });
      setIsOpen(false);
      setSelectedRouteId("");
      setMonthlyFee("");
    });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingStudent) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const fatherName = formData.get("fatherName") as string;
    const mobileNumber = formData.get("mobileNumber") as string;
    const studentClass = formData.get("class") as string;
    const routeId = formData.get("routeId") as string;
    const instituteId = formData.get("instituteId") as string;
    const vehicleId = formData.get("vehicleId") as string;
    const mFeeVal = formData.get("monthlyFee") as string;
    const parsedFee = mFeeVal ? parseFloat(mFeeVal) : null;

    startTransition(async () => {
      await updateStudent(editingStudent.id, {
        name,
        fatherName,
        mobileNumber,
        class: studentClass,
        routeId: routeId || undefined,
        instituteId: instituteId || undefined,
        vehicleId: vehicleId || undefined,
        monthlyFee: parsedFee,
      });
      setEditingStudent(null);
      setEditSelectedRouteId("");
      setEditMonthlyFee("");
    });
  };

  const handleDelete = async (student: Student) => {
    const confirmed = await dialog.showConfirm(
      "Delete Student",
      `Are you sure you want to delete "${student.name}"? All associated challans and payments will also be deleted.`
    );
    if (confirmed) {
      setPendingStudentId(student.id);
      startTransition(async () => {
        try {
          await deleteStudent(student.id);
        } finally {
          setPendingStudentId(null);
        }
      });
    }
  };

  const startEditing = (student: Student) => {
    setEditingStudent(student);
    setEditSelectedRouteId(student.route?.id || "");
    setEditMonthlyFee((student as any).monthlyFee !== null && (student as any).monthlyFee !== undefined ? String((student as any).monthlyFee) : "");
  };

  return (
    <div className="px-4 pt-4 pb-4 max-w-lg mx-auto md:max-w-5xl md:px-8 md:pt-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold font-outfit text-slate-900">Students</h2>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setSelectedRouteId(""); }}>
          <DialogTrigger className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Add Student
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px] rounded-3xl border-slate-100 p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-outfit text-lg">Add New Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-600">Full Name</Label>
                <Input id="name" name="name" placeholder="E.g. Ali Khan" required className="rounded-xl bg-slate-50 border-slate-200 h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherName" className="text-xs font-semibold text-slate-600">Father&apos;s Name</Label>
                <Input id="fatherName" name="fatherName" placeholder="E.g. Mehboob Khan" required className="rounded-xl bg-slate-50 border-slate-200 h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobileNumber" className="text-xs font-semibold text-slate-600">Mobile Number (WhatsApp)</Label>
                <Input id="mobileNumber" name="mobileNumber" type="tel" placeholder="E.g. 923001234567" required className="rounded-xl bg-slate-50 border-slate-200 h-10" />
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
                  value={selectedRouteId}
                  onChange={handleRouteChange}
                  className="w-full rounded-xl bg-slate-50 border-slate-200 h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                >
                  <option value="">-- No Route Assigned --</option>
                  {availableRoutes.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyFee" className="text-xs font-semibold text-slate-600">Monthly Fee Override</Label>
                <Input 
                  id="monthlyFee" 
                  name="monthlyFee" 
                  type="number" 
                  placeholder="Auto-filled from route" 
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(e.target.value)}
                  className="rounded-xl bg-slate-50 border-slate-200 h-10" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleId" className="text-xs font-semibold text-slate-600">Assign Vehicle (Optional)</Label>
                <select 
                  id="vehicleId" 
                  name="vehicleId" 
                  className="w-full rounded-xl bg-slate-50 border-slate-200 h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                >
                  <option value="">-- No Vehicle Assigned --</option>
                  {vehiclesForSelectedRoute.map(v => (
                    <option key={v.id} value={v.id}>{v.registrationNumber}</option>
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

      {/* Edit Student Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={(open) => { if (!open) { setEditingStudent(null); setEditSelectedRouteId(""); } }}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl border-slate-100 p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-outfit text-lg">Edit Student</DialogTitle>
          </DialogHeader>
          {editingStudent && (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="edit-student-name" className="text-xs font-semibold text-slate-600">Full Name</Label>
                <Input id="edit-student-name" name="name" defaultValue={editingStudent.name} required className="rounded-xl bg-slate-50 border-slate-200 h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-student-fatherName" className="text-xs font-semibold text-slate-600">Father&apos;s Name</Label>
                <Input id="edit-student-fatherName" name="fatherName" defaultValue={editingStudent.fatherName} required className="rounded-xl bg-slate-50 border-slate-200 h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-student-mobileNumber" className="text-xs font-semibold text-slate-600">Mobile Number (WhatsApp)</Label>
                <Input id="edit-student-mobileNumber" name="mobileNumber" type="tel" defaultValue={editingStudent.mobileNumber} required className="rounded-xl bg-slate-50 border-slate-200 h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-student-class" className="text-xs font-semibold text-slate-600">Class / Grade</Label>
                <Input id="edit-student-class" name="class" defaultValue={editingStudent.class} required className="rounded-xl bg-slate-50 border-slate-200 h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-student-instituteId" className="text-xs font-semibold text-slate-600">Assign Institute</Label>
                <select 
                  id="edit-student-instituteId" 
                  name="instituteId" 
                  defaultValue={editingStudent.institute.id || ""}
                  className="w-full rounded-xl bg-slate-50 border-slate-200 h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                >
                  <option value="">-- Default Institute --</option>
                  {availableInstitutes.map(i => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-student-routeId" className="text-xs font-semibold text-slate-600">Assign Route (Optional)</Label>
                <select 
                  id="edit-student-routeId" 
                  name="routeId" 
                  value={editSelectedRouteId}
                  onChange={handleEditRouteChange}
                  className="w-full rounded-xl bg-slate-50 border-slate-200 h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                >
                  <option value="">-- No Route Assigned --</option>
                  {availableRoutes.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-student-monthlyFee" className="text-xs font-semibold text-slate-600">Monthly Fee Override</Label>
                <Input 
                  id="edit-student-monthlyFee" 
                  name="monthlyFee" 
                  type="number" 
                  placeholder="Auto-filled from route" 
                  value={editMonthlyFee}
                  onChange={(e) => setEditMonthlyFee(e.target.value)}
                  className="rounded-xl bg-slate-50 border-slate-200 h-10" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-student-vehicleId" className="text-xs font-semibold text-slate-600">Assign Vehicle (Optional)</Label>
                <select 
                  id="edit-student-vehicleId" 
                  name="vehicleId" 
                  defaultValue={editingStudent.vehicle?.id || ""}
                  className="w-full rounded-xl bg-slate-50 border-slate-200 h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                >
                  <option value="">-- No Vehicle Assigned --</option>
                  {vehiclesForEditRoute.map(v => (
                    <option key={v.id} value={v.id}>{v.registrationNumber}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-10" disabled={isPending}>
                {isPending ? "Updating..." : "Update Student"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search students by name..."
              className="pl-9 bg-slate-50 border-transparent rounded-xl h-10 text-sm shadow-none focus-visible:ring-slate-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {(search || filterInstitute || filterRoute || filterVehicle || filterStatus) && (
            <button
              onClick={() => {
                setSearch("");
                setFilterInstitute("");
                setFilterRoute("");
                setFilterVehicle("");
                setFilterStatus("");
              }}
              className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 h-10 rounded-xl transition-colors shrink-0"
            >
              Reset
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          <select 
            className="w-full rounded-xl bg-slate-50 border-transparent h-9 px-2 text-[11px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
          <select 
            className="w-full rounded-xl bg-slate-50 border-transparent h-9 px-2 text-[11px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200"
            value={filterInstitute}
            onChange={(e) => setFilterInstitute(e.target.value)}
          >
            <option value="">All Institutes</option>
            {availableInstitutes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          <select 
            className="w-full rounded-xl bg-slate-50 border-transparent h-9 px-2 text-[11px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200"
            value={filterRoute}
            onChange={(e) => setFilterRoute(e.target.value)}
          >
            <option value="">All Routes</option>
            {availableRoutes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <select 
            className="w-full rounded-xl bg-slate-50 border-transparent h-9 px-2 text-[11px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200"
            value={filterVehicle}
            onChange={(e) => setFilterVehicle(e.target.value)}
          >
            <option value="">All Vehicles</option>
            {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
          </select>
        </div>
      </div>

      {/* Student List */}
      {filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="bg-blue-50 p-4 rounded-2xl mb-4">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No students found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-start gap-4">
              <div className="bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1">
                <span className="text-sm font-bold text-blue-600">{student.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-900">{student.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      S/O {student.fatherName || "—"} · Class {student.class} · {student.institute.name}
                    </p>
                    {student.mobileNumber && (
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {student.mobileNumber}
                        </p>
                        <a
                          href={`https://wa.me/${student.mobileNumber}?text=${encodeURIComponent(`Assalam o Alaikum ${student.fatherName || student.name},\n\nGreeting from Transport Department regarding student ${student.name}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Chat on WhatsApp"
                          className="inline-flex items-center gap-1 text-[9px] font-bold bg-green-50 text-green-600 hover:bg-green-100 px-1.5 py-0.5 rounded transition-colors"
                        >
                          <Send className="w-2.5 h-2.5" /> WhatsApp
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                        Route: {student.route?.name || "None"}
                      </span>
                      {student.vehicle && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          Bus: {student.vehicle.registrationNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {student.route && student.status === "ACTIVE" && (
                        <button 
                          onClick={() => setBillModalStudent(student)}
                          className="text-[10px] flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
                        >
                          <FileText className="w-3 h-3" /> Bill
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setPendingStudentId(student.id);
                          startTransition(async () => {
                            try {
                              await toggleStudentStatus(student.id, student.status);
                            } finally {
                              setPendingStudentId(null);
                            }
                          });
                        }}
                        disabled={pendingStudentId === student.id}
                        className={`text-[10px] flex items-center gap-1 px-2 py-1 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                          student.status === "ACTIVE" 
                            ? "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600" 
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                      >
                        {pendingStudentId === student.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : student.status === "ACTIVE" ? (
                          <><Ban className="w-3 h-3" /> Deactivate</>
                        ) : (
                          <><CheckCircle className="w-3 h-3" /> Activate</>
                        )}
                      </button>
                      <button
                        onClick={() => startEditing(student)}
                        className="text-slate-400 p-1 hover:text-blue-600 transition-colors bg-slate-50 rounded-lg h-6 w-6 flex items-center justify-center"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(student);
                        }}
                        className="text-red-400 p-1 hover:text-red-600 transition-colors bg-red-50 rounded-lg h-6 w-6 flex items-center justify-center disabled:opacity-50"
                        disabled={pendingStudentId === student.id}
                      >
                        {pendingStudentId === student.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      </button>
                    </div>
                    <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      student.status === "ACTIVE" ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"
                    }`}>
                      {student.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bill Student Month Selection Modal */}
      <Dialog open={!!billModalStudent} onOpenChange={(open) => !open && setBillModalStudent(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl border-slate-100 p-6">
          <DialogHeader className="mb-2">
            <DialogTitle className="font-outfit text-lg flex items-center gap-2 text-slate-900">
              <Calendar className="w-5 h-5 text-blue-600" />
              Select Month for Challan
            </DialogTitle>
          </DialogHeader>

          {billModalStudent && (
            <div className="space-y-4 py-2">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="font-bold text-sm text-slate-900">{billModalStudent.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Class {billModalStudent.class} · Route: {billModalStudent.route?.name || "None"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Month</Label>
                  <select
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 h-10 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={billMonth}
                    onChange={(e) => setBillMonth(e.target.value)}
                  >
                    {MONTHS_LIST.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Year</Label>
                  <select
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 h-10 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={billYear}
                    onChange={(e) => setBillYear(e.target.value)}
                  >
                    {["2025", "2026", "2027", "2028"].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                onClick={() => {
                  const targetMonthStr = `${billMonth} ${billYear}`;
                  const currentStudent = billModalStudent;
                  setBillModalStudent(null);

                  startTransition(async () => {
                    try {
                      const res = await generateIndividualChallan(currentStudent.id, targetMonthStr);
                      if (res.created) {
                        await dialog.showSuccess("Challan Created", `Fee challan created for ${currentStudent.name} for ${targetMonthStr}.`);
                      } else {
                        await dialog.showSuccess("Notice", res.message || `Challan for ${targetMonthStr} already exists.`);
                      }
                    } catch (err: unknown) {
                      const message = err instanceof Error ? err.message : "Failed to generate challan.";
                      await dialog.showAlert("Error", message);
                    }
                  });
                }}
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 font-semibold shadow-md shadow-blue-600/20"
              >
                {isPending ? "Generating..." : `Generate Challan for ${billMonth} ${billYear}`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
