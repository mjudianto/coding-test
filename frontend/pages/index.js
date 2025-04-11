import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import WorldMapCard from "../components/WorldMapCard";
import { Player } from "@lottiefiles/react-lottie-player";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [regionIndex, setRegionIndex] = useState(0);
  const [regionLoading, setRegionLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [lottieError, setLottieError] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      setRegionLoading(true);
      setError("");

      try {
        const res = await fetch("http://localhost:8000/api/data");
        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();
        setTimeout(() => {
          setUsers(data.salesReps || []);
          setRegionLoading(false);
        }, 1000);
      } catch (err) {
        setError("Failed to load sales reps. Please check your connection or try again later.");
        setRegionLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAskQuestion = async () => {
    try {
      setAiLoading(true);
      // Send a POST request to the FastAPI endpoint with the question
      const response = await fetch("http://localhost:8000/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
  
      // Check if the response is OK, otherwise throw an error
      if (!response.ok) throw new Error("AI request failed");
  
      // Parse the response body as JSON
      const data = await response.json();

      console.log(data);  // This accesses the text of the first part from the first candidate
  
      // Assuming the response has an "answer" key
      if (data && data.answer) {
        setAnswer(data.answer);
      } else {
        setAnswer("No answer received from AI.");
      }
    } catch (err) {
      // Handle any errors that occur during the fetch process
      setAnswer("Oops! Something went wrong while getting the answer. Please try again later.");
    } finally {
      setAiLoading(false);
    }
  };
  

  const handleRegionSelect = (region) => {
    setRegionLoading(true);
    setTimeout(() => {
      setSelectedRegion(region);
      setRegionIndex(0);
      setRegionLoading(false);
    }, 1000);
  };

  const handleUserClick = (id) => {
    const encodedId = btoa(String(id)); // Encode the ID in base64
    router.push(`/user/${encodedId}`);
  };  

  return (
    <div className="p-8 font-sans bg-gray-100">
      <nav className="bg-blue-600 mb-8 px-6 py-4 border border-gray-200 shadow-sm rounded-lg flex items-center justify-between">
        {/* Left - Brand with subtext */}
        <div>
          <div className="text-xl font-bold text-white tracking-tight">FastAPI Dashboard</div>
          <div className="text-xs text-white mt-1">Powered by Next.js + FastAPI</div>
        </div>

        {/* Right - Navigation Menu */}
        <div className="space-x-6 text-sm font-medium text-white">
          <a href="/clients" className="hover:text-white transition">
            Client List
          </a>
          <a href="/deals" className="hover:text-white transition">
            Deals List
          </a>
        </div>
      </nav>



      {error && (
        <div className="mb-6 text-red-600 bg-red-100 border border-red-300 p-3 rounded">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        <div className="flex-1">
          <WorldMapCard
            users={users}
            onRegionSelect={handleRegionSelect}
            regionToZoom={selectedRegion}
          />
        </div>

        <div className="flex-1 border border-gray-200 rounded-lg shadow bg-white overflow-y-auto p-4 h-[520px]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by name, role, or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-2/3 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            <div className="relative w-full sm:w-1/3">
              <select
                value={selectedRegion || "All"}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedRegion(value === "All" ? null : value);
                  setRegionIndex(0);
                }}
                className="w-full appearance-none px-4 pr-10 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="All">All Regions</option>
                {[...new Set(users.map((u) => u.region))].map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                ▼
              </div>
            </div>
          </div>

          {regionLoading ? (
            <div className="flex justify-center items-center h-full">
              <Player
                autoplay
                loop
                src="/region-loading.json"
                style={{ height: 200, width: 200 }}
                onEvent={(e) => {
                  if (e === "error") {
                    setLottieError(true);
                  }
                }}
              />
              {lottieError && (
                <p className="text-sm text-red-500 mt-2">Loading animation failed to load.</p>
              )}
            </div>
          ) : (() => {
            const filteredUsers = users
              .filter((user) => {
                const matchText = `${user.name} ${user.role} ${user.clients.map(c => c.name).join(" ")}`.toLowerCase();
                return matchText.includes(searchTerm.toLowerCase());
              })
              .filter((user) => !selectedRegion || user.region === selectedRegion);

            if (filteredUsers.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center h-full">
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
                    <p className="text-sm text-red-500 mt-2">Animation failed to load.</p>
                  )}
                </div>
              );
            }

            if (!selectedRegion) {
              const grouped = filteredUsers.reduce((acc, user) => {
                acc[user.region] = acc[user.region] || [];
                acc[user.region].push(user);
                return acc;
              }, {});

              return Object.entries(grouped).map(([region, regionUsers]) => (
                <div key={region} className="mb-10">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">{region}</h2>
                  <div className="space-y-6">
                    {regionUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserClick(user.id)}
                        className="cursor-pointer bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="text-base font-semibold text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.role}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          {user.clients.map((client, i) => (
                            <div key={i} className="relative group">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-sm">
                                {client.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition z-10">
                                {client.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            }

            const regionUsers = filteredUsers;
            const user = regionUsers[regionIndex];

            return (
              <div className="space-y-4 transition-all duration-300 ease-in-out">
                {/* <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">{selectedRegion}</h2>
                </div> */}

                <div
                  onClick={() => handleUserClick(user.id)}
                  className="cursor-pointer"
                >
                  <p className="font-medium">Name</p>
                  <p className="text-gray-700">{user.name}</p>
                  <br></br>

                  <p className="font-medium">Role</p>
                  <p className="text-gray-700">{user.role}</p>
                  <br></br>

                  <p className="font-medium">Skills</p>
                  <ul className="list-disc list-inside text-gray-700">
                    {user.skills.map((skill, i) => (
                      <li key={i}>{skill}</li>
                    ))}
                  </ul>
                  <br></br>

                  <p className="font-medium">Clients</p>
                  <div className="flex flex-wrap gap-2">
                    {user.clients.map((client, i) => (
                      <span
                        key={i}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold"
                      >
                        {client.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button
                    onClick={() => setRegionIndex((i) => Math.max(i - 1, 0))}
                    disabled={regionIndex === 0}
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() =>
                      setRegionIndex((i) =>
                        Math.min(i + 1, regionUsers.length - 1)
                      )
                    }
                    disabled={regionIndex === regionUsers.length - 1}
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>

                <div className="flex justify-center gap-2 mt-3">
                  {regionUsers.map((_, i) => (
                    <span
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i === regionIndex ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* AI Question Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Ask a Question (AI Endpoint)</h2>
        <div className="flex items-center mb-4">
          <input
            type="text"
            placeholder="Enter your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="p-2 w-3/4 mr-4 border border-gray-300 rounded"
          />
          <button
            onClick={handleAskQuestion}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Ask
          </button>
        </div>

        {/* Show loading message when aiLoading is true */}
        {aiLoading ? (
          <div className="mt-4 text-gray-600 text-lg font-medium">
            <span className="animate-pulse">Loading...</span>
          </div>
        ) : (
          // Show the AI response or an error message
          answer.startsWith("Oops!") ? (
            <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 rounded shadow-md text-red-700">
              <strong>Error:</strong> {answer}
            </div>
          ) : (
            answer && (
              <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded shadow-md text-blue-800">
                <strong className="text-lg font-semibold">AI Response:</strong>
                <div className="mt-2 whitespace-pre-line">
                  {/* Allow the text to break at newlines and spaces */}
                  {answer}
                </div>
              </div>
            )
          )
        )}


      </section>

    </div>
  );
}
