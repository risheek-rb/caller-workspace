"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search, Phone, Send, AlertTriangle, PanelLeftClose, PanelLeftOpen,
  ExternalLink, Calendar, RefreshCw, FileSpreadsheet, LogIn, ShieldCheck,
  Users, CheckCircle, Clock, UserPlus, Shield, User, Trash2
} from "lucide-react";

// ==========================================
// 1. SYSTEM CONFIGURATIONS & FIELD MAPPINGS
// ==========================================

interface FieldConfig {
  key: string;
  label: string;
  type?: string;
  options?: string[];
  readOnly?: boolean;
}

export interface UserAccount {
  id: string;
  username: string;
  passkey: string;
  role: "admin" | "caller";
}

const SHEET_MODES = [
  "Regular Caller Sheets (1-4)",
  "Special Calls Sheet",
  "All Active Babies Caller Sheet",
  "Grad+ Babies Caller Sheet",
];

const STAFF_OPTIONS = ["Aiman", "Amisha", "Barkha", "Jyoti", "Khusbu", "Nisha Verma", "Pooja", "Ranjana", "Rituraj", "Rubeena", "Saba", "Nayana", "Arif", "Deepika", "Neha", "Jyotsana"];
const CALL_STATUS_OPTIONS = ["No Answer", "Not Connecting", "No Incoming", "Switched Off", "Incomplete", "Complete", "Exit Call: No Answer", "Exit Call: Not Connecting", "Exit Call: No Incoming", "Exit Call: Incomplete", "Exit Call: Switched Off", "Exit Call: Complete", "Home Visit (Did Not Call)", "Incorrect Baby", "notes only - no call", "No update for baby"];
const FOLLOW_UP_OPTIONS = ["Tomorrow", "Day after Tomorrow", "In Three Days", "In Five Days", "In One Week", "In One Month", "Death", "In Hospital"];
const BABY_STATUS_OPTIONS = ["Stable", "Unwell", "Distress", "Unknown", "Dead"];
const FEEDING_OPTIONS = ["BF", "EBM", "goat", "cow", "buffalo", "formula", "another mom BF", "other", "BF + EBM", "BF + Formula", "EBM + Formula", "BF + EBM + Formula", "BF+ Animal"];
const BM_METHOD_OPTIONS = ["BF", "EBM", "BF & EBM", "none"];
const JAUNDICE_OPTIONS = ["None", "Face", "Body", "Hands & Feet"];
const YES_NO_OPTIONS = ["yes", "no"];

