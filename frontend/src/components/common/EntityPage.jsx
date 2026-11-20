import { useState } from "react";
import { Plus, Eye, Pencil, Trash2, Upload } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { can } from "../../lib/access";
import ImportModal from "./ImportModal";
import { useDb } from "../../hooks/useDb";
import { insert, update, remove } from "../../services/store";
import { errMsg, fieldErrors } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { fmtDate } from "../../lib/format";
import PageHeader from "./PageHeader";
import StatCard from "./StatCard";
import DataTable from "./DataTable";
import Modal from "./Modal";
import FormFields from "./FormFields";

/**
 * Config-driven CRUD screen on top of the Django REST API (list, search, filters, sort, pagination, PDF/Excel export, add/view/edit/delete).
 *  collection  key in config/collections.js   columns  DataTable columns       fields  form fields
 *  stats(rows) -> cards                       filters  [{key,label,options}]   baseFilter(row)  scope rows
 *  defaults    initial "Add" values           prepare(values,isNew,allRows) -> values to send
 *  onSaved(rec,isNew)   rowActions(row) -> extra buttons
 */
export default function EntityPage({ title, subtitle, singular, collection, columns, fields, stats, filters = [], baseFilter, defaults = {}, prepare, onSaved, rowActions, canAdd = true, canEdit = true, canDelete = true, screen, rowEditable, rowDeletable, importFields, headerExtra, above, searchPlaceholder, exportName }) {
  const all = useDb()[collection]; const toast = useToast(); const { user } = useAuth(); const sc = screen || collection;
  canAdd = canAdd && can(user, sc, "add"); canEdit = canEdit && can(user, sc, "edit"); canDelete = canDelete && can(user, sc, "delete");
  const scoped = baseFilter ? all.filter(baseFilter) : all;
  const [fv, setFv] = useState({});
  const rows = scoped.filter((r) => filters.every((f) => !fv[f.key] || String(r[f.key]) === fv[f.key]));
  const [modal, setModal] = useState(null); const [values, setValues] = useState({}); const [errors, setErrors] = useState({}); const [busy, setBusy] = useState(false);
  const noun = singular || title.replace(/s$/, ""); const close = () => setModal(null);
  const openAdd = () => { setValues({ ...defaults }); setErrors({}); setModal({ mode: "add" }); };
  const openEdit = (row) => { setValues({ ...row }); setErrors({}); setModal({ mode: "edit", row }); };
  const submit = async (e) => {
    e.preventDefault(); const er = {};
    fields.forEach((f) => { if (f.required && (values[f.key] === "" || values[f.key] == null)) er[f.key] = "Required"; });
    if (Object.keys(er).length) return setErrors(er);
    const isNew = modal.mode === "add"; const v = prepare ? prepare({ ...values }, isNew, all) : values;
    setBusy(true);
    try {
      if (isNew) onSaved?.(await insert(collection, v), true); else onSaved?.(await update(collection, modal.row.id, v), false);
      toast(`${noun} ${isNew ? "added" : "updated"}`); close();
    } catch (err) { setErrors(fieldErrors(err)); toast(errMsg(err), "error"); } finally { setBusy(false); }
  };
  const del = async () => { setBusy(true); try { await remove(collection, modal.row.id); toast(`${noun} deleted`); } catch (err) { toast(errMsg(err), "error"); } finally { setBusy(false); close(); } };
  const show = (f, row) => (f.display ? f.display(row) : f.type === "date" ? fmtDate(row[f.key]) : row[f.key] || "-");
  const actions = (r) => (
    <>
      {rowActions?.(r).map((a, i) => <button key={i} title={a.title} className={`icon-btn ${a.cls || "text-purple-600"}`} onClick={() => a.onClick(r)}><a.icon size={16} /></button>)}
      <button title="View" className="icon-btn text-sky-600" onClick={() => setModal({ mode: "view", row: r })}><Eye size={16} /></button>
      {canEdit && (!rowEditable || rowEditable(r)) && <button title="Edit" className="icon-btn text-amber-600" onClick={() => openEdit(r)}><Pencil size={16} /></button>}
      {canDelete && (!rowDeletable || rowDeletable(r)) && <button title="Delete" className="icon-btn text-red-600" onClick={() => setModal({ mode: "delete", row: r })}><Trash2 size={16} /></button>}
    </>
  );
  const statList = stats ? stats(rows) : [];
  const filterUi = filters.map((f) => (
    <select key={f.key} className="input !w-auto" value={fv[f.key] || ""} onChange={(e) => setFv({ ...fv, [f.key]: e.target.value })}>
      <option value="">{f.label}: All</option>{f.options.map((o) => { const x = typeof o === "object" ? o : { value: o, label: o }; return <option key={x.value} value={String(x.value)}>{x.label}</option>; })}
    </select>
  ));
  return (
    <div className="space-y-5 w-full">
      <PageHeader title={title} subtitle={subtitle}>{headerExtra}{canAdd && importFields && <button className="btn btn-ghost" onClick={() => setModal({ mode: "import" })}><Upload size={16} />Import</button>}{canAdd && <button className="btn btn-primary" onClick={openAdd}><Plus size={16} />Add {noun}</button>}</PageHeader>
      {statList.length > 0 && <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{statList.map((s) => <StatCard key={s.label} {...s} />)}</div>}
      {above}
      <DataTable columns={columns} rows={rows} actions={actions} toolbar={filterUi} exportName={exportName || collection} exportTitle={title} searchPlaceholder={searchPlaceholder || `Search ${title.toLowerCase()}...`} />
      {(modal?.mode === "add" || modal?.mode === "edit") && (
        <Modal title={`${modal.mode === "add" ? "Add" : "Edit"} ${noun}`} onClose={close} footer={<><button className="btn btn-ghost" onClick={close}>Cancel</button><button form="entity-form" disabled={busy} className="btn btn-primary">{busy ? "Saving..." : "Save"}</button></>}>
          <form id="entity-form" onSubmit={submit}><FormFields fields={fields} values={values} errors={errors} onChange={(k, v) => setValues((s) => ({ ...s, [k]: v }))} /></form>
        </Modal>
      )}
      {modal?.mode === "import" && <ImportModal title={title} collection={collection} fields={fields.filter((f) => importFields.includes(f.key))} defaults={defaults} onClose={close} />}
      {modal?.mode === "view" && (
        <Modal title={`${noun} details`} onClose={close} footer={<button className="btn btn-ghost" onClick={close}>Close</button>}>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">{fields.map((f) => <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}><dt className="label">{f.label}</dt><dd className="text-sm text-slate-800">{show(f, modal.row)}</dd></div>)}</dl>
        </Modal>
      )}
      {modal?.mode === "delete" && (
        <Modal size="sm" title={`Delete ${noun}?`} onClose={close} footer={<><button className="btn btn-ghost" onClick={close}>Cancel</button><button className="btn btn-danger" disabled={busy} onClick={del}>Delete</button></>}>
          <p className="text-sm text-slate-600">This permanently removes this {noun.toLowerCase()} from the database, including records that depend on it. This cannot be undone.</p>
        </Modal>
      )}
    </div>
  );
}
