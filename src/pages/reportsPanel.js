import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { Pie } from "react-chartjs-2"; // Importing Pie chart from react-chartjs-2
import Chart from "chart.js/auto"; // Importing Chart.js
import "../styles/components/ReportsPage.css";
import { useNavigate } from "react-router-dom";

const ReportsPage = () => {
    const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("community");
  const [communityReports, setCommunityReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [analytics, setAnalytics] = useState({
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  

  const calculateAnalytics = (reports) => {
    const stats = {
      pending: 0,
      inProgress: 0,
      resolved: 0,
    };
  
    reports.forEach((report) => {
      if (report.status === "pending") {
        stats.pending += 1;
      } else if (report.status === "in-progress") {
        stats.inProgress += 1;
      } else if (report.status === "resolved") {
        stats.resolved += 1;
      }
    });
  
    setAnalytics(stats);
  };

  const updateAnalytics = (reportsData) => {
    const statusCount = { pending: 0, inProgress: 0, resolved: 0 };
    reportsData.forEach((report) => {
      if (report.status === "pending") statusCount.pending += 1;
      else if (report.status === "in-progress") statusCount.inProgress += 1;
      else if (report.status === "resolved") statusCount.resolved += 1;
    });
    setAnalytics(statusCount);
  };

  

  useEffect(() => {
    if (activeSection === "community") {
      fetchCommunityReports();
    }
  }, [activeSection]);

  useEffect(() => {
    applyFilters();
  }, [searchKeyword, filterStatus, communityReports]);

  const fetchCommunityReports = async () => {
    setLoading(true);
    try {
      const collectionRef = collection(db, "community-reports");
      const reportsSnapshot = await getDocs(collectionRef);
      const reportsData = reportsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp || null,
      }));
      setCommunityReports(reportsData);
    } catch (error) {
      console.error("Error fetching community reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId, newStatus) => {
    try {
      const reportRef = doc(db, "community-reports", reportId);
      await updateDoc(reportRef, { status: newStatus });
      setCommunityReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );
    } catch (error) {
      console.error("Error updating report status:", error);
    }
  };

  const applyFilters = () => {
    let filtered = communityReports;
  
    // Filter by search keyword
    if (searchKeyword.trim()) {
      filtered = filtered.filter(
        (report) =>
          report.communityName
            ?.toLowerCase()
            .includes(searchKeyword.toLowerCase()) ||
          report.issue?.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }
  
    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((report) => report.status === filterStatus);
    }
  
    setFilteredReports(filtered);
    calculateAnalytics(filtered); // Update analytics based on filtered reports
  };
  
  const handleSidebarClick = (section) => {
    setActiveSection(section);
    setSearchKeyword("");
    setFilterStatus("all");
  };

    // Pie chart data
    const pieChartData = {
        labels: ["Pending", "In Progress", "Resolved"],
        datasets: [
          {
            data: [analytics.pending, analytics.inProgress, analytics.resolved],
            backgroundColor: ["#FF9800", "#3F51B5", "#4CAF50"],
            borderColor: "#fff",
            borderWidth: 1,
          },
        ],
      };

  return (
    <div className="reports-page">
      <div className="report-page-sidebar">
        <ul>
          <li
            onClick={() => handleSidebarClick("community")}
            className={activeSection === "community" ? "active" : ""}
          >
            Community
          </li>
          <li
            onClick={() => handleSidebarClick("users")}
            className={activeSection === "users" ? "active" : ""}
          >
            Users
          </li>
          <li
            onClick={() => handleSidebarClick("bugs")}
            className={activeSection === "bugs" ? "active" : ""}
          >
            Bugs
          </li>

          <li
            onClick={() => handleSidebarClick("analytics")}
            className={activeSection === "analytics" ? "active" : ""}
            >
            Report Analytics
            </li>

        </ul>
      </div>

      <div className="report-page-main-content">
        <div className="report-page-filters">
          {activeSection === "community" && (
            <div className="filters">
              <input
                type="text"
                placeholder="Search by keyword..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          )}
        </div>

        <div className="report-page-content">
          {activeSection === "community" && (
            <div>
              {loading ? (
                <p>Loading community reports...</p>
              ) : (
                <div>
                  {filteredReports.length > 0 ? (
                    <table className="reports-table">
                      <thead>
                        <tr>
                          <th>Community</th>
                          <th>Issue</th>
                          <th>Description</th>
                          <th>User ID</th>
                          <th>Status</th>
                          <th>Timestamp</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReports.map((report) => (
                          <tr key={report.id}>
                            <td className="clickable" onClick={() => navigate(`/community/${report.communityId}`)}>{report.communityName}</td>
                            <td>{report.issue}</td>
                            <td>{report.description}</td>
                            <td>{report.userId}</td>
                            <td>
                              <select
                                value={report.status || "pending"}
                                onChange={(e) =>
                                  updateReportStatus(report.id, e.target.value)
                                }
                              >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                              </select>
                            </td>
                            <td>
                              {report.timestamp
                                ? new Date(
                                    report.timestamp.seconds * 1000
                                  ).toLocaleString()
                                : "No timestamp available"}
                            </td>
                            <td>
                              <button
                                onClick={() =>
                                  alert(`Viewing details for ${report.id}`)
                                }
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No community reports found.</p>
                  )}
                </div>
              )}
            </div>
          )}
          {activeSection === "users" && <p>Users section</p>}
          {activeSection === "bugs" && <p>Bugs section</p>}
          {activeSection === "analytics" && (
          <div className="report-analytics-section">
            <h2>Report Analytics</h2>
            <div className="report-analytics-cards">
              <div className="report-analytics-card">
                <h3>Pending Reports</h3>
                <p>{analytics.pending}</p>
              </div>
              <div className="report-analytics-card">
                <h3>In Progress Reports</h3>
                <p>{analytics.inProgress}</p>
              </div>
              <div className="report-analytics-card">
                <h3>Resolved Reports</h3>
                <p>{analytics.resolved}</p>
              </div>
            </div>

            <div className="chart-container">
              <Pie data={pieChartData} />
            </div>
            <div style={{padding:'40px'}}/>
          </div>
        )}

        </div>
      </div>
   
    </div>
  );
};

export default ReportsPage;