// DYNAMIC CONFIG GENERATOR
const getSheetConfig = (mode: string) => {
  let lists: string[] = [];
  let statuses: string[] = [];
  let staticFields: FieldConfig[] = [];
  let inputFields: FieldConfig[] = [];

  const baseStatic: FieldConfig[] = [
    { key: "id_no", label: "Case Id" },
    { key: "reason_for_call", label: "Reason for Call" }
  ];
  const postNotesStatic: FieldConfig[] = [
    { key: "female", label: "Female" },
    { key: "initial_weight", label: "Initial Weight" },
    { key: "twin_status", label: "Twin Status" },
    { key: "active_referral", label: "Active Referral" },
    { key: "last_reliable_weight", label: "last reliable weight" },
    { key: "weight_trajectory", label: "weight trajectory" },
  ];

  const baseInputs: FieldConfig[] = [
    { key: "staff", label: " Staff", type: "select", options: STAFF_OPTIONS },
    { key: "call_status", label: "Call Status", type: "select", options: CALL_STATUS_OPTIONS },
    { key: "date_to_follow_up", label: "Date To Follow Up", type: "select", options: FOLLOW_UP_OPTIONS },
    { key: "status_of_baby", label: "Status of Baby", type: "select", options: BABY_STATUS_OPTIONS },
    { key: "needs_referral", label: "needs referral?", type: "select", options: YES_NO_OPTIONS },
    { key: "HEADER", label: "Phone Calls Form", type: "header" },
  ];
  
  const endInputs: FieldConfig[] = [
    { key: "phone", label: "Phone Number: Kya is bacche ke liye koi aur phone number hai?", type: "textarea", readOnly: true },
    { key: "notes", label: "Notes", type: "textarea" },
    { key: "advice", label: "Advice", type: "textarea" },
    { key: "entry_date", label: "Data Entry Date", type: "text", readOnly: true },
  ];

  if (mode === "Regular Caller Sheets (1-4)") {
    lists = ["Priority Calls 1", "Priority Calls 2", "OPD Calls", "Pending Calls 1", "Pending Calls 2", "Pending Calls 3", "Exit Calls", "Done for Today", "Home Visit (Did Not Call)", "Notes only - no call"];
    statuses = ["Yet to Call", "Call back (Incomplete)", "Call back (No Data)"];
    staticFields = [...baseStatic, { key: "notes_today", label: "Notes entered today in All Babies Caller Sheets" }, ...postNotesStatic];
    inputFields = [
      ...baseInputs,
      { key: "ma_ki_tabiyat", label: "Ma ki tabiyat kaisi hai?", type: "textarea" },
      { key: "bachcha_kaisa_hai", label: "Bachcha kaisa hai?", type: "textarea" },
      { key: "weight", label: "weight", type: "textarea" },
      { key: "first_temp", label: "first recorded temp (add other temps to notes)", type: "textarea" },
      { key: "feeding_method", label: "Kya aap bacche ko maa ka dudh pila rahe hain, ya upar ka dudh, ya dono maa ka aur upar ka?", type: "select", options: FEEDING_OPTIONS },
      { key: "method_of_feeding_bm", label: "Method of feeding Breastmilk", type: "select", options: BM_METHOD_OPTIONS },
      { key: "bf_minutes_per_feed", label: "(If BF) minutes per feed?", type: "textarea" },
      { key: "bf_feeds_per_24h", label: "(If BF) feeds per 24 hr?", type: "textarea" },
      { key: "ebm_ml_per_feed", label: "(If EBM or formula) mL mother reports per feed", type: "textarea" },
      { key: "ebm_feeds_per_24h", label: "(If EBM or formula) no of feeds mother reports per 24h", type: "textarea" },
      { key: "ebm_required_ml", label: "(if EBM or formula) mL required for one feed based on weight", type: "textarea" },
      { key: "feeding_upar_ka_dudh", label: "feeding upar ka dudh?", type: "select", options: YES_NO_OPTIONS },
      { key: "fever", label: "fever (no; yes)", type: "select", options: YES_NO_OPTIONS },
      { key: "jaundice", label: "jaundice", type: "select", options: JAUNDICE_OPTIONS },
      { key: "pees_less_than_4", label: "pees less than 4 times", type: "select", options: YES_NO_OPTIONS },
      { key: "breathing_problems", label: "breathing problems", type: "select", options: YES_NO_OPTIONS },
      ...endInputs.slice(0, 1),
      { key: "baby_care_items", label: "Pata kar lijiye ki unke paas kaunse kaunse saman hai aur update kar lijiye (Baby Care Items)", type: "textarea", readOnly: true },
      ...endInputs.slice(1)
    ];
  } else if (mode === "Special Calls Sheet") {
    lists = ["Special Calls", "All Babies"];
    statuses = ["Yet to Call", "Call back (Incomplete)", "Call back (No Data)"];
    staticFields = [...baseStatic, { key: "notes_today", label: "Notes entered today in Caller/special caller sheets" }, ...postNotesStatic];
    inputFields = [
      ...baseInputs,
      { key: "ma_ki_tabiyat", label: "Ma ki tabiyat kaisi hai?", type: "textarea" },
      { key: "bachcha_kaisa_hai", label: "Bachcha kaisa hai?", type: "textarea" },
      { key: "weight", label: "weight", type: "textarea" },
      { key: "first_temp", label: "first recorded temp (add other temps to notes)", type: "textarea" },
      { key: "feeding_method", label: "Kya aap bacche ko maa ka dudh pila rahe hain, ya upar ka dudh, ya dono maa ka aur upar ka?", type: "select", options: FEEDING_OPTIONS },
      { key: "method_of_feeding_bm", label: "Method of feeding Breastmilk", type: "select", options: BM_METHOD_OPTIONS },
      { key: "bf_minutes_per_feed", label: "(If BF) minutes per feed?", type: "textarea" },
      { key: "bf_feeds_per_24h", label: "(If BF) feeds per 24 hr?", type: "textarea" },
      { key: "ebm_ml_per_feed", label: "(If EBM or formula) mL mother reports per feed", type: "textarea" },
      { key: "ebm_feeds_per_24h", label: "(If EBM or formula) no of feeds mother reports per 24h", type: "textarea" },
      { key: "ebm_required_ml", label: "(if EBM or formula) mL required for one feed based on weight", type: "textarea" },
      { key: "feeding_upar_ka_dudh", label: "feeding upar ka dudh?", type: "select", options: YES_NO_OPTIONS },
      { key: "fever", label: "fever (no; yes)", type: "select", options: YES_NO_OPTIONS },
      { key: "jaundice", label: "jaundice", type: "select", options: JAUNDICE_OPTIONS },
      { key: "pees_less_than_4", label: "pees less than 4 times", type: "select", options: YES_NO_OPTIONS },
      { key: "breathing_problems", label: "breathing problems", type: "select", options: YES_NO_OPTIONS },
      ...endInputs.slice(0, 1),
      { key: "baby_care_items", label: "Pata kar lijiye ki unke paas kaunse kaunse saman hai aur update kar lijiye (Baby Care Items)", type: "textarea", readOnly: true },
      ...endInputs.slice(1)
    ];
  } else if (mode === "All Active Babies Caller Sheet") {
    lists = ["All"];
    statuses = ["All Babies"];
    staticFields = [...baseStatic, { key: "notes_today", label: "Notes entered today in All Babies Caller Sheets" }, ...postNotesStatic];
    inputFields = [
      ...baseInputs,
      { key: "ma_ki_tabiyat", label: "Ma ki tabiyat kaisi hai?", type: "textarea" },
      { key: "bachcha_kaisa_hai", label: "Bachcha kaisa hai?", type: "textarea" },
      { key: "weight", label: "weight", type: "textarea" },
      { key: "first_temp", label: "first recorded temp (add other temps to notes)", type: "textarea" },
      ...endInputs.slice(0, 1),
      { key: "baby_care_items", label: "Pata kar lijiye ki unke paas kaunse kaunse saman hai aur update kar lijiye (Baby Care Items)", type: "textarea", readOnly: true },
      ...endInputs.slice(1)
    ];
  } else if (mode === "Grad+ Babies Caller Sheet") {
    lists = ["Graduated"];
    statuses = ["All"];
    staticFields = [...baseStatic, ...postNotesStatic]; 
    inputFields = [
      ...baseInputs,
      { key: "bachcha_kaisa_hai", label: "Bachcha kaisa hai?", type: "textarea" },
      { key: "weight", label: "weight", type: "textarea" },
      ...endInputs
    ];
  }

  return { lists, statuses, staticFields, inputFields };
};

