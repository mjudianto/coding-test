import { useEffect, useState } from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from "recharts";
import { Player } from "@lottiefiles/react-lottie-player";

const STATUS_COLORS = {
  "Closed Won": "#22c55e",
  "In Progress": "#eab308",
  "Closed Lost": "#ef4444"
};

export default function DealsDashboard() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("value");
  const [sortDir, setSortDir] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [lottieError, setLottieError] = useState(false);
  const [error, setError] = useState("");
  const dealsPerPage = 8;

  useEffect(() => {
    fetch("http://localhost:8000/api/data")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((res) => setData(res.salesReps))
      .catch((err) => {
        setError("Failed to load data. Please check your connection or try again later.");
      });
  }, []);
  

  const allDeals = data.flatMap((rep) =>
    rep.deals.map((deal) => ({
      ...deal,
      repName: rep.name
    }))
  );

  const filtered = allDeals.filter((deal) => {
    const matchesSearch = deal.client.toLowerCase().includes(search.toLowerCase()) ||
      deal.repName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || deal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortBy === "value") return (a.value - b.value) * dir;
    if (sortBy === "client") return a.client.localeCompare(b.client) * dir;
    if (sortBy === "repName") return a.repName.localeCompare(b.repName) * dir;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / dealsPerPage);
  const paginatedDeals = sorted.slice(
    (currentPage - 1) * dealsPerPage,
    currentPage * dealsPerPage
  );

  const statusTotals = filtered.reduce((acc, deal) => {
    acc[deal.status] = (acc[deal.status] || 0) + deal.value;
    return acc;
  }, {});
  
  const pieData = Object.entries(statusTotals).map(([status, value]) => ({
    name: status,
    value
  }));
  
  const totalValue = pieData.reduce((sum, entry) => sum + entry.value, 0);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const sortArrow = (key) => {
    if (sortBy !== key) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  };

  

  return (
    <div className="p-6 font-sans space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Deals Dashboard</h1>
        <Link href="/">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-md transition shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </Link>
      </div>

      {error && (
        <div className="mb-6 text-red-600 bg-red-100 border border-red-300 p-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(statusTotals).map(([status, value]) => (
          <div key={status} className="p-4 rounded-lg shadow bg-white" style={{ borderLeft: `5px solid ${STATUS_COLORS[status]}` }}>
            <h3 className="text-sm font-semibold text-gray-500 mb-1">{status}</h3>
            <div className="text-2xl font-bold text-gray-800">${value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-4 rounded shadow">
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative">
            <input
              type="text"
              placeholder="Search by client or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded shadow-sm"
            />
            <div className="relative w-full md:w-1/3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none px-4 pr-10 py-2 border border-gray-300 rounded shadow-sm bg-white text-gray-700"
              >
                <option value="all">All Statuses</option>
                {Object.keys(STATUS_COLORS).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">▼</div>
            </div>
          </div>
          <p className="mb-2 text-gray-400">Tip: Click on table headers to sort the data.</p>
          
          {paginatedDeals.length === 0 ? (
            <div className="flex justify-center items-center">
              <Player
                autoplay
                loop
                src="/no-data.json"
                style={{ height: 300, width: 300 }}
                onEvent={(e) => {
                  if (e === "error") {
                    setLottieError(true);
                  }
                }}
              />
              {lottieError && (
                <p className="text-sm text-red-500 mt-2">No Data</p>
              )}
            </div>
          ) : (
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs uppercase bg-gray-100">
                <tr>
                  <th
                    className="px-4 py-2 cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort("client")}
                  >
                    Client{sortArrow("client")}
                  </th>
                  <th
                    className="px-4 py-2 cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort("repName")}
                  >
                    Representative{sortArrow("repName")}
                  </th>
                  <th className="px-4 py-2">Status</th>
                  <th
                    className="px-4 py-2 text-right cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort("value")}
                  >
                    Value{sortArrow("value")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedDeals.map((deal, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-2 font-medium text-gray-900">{deal.client}</td>
                    <td className="px-4 py-2">{deal.repName}</td>
                    <td className="px-4 py-2">
                      <span
                        className="inline-block px-2 py-1 text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor: STATUS_COLORS[deal.status],
                          color: "white",
                        }}
                      >
                        {deal.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-semibold">
                      ${deal.value.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="flex justify-between items-center mt-6">
            <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Previous</button>
            <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Next</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow flex flex-col items-center">
          <h3 className="text-lg font-bold mb-4">Deal Value Breakdown</h3>
          <ResponsiveContainer width={250} height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "#8884d8"} />
                ))}
                <Label
                  value={`$${totalValue.toLocaleString()}`}
                  position="center"
                  style={{ fontSize: '20px', fill: '#111', fontWeight: 'bold' }}
                />
              </Pie>
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-6 w-full flex flex-col items-center text-sm text-gray-700">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.name] || "#8884d8" }}></span>
                <span>{entry.name}: ${entry.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
