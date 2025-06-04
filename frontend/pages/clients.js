import { useEffect, useState } from "react";
import Link from "next/link";
import { Player } from "@lottiefiles/react-lottie-player";
import Header from '../components/PageHeader';


export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [lottieError, setLottieError] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/sales/clients")
      .then((res) => res.json())
      .then((data) => setClients(data.data.clients)) 
      .catch((err) => setError("Failed to load data. Please check your connection or try again later.")); // Fixed the typo here
  }, []);
  

  const industries = ["All", ...Array.from(new Set(clients.map(c => c.industry)))];

  const filteredClients =
    selectedIndustry === "All"
      ? clients
      : clients.filter(client => client.industry === selectedIndustry);

  return (
    <div className="p-8 font-sans">
      {/* Header */}
      <Header title={"Our Clients"}></Header>

      {error && (
        <div className="mb-6 text-red-600 bg-red-100 border border-red-300 p-3 rounded">
          {error}
        </div>
      )}

      {/* Pills - Scrollable */}
      <div className="overflow-x-auto whitespace-nowrap mb-8 -mx-2 px-2 scrollbar-hide">
        <div className="inline-flex gap-3">
          {industries.map((industry, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndustry(industry)}
              className={`px-4 py-1 whitespace-nowrap rounded-full text-sm font-medium transition border ${
                selectedIndustry === industry
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {industry}
            </button>
          ))}
        </div>
      </div>


      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredClients.map((client, i) => (
            <div
              key={i}
              className="bg-gray-100 hover:bg-gray-200 transition p-4 rounded flex flex-col items-center justify-center text-center shadow-sm"
            >
              <div className="text-lg font-bold text-gray-800 mb-2">{client.name}</div>
              <p className="text-sm text-gray-500 mb-1">{client.industry}</p>
              <a
                href={`mailto:${client.contact}`}
                className="text-sm text-blue-600 underline"
              >
                {client.contact}
              </a>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
