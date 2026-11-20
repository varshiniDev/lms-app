import ReportsPage from "../../components/common/ReportsPage";
import { lmsReports } from "./reportDefs";
export default function LmsReports() { return <ReportsPage title="LMS Reports" subtitle="Attendance, performance, enrollment and workload reports - download as PDF or Excel" reports={lmsReports} filename="lms" />; }
