import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#22c55e", "#eab308", "#ef4444"];

export default function UserProfile() {
  const router = useRouter();
  const { id } = router.query;

  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("deals");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState("highest");
  const [currentPage, setCurrentPage] = useState(1);

  const dealsPerPage = 10;

  useEffect(() => {
    if (!id) return;

    const decodedId = atob(id);

    fetch("http://localhost:8000/api/sales/data")
      .then((res) => res.json())
      .then((data) => {
        const found = data.data.salesReps.find((u) => u.id === Number(decodedId));
        setUser(found);
      })
      .catch((err) => {
        console.error("Failed to fetch user data:", err);
      });
  }, [id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortKey]);

  if (!user) return <p className="p-8">Loading...</p>;

  const pieData = [
    {
      name: "Closed Won",
      value: user.deals.filter((d) => d.status === "Closed Won").reduce((a, b) => a + b.value, 0),
    },
    {
      name: "In Progress",
      value: user.deals.filter((d) => d.status === "In Progress").reduce((a, b) => a + b.value, 0),
    },
    {
      name: "Closed Lost",
      value: user.deals.filter((d) => d.status === "Closed Lost").reduce((a, b) => a + b.value, 0),
    },
  ];

  const filteredDeals = [...user.deals]
    .filter((deal) =>
      `${deal.client} ${deal.status}`.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortKey === "highest") return b.value - a.value;
      if (sortKey === "lowest") return a.value - b.value;
      return 0;
    });

  const totalPages = Math.ceil(filteredDeals.length / dealsPerPage);
  const startIndex = (currentPage - 1) * dealsPerPage;
  const currentDeals = filteredDeals.slice(startIndex, startIndex + dealsPerPage);

  return (
    <div className="p-8 font-sans">
      <Link href="/">
        <button className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-md transition shadow-sm">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
      </Link>

      <div className="flex flex-col lg:flex-row gap-8 h-[650px]">
        {/* Left side */}
        <div className="w-full lg:w-1/3 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">{user.name}</h2>
          <p className="text-sm text-gray-500 mb-2">{user.region}</p>
          <p className="text-sm text-gray-500 mb-4">{user.role}</p>
          <div className="w-40 h-40 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow">
            {user.name[0]}
          </div>

          {/* Skills */}
          <div className="mt-4 grid grid-cols-3 gap-2 w-full px-8">
            {user.skills.length === 0 ? (
              <p className="text-center text-gray-400 italic col-span-3">No skills listed</p>
            ) : (
              user.skills.map((s, i) => (
                <div
                  key={i}
                  className="bg-blue-600 px-2 py-1 rounded-full text-sm font-medium text-white text-center flex items-center justify-center"
                >
                  {s}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="w-full lg:w-2/3 h-full overflow-y-auto p-4 border border-gray-200 rounded-lg bg-white shadow">
          {/* Tabs */}
          <div className="flex gap-4 mb-4 border-b pb-2 sticky top-0 bg-white z-10">
            {["deals", "clients"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1 rounded-t-md font-medium border-b-2 transition-all ${
                  tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-blue-600"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {tab === "deals" && (
              <>
                {user.deals.length === 0 ? (
                  <p className="text-center text-gray-400 italic">No deals available</p>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Search by client or status..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-2/3 px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="relative w-full md:w-1/3">
                        <select
                          value={sortKey}
                          onChange={(e) => setSortKey(e.target.value)}
                          className="w-full appearance-none px-4 pr-10 py-2 border border-gray-300 rounded shadow-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="highest">Sort by Highest Value</option>
                          <option value="lowest">Sort by Lowest Value</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                          ▼
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <ul className="text-gray-700 space-y-2">
                        {currentDeals.map((deal, i) => (
                          <li
                            key={i}
                            className="flex justify-between items-center p-3 border rounded-lg bg-gray-50"
                          >
                            <div>
                              <p className="text-base font-medium text-gray-800">{deal.client}</p>
                              <p className="text-sm text-gray-500">{deal.status}</p>
                            </div>
                            <p
                              className={`text-base font-semibold ${
                                deal.status === "Closed Won"
                                  ? "text-green-600"
                                  : deal.status === "Closed Lost"
                                  ? "text-red-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              ${deal.value.toLocaleString()}
                            </p>
                          </li>
                        ))}
                      </ul>

                      {/* Pagination Controls */}
                      <div className="flex justify-between items-center mt-4">
                        <button
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>

                    {/* <div className="flex flex-col md:flex-row gap-6 mt-6">
                      <div className="w-full md:w-1/2 h-64 flex justify-center">
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={pieData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-col justify-center gap-2 text-sm">
                        {pieData.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span
                              className="inline-block w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></span>
                            <span className="font-medium text-gray-700">
                              {entry.name}: ${entry.value.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div> */}
                  </>
                )}
              </>
            )}

            {tab === "clients" && (
              <ul className="text-gray-700 space-y-4">
                {user.clients.length === 0 ? (
                  <p className="text-center text-gray-400 italic">No clients available</p>
                ) : (
                  user.clients.map((client, i) => (
                    <li key={i} className="border rounded p-4 bg-gray-50 shadow-sm">
                      <div className="font-semibold text-gray-800">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.industry}</div>
                      <a href={`mailto:${client.contact}`} className="text-blue-600 text-sm underline">
                        {client.contact}
                      </a>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