// ==========================================
// 2. COMPONENT: CALLER WORKSPACE
// ==========================================

function CallerWorkspace({ currentUser, onLogout }: { currentUser: UserAccount, onLogout: () => void }) {
  const [sheetMode, setSheetMode] = useState(SHEET_MODES[0]);
  const { lists, statuses, staticFields, inputFields } = useMemo(() => getSheetConfig(sheetMode), [sheetMode]);

  const [selectedList, setSelectedList] = useState(lists[0]);
  const [selectedStatus, setSelectedStatus] = useState(statuses[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [leftOpen, setLeftOpen] = useState(true);

  const [families, setFamilies] = useState<any[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<any>(null);
  const [formsData, setFormsData] = useState<any[]>([]);
  
  const [selectedCaller, setSelectedCaller] = useState("Caller 1");

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentDate = new Date().toLocaleString("en-US", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  useEffect(() => {
    setSelectedList(lists[0]);
    setSelectedStatus(statuses[0]);
    setFamilies([]);
    setSelectedFamily(null);
    setFormsData([]);
  }, [sheetMode, lists, statuses]);

  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement> | React.FocusEvent<HTMLTextAreaElement> | HTMLTextAreaElement) => {
    const target = 'target' in e ? e.target : e;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };

  const fetchList = async () => {
    setIsLoading(true);
    setFamilies([]);
    setSelectedFamily(null);
    setFormsData([]);
    try {
      const res = await fetch("/api/caller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_calling_list", list: selectedList, type: selectedStatus }),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const familiesMap = new Map();
        json.data.forEach((item: any) => {
          const rawMother = item.mother || item.Mother || "Unknown";
          const rawFather = item.father || item.Father || "Unknown";
          const familyKey = item.twin_id ? `TWIN-${item.twin_id}` : `${rawMother.trim().toLowerCase()}-${rawFather.trim().toLowerCase()}`;
          if (!familiesMap.has(familyKey)) {
            familiesMap.set(familyKey, {
              family_id: `FAM-${item.id_no}`, mother: rawMother.trim(), father: rawFather.trim(),
              status: selectedList, lockedBy: null, babies: [{ id_no: item.id_no }],
            });
          } else {
            familiesMap.get(familyKey).babies.push({ id_no: item.id_no });
          }
        });
        setFamilies(Array.from(familiesMap.values()));
      }
    } catch (e) { console.error("Failed to fetch cases", e); }
    setIsLoading(false);
  };

  const handleSidebarClick = (f: any) => {
    setSelectedFamily(f);
    setFormsData([]); 
  };

  const fetchDeepDetails = async () => {
    if (!selectedFamily) return;
    setIsFetchingDetails(true);
    try {
      const res = await fetch("/api/caller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "get_baby_information", 
          babyID: selectedFamily.babies[0].id_no,
          caseIdSearchName: selectedCaller 
        }),
      });
      const json = await res.json();

      if (json.success && json.data) {
        const fetchedBabiesRaw = Object.values(json.data) as any[];
        const detailedBabies = fetchedBabiesRaw.map((b: any) => ({
          ...b, 
          id_no: b["ID No"] || b.id_no || "-",
          reason_for_call: b["Reason for Call"] || b.reason_for_call || "-",
          notes_today: b["Notes entered today in All Babies Caller Sheets"] || b["Notes entered today in Caller/special caller sheets"] || "-",
          female: b["Female"] || b.female || "-",
          initial_weight: b["Initial Weight"] || b.initial_weight || "-",
          twin_status: b["Twin Status"] || b.twin_status || "-",
          active_referral: b["Active Referral"] || b.active_referral || "-",
          last_reliable_weight: b["last reliable weight"] || "-",
          weight_trajectory: b["weight trajectory"] || "-",
          baby_order: b["Baby Order"] || "Single Baby",
        }));

        const detailedFamily = { ...selectedFamily, babies: detailedBabies };
        setSelectedFamily(detailedFamily);

        const initialForms = detailedBabies.map((b: any) => {
          let form: any = {};
          inputFields.forEach((fld) => (form[fld.key] = ""));
          form.entry_date = currentDate;
          form.phone = b["Phone Numbers"] || b.phone_numbers || "";
          form.baby_care_items = b["Baby Care Items"] || b.last_baby_care_items || "";
          return form;
        });
        setFormsData(initialForms);

        setTimeout(() => {
          document.querySelectorAll('textarea').forEach((txt) => handleTextareaResize(txt));
        }, 100);
      }
    } catch (e) { console.error("Failed to fetch detailed baby info", e); }
    setIsFetchingDetails(false);
  };

  const handleFormChange = (babyIndex: number, field: string, value: any) => {
    setFormsData((prev) => {
      const newData = [...prev];
      newData[babyIndex] = { ...newData[babyIndex], [field]: value };
      return newData;
    });
  };

  const handleSave = async () => {
    if (!formsData[0].staff || !formsData[0].call_status) return alert("Validation Error: Please fill Staff Name and Call Status for Baby 1.");
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSelectedFamily(null);
      setFormsData([]);
      fetchList();
    }, 1500);
  };

  const displayCases = useMemo(() => {
    return families.filter((f) => f.mother?.toLowerCase().includes(searchQuery.toLowerCase()) || f.babies.some((b: any) => String(b.id_no).includes(searchQuery)));
  }, [families, searchQuery]);

  return (
    <div className="flex h-screen w-screen bg-slate-100 overflow-hidden font-sans text-slate-800">
      
      {isSaving && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex flex-col items-center justify-center transition-all">
          <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center gap-4">
            <RefreshCw className="w-10 h-10 animate-spin text-emerald-600" />
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-800">Saving Data...</h2>
              <p className="text-sm text-slate-500 mt-1">Please do not close this window.</p>
            </div>
          </div>
        </div>
      )}

      {/* LEFT SIDEBAR */}
      <aside className={`flex flex-col h-full bg-slate-900 text-slate-100 transition-all duration-300 ease-in-out shrink-0 z-30 ${leftOpen ? "w-[320px] border-r border-slate-800 shadow-xl" : "w-0 overflow-hidden border-none"}`}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between min-w-[320px]">
          <h1 className="font-bold text-lg tracking-wide flex items-center gap-2"><Phone className="w-5 h-5 text-emerald-400" /> Case Id Search</h1>
          <button onClick={() => setLeftOpen(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><PanelLeftClose className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4 bg-slate-900/80 border-b border-slate-800 min-w-[320px]">
          <div className="bg-slate-800 p-3 rounded border border-emerald-900">
            <label className="block text-[11px] text-emerald-400 font-bold mb-1 flex items-center gap-1"><FileSpreadsheet className="w-3 h-3" /> Active Sheet Workspace</label>
            <select value={sheetMode} onChange={(e) => setSheetMode(e.target.value)} className="w-full bg-transparent text-sm text-white outline-none cursor-pointer font-semibold">
              {SHEET_MODES.map((mode) => (<option className="bg-slate-800" key={mode}>{mode}</option>))}
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">Select a List</label>
              <select value={selectedList} onChange={(e) => setSelectedList(e.target.value)} className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm outline-none focus:border-emerald-500 cursor-pointer">
                {lists.map((l) => (<option key={l}>{l}</option>))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">Select a Status</label>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm outline-none focus:border-emerald-500 cursor-pointer">
                {statuses.map((s) => (<option key={s}>{s}</option>))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input placeholder="Search ID or Mother..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-800 border border-slate-700 pl-9 pr-3 py-2 text-sm rounded outline-none focus:border-emerald-500 placeholder:text-slate-500"/>
            </div>
            <button onClick={fetchList} disabled={isLoading} className="px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 rounded flex items-center justify-center transition-colors shadow-sm">
              <RefreshCw className={`w-4 h-4 text-white ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50 min-w-[320px] relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
              <p className="text-xs font-bold uppercase tracking-wider">Loading Cases...</p>
            </div>
          ) : displayCases.length === 0 ? (
            <p className="text-center text-slate-500 text-xs mt-10 px-4">No cases loaded. Click the green refresh button above.</p>
          ) : (
            displayCases.map((f, i) => (
              <div key={i} onClick={() => handleSidebarClick(f)} className={`w-full text-left p-4 cursor-pointer transition-colors ${selectedFamily?.family_id === f.family_id ? "bg-emerald-900/40 border-l-4 border-emerald-500" : "hover:bg-slate-800/50 border-l-4 border-transparent"}`}>
                <div className="flex justify-between items-start mb-1 pointer-events-none">
                  <span className="font-bold text-slate-200 text-sm">{f.mother} & {f.father}</span>
                </div>
                <p className="text-[11px] text-slate-400 pointer-events-none">IDs: {f.babies.map((b: any) => b.id_no).join(", ")}</p>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-slate-800 bg-slate-900 min-w-[320px] flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <User className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">{currentUser.username}</span>
          </div>
          <button onClick={onLogout} className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-400 rounded text-xs font-bold transition-colors">Logout</button>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col h-full bg-slate-50 relative min-w-0">
        {!leftOpen && (
          <button onClick={() => setLeftOpen(true)} className="absolute top-4 left-4 z-40 p-2 bg-slate-900 text-white rounded-md shadow-lg hover:bg-slate-800 transition-all"><PanelLeftOpen className="w-5 h-5" /></button>
        )}

        {!selectedFamily ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50 h-full">
            <p className="text-xl font-medium text-slate-500">Select a family from the sidebar to begin</p>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            
            <div className="bg-white border-b border-slate-200 shadow-sm flex items-center justify-between z-10 shrink-0">
              <div className={`px-6 py-3 text-sm font-bold text-slate-600 flex items-center gap-2 ${!leftOpen ? "pl-16" : ""}`}>
                <Calendar className="w-4 h-4 text-emerald-600" /> Case ID: {selectedFamily.babies.map((b: any) => b.id_no).join(", ")}
              </div>
              
              <div className="mr-6 flex items-center gap-3 py-2">
                <div className="flex items-center gap-2 border-r border-slate-300 pr-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Target:</span>
                  <select
                    className="bg-slate-100 border border-slate-300 px-2 py-1.5 rounded text-xs font-bold text-slate-700 outline-none cursor-pointer"
                    value={selectedCaller}
                    onChange={(e) => setSelectedCaller(e.target.value)}
                  >
                    <option value="Caller 1">Caller 1</option>
                    <option value="Caller 2">Caller 2</option>
                  </select>
                  <button
                    onClick={fetchDeepDetails}
                    disabled={isFetchingDetails}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-2 shadow-sm transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Update Sheet & Fetch Data
                  </button>
                </div>
                
                {/* Official Google Sheets External Links */}
                <div className="flex items-center gap-2 pl-1">
                  <a href="https://docs.google.com/spreadsheets/d/1zPe2u_9qO2r39gcZPeBd3KcmL3iOKiR6iBVo_s5aeF8/edit?usp=sharing" target="_blank" rel="noreferrer" className="bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 px-3 py-1.5 rounded text-[11px] font-bold shadow-sm flex items-center gap-1 transition-colors">
                    <ExternalLink className="w-3 h-3 text-blue-500" /> Caller Sheet 1
                  </a>
                  <a href="https://docs.google.com/spreadsheets/d/1GH04ES79jsgS4IWVIgFd1osSLVuuZfoewKxqEaNY0Ls/edit?usp=sharing" target="_blank" rel="noreferrer" className="bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 px-3 py-1.5 rounded text-[11px] font-bold shadow-sm flex items-center gap-1 transition-colors">
                    <ExternalLink className="w-3 h-3 text-blue-500" /> Caller Sheet 2
                  </a>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-slate-50 pb-20 relative">
              {isFetchingDetails && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center transition-all">
                  <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center gap-3 border border-slate-200">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                    <div className="text-center"><h2 className="text-base font-bold text-slate-800">Assigning & Loading Case Data...</h2></div>
                  </div>
                </div>
              )}

              {formsData.length === 0 && !isFetchingDetails ? (
                <div className="flex h-full items-center justify-center flex-col text-slate-400">
                  <p className="text-lg font-bold text-slate-500 mb-2">Ready to Load</p>
                  <p className="text-sm max-w-sm text-center">Please select a Target Caller from the top right and click <strong className="text-blue-600">Update Sheet & Fetch Data</strong> to load the full workspace.</p>
                </div>
              ) : (
                <table className="text-left border-collapse w-max bg-white">
                  <thead className="sticky top-0 z-20 shadow-sm">
                    <tr>
                      <th className="bg-[#b45f06] text-white text-xs font-bold px-3 py-2 border-r border-slate-300 w-[320px] min-w-[320px] max-w-[320px] sticky left-0 z-30">Baby Order</th>
                      {selectedFamily.babies.map((b: any, i: number) => (
                        <th key={i} className="bg-[#e69138] text-white text-xs font-bold px-3 py-2 border-r border-slate-300 w-[320px] min-w-[320px] max-w-[320px] text-center">{b.baby_order}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {staticFields.map((field, idx) => (
                      <tr key={idx} className="border-b border-slate-300">
                        <td className="sticky left-0 bg-[#9fbfe6] border-r border-slate-300 px-3 py-1.5 text-[11px] font-bold text-slate-800 w-[320px] min-w-[320px] max-w-[320px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{field.label}</td>
                        {selectedFamily.babies.map((b: any, i: number) => (
                          <td key={i} className="bg-[#c9daf8] border-r border-slate-300 px-3 py-1.5 text-[11px] text-slate-900 font-medium align-top w-[320px] min-w-[320px] max-w-[320px] whitespace-pre-wrap break-words">{b[field.key] || "-"}</td>
                        ))}
                      </tr>
                    ))}

                    {inputFields.map((field, idx) => {
                      if (field.type === "header") {
                        return (
                          <tr key={idx} className="bg-[#f1c232]">
                            <td colSpan={selectedFamily.babies.length + 1} className="sticky left-0 font-bold text-sm text-slate-900 px-3 py-2 border-y border-slate-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{field.label}</td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={idx} className="border-b border-slate-300 hover:bg-yellow-50/50 transition-colors">
                          <td className="sticky left-0 bg-[#ffe599] border-r border-slate-300 px-3 py-1 text-[11px] font-bold text-slate-800 w-[320px] min-w-[320px] max-w-[320px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] leading-tight">{field.label}</td>
                          {formsData.map((data, babyIndex) => (
                            <td key={babyIndex} className={`border-r border-slate-300 px-1 py-1 align-top w-[320px] min-w-[320px] max-w-[320px] ${field.readOnly ? "bg-slate-200" : "bg-[#fff2cc]"}`}>
                              {field.type === "select" && (
                                <select disabled={!!selectedFamily.lockedBy || field.readOnly} className={`w-full bg-transparent border-none text-[11px] p-1 outline-none rounded font-medium ${field.readOnly || selectedFamily.lockedBy ? "text-slate-600 cursor-not-allowed" : "text-slate-900 focus:ring-1 focus:ring-emerald-500 cursor-pointer"}`} value={data[field.key] || ""} onChange={(e) => handleFormChange(babyIndex, field.key, e.target.value)}>
                                  <option value=""></option>{field.options?.map((opt: string) => (<option key={opt} value={opt}>{opt}</option>))}
                                </select>
                              )}
                              {field.type === "text" && (
                                <input type={field.type} readOnly={field.readOnly || !!selectedFamily.lockedBy} className={`w-full bg-transparent border-none text-[11px] p-1 outline-none rounded font-medium ${field.readOnly || selectedFamily.lockedBy ? "text-slate-600 cursor-not-allowed" : "text-slate-900 focus:ring-1 focus:ring-emerald-500"}`} value={data[field.key] || ""} onChange={(e) => handleFormChange(babyIndex, field.key, e.target.value)} />
                              )}
                              {field.type === "textarea" && (
                                <textarea
                                  readOnly={!!selectedFamily.lockedBy || field.readOnly}
                                  rows={Math.max(1, (data[field.key] || "").split("\n").length)}
                                  className={`w-full bg-transparent border-none text-[11px] p-1 outline-none rounded resize-none font-medium whitespace-pre-wrap overflow-hidden min-h-[30px] ${field.readOnly || selectedFamily.lockedBy ? "text-slate-600 cursor-not-allowed" : "text-slate-900 focus:ring-1 focus:ring-emerald-500"}`}
                                  value={data[field.key] || ""}
                                  onFocus={handleTextareaResize}
                                  onChange={(e) => {
                                    handleFormChange(babyIndex, field.key, e.target.value);
                                    handleTextareaResize(e);
                                  }}
                                />
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            
            {formsData.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex justify-between items-center shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-30">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Ready to Save {selectedFamily.babies.length} {selectedFamily.babies.length > 1 ? "Babies" : "Baby"}</span>
                </div>
                <button disabled={isSaving || !!selectedFamily.lockedBy} onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white text-sm font-bold px-8 py-3 rounded-lg flex items-center gap-2 shadow-md active:scale-95 transition-all">
                  <Send className="w-4 h-4" /> Save {selectedFamily.babies.length > 1 ? "All Babies Data" : "Case Data"}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ==========================================
// 3. COMPONENT: ADMIN DASHBOARD
// ==========================================

function AdminDashboard({ 
  users, onAddUser, onUpdateRole, onRemoveUser, onLogout 
}: { 
  users: UserAccount[], 
  onAddUser: (u: Omit<UserAccount, "id">) => void, 
  onUpdateRole: (id: string, role: "admin"|"caller") => void, 
  onRemoveUser: (id: string) => void,
  onLogout: () => void 
}) {
  const [newUsername, setNewUsername] = useState("");
  const [newPasskey, setNewPasskey] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "caller">("caller");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPasskey) return alert("Please fill all fields.");
    onAddUser({ username: newUsername, passkey: newPasskey, role: newRole });
    setNewUsername(""); setNewPasskey("");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800 flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><ShieldCheck className="w-8 h-8 text-blue-600" /> Admin Control Panel</h1>
          <p className="text-slate-500 mt-1 font-medium">System Overview and Access Management</p>
        </div>
        <button onClick={onLogout} className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded shadow-sm font-bold text-sm transition-colors flex items-center gap-2">
          Secure Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full"><CheckCircle className="w-8 h-8" /></div>
          <div><p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Cases Saved</p><p className="text-3xl font-black text-slate-800">142</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full"><RefreshCw className="w-8 h-8" /></div>
          <div><p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Updates Synced</p><p className="text-3xl font-black text-slate-800">87</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-full"><Users className="w-8 h-8" /></div>
          <div><p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Staff</p><p className="text-3xl font-black text-slate-800">{users.length}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
        <div className="bg-slate-50 border-b border-slate-200 p-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Shield className="w-5 h-5 text-blue-600" /> Access Control & User Management</h2>
        </div>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 lg:border-r border-slate-200 lg:pr-8">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2"><UserPlus className="w-4 h-4"/> Add Personnel</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Username</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded focus:ring-1 focus:ring-blue-500 outline-none font-medium" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="e.g. j.doe"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Secure Passkey</label>
                <input type="password" className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded focus:ring-1 focus:ring-blue-500 outline-none font-medium" value={newPasskey} onChange={(e) => setNewPasskey(e.target.value)} placeholder="••••••"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">System Role</label>
                <select className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded focus:ring-1 focus:ring-blue-500 outline-none font-medium cursor-pointer" value={newRole} onChange={(e) => setNewRole(e.target.value as "admin"|"caller")}>
                  <option value="caller">Caller</option><option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded flex items-center justify-center gap-2 shadow-sm transition-colors mt-2">
                Create Account
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Active System Users</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">System ID</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Username</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Category Switcher</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-500">#{u.id}</td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-800">{u.username}</td>
                      <td className="px-4 py-3">
                        <select 
                          className={`text-xs font-bold px-2 py-1 rounded outline-none border cursor-pointer ${u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}
                          value={u.role} onChange={(e) => onUpdateRole(u.id, e.target.value as "admin"|"caller")}
                        >
                          <option value="caller">Caller Category</option><option value="admin">Admin Category</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => { if(window.confirm(`Are you sure you want to remove user "${u.username}"?`)) onRemoveUser(u.id); }} 
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded transition-colors"
                          title="Remove User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. MAIN APP ROUTER / LOGIN GATEWAY
// ==========================================

export default function AppRouter() {
  const [view, setView] = useState<"login" | "caller" | "admin">("login");
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  
  const [users, setUsers] = useState<UserAccount[]>([
    { id: "1001", username: "admin", passkey: "admin", role: "admin" },
    { id: "1002", username: "caller", passkey: "caller", role: "caller" }
  ]);

  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const user = users.find(u => u.username === usernameInput && u.passkey === passwordInput);
    if (user) {
      setCurrentUser(user);
      setView(user.role);
    } else {
      setError("Invalid security credentials.");
    }
  };

  const handleLogout = () => {
    setView("login");
    setCurrentUser(null);
    setUsernameInput("");
    setPasswordInput("");
  };

  const handleAddUser = (newUser: Omit<UserAccount, "id">) => {
    const id = Math.floor(1000 + Math.random() * 9000).toString();
    setUsers([...users, { ...newUser, id }]);
  };

  const handleUpdateRole = (id: string, newRole: "admin" | "caller") => {
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  const handleRemoveUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  if (view === "login") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="bg-slate-800 p-8 text-center">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">Caller Workspace</h1>
            <p className="text-emerald-400 text-sm font-medium mt-1">Secure Authorization Portal</p>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold rounded flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Network ID</label>
              <input 
                type="text" autoFocus 
                className="w-full bg-slate-50 border border-slate-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-medium text-slate-800 transition-all" 
                value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="Enter Username"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Secure Passkey</label>
              <input 
                type="password" 
                className="w-full bg-slate-50 border border-slate-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-medium text-slate-800 transition-all" 
                value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="••••••"
              />
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">
              <LogIn className="w-5 h-5" /> Authenticate & Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === "admin") {
    return <AdminDashboard users={users} onAddUser={handleAddUser} onUpdateRole={handleUpdateRole} onRemoveUser={handleRemoveUser} onLogout={handleLogout} />;
  }
  
  if (view === "caller" && currentUser) {
    return <CallerWorkspace currentUser={currentUser} onLogout={handleLogout} />;
  }

  return null;
}