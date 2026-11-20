import { Printer } from "lucide-react";
import PageHeader from "./PageHeader";
import ExportMenu from "./ExportMenu";
export default function DashboardHeader({ title, subtitle, date, onDate, sections, filename }) {
  return (
    <PageHeader title={title} subtitle={subtitle}>
      {onDate && <input type="date" className="input !w-auto" value={date} onChange={(e) => e.target.value && onDate(e.target.value)} />}
      <button className="btn btn-ghost" onClick={() => window.print()}><Printer size={16} />Print</button>
      <ExportMenu sections={sections} filename={filename} title={title} subtitle={subtitle} />
    </PageHeader>
  );
}
