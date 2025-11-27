import React, { useEffect, useState } from "react";
import bgImage from "../assets/upload8.svg";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AlumniSection() {
  const [alumniData, setAlumniData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // 1️⃣ Fetch Alumni from Backend
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/alumni`)
      .then((res) => {
        setAlumniData(res.data);
        setLoaded(true);
      })
      .catch((err) => console.error("Error fetching alumni data:", err));
  }, []);

  // 2️⃣ Fetch LinkedIn Images Only Once After Load
  useEffect(() => {
    if (!loaded) return; // prevent infinite loop

    async function fetchLinkedInImages() {
      const updated = await Promise.all(
        alumniData.map(async (alum) => {
          try {
            // Skip if already has a real image
            if (alum.image && !alum.image.includes("linkedin")) return alum;

            if (alum.linkedin) {
              const res = await axios.get(
                `https://api.microlink.io?url=${alum.linkedin}`
              );
              const linkedImg = res.data?.data?.image?.url;

              if (linkedImg && !linkedImg.includes("logo")) {
                return { ...alum, image: linkedImg };
              }
            }
            return alum;
          } catch (e) {
            console.log("Failed to fetch LinkedIn image for:", alum.name);
            return alum;
          }
        })
      );

      setAlumniData(updated);
    }

    fetchLinkedInImages();
  }, [loaded]); // runs only once when alumni load

  // 3️⃣ Search
  const filteredAlumni = alumniData.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section
      id="alumni"
      className="relative py-20 px-6 min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="relative max-w-7xl mx-auto text-center z-10">
        <h2 className="text-5xl font-extrabold mb-6">
          Our <span className="text-teal-400">Alumni</span>
        </h2>
        <p className="text-lg max-w-3xl mx-auto mb-10 text-gray-200">
          Search and explore the journeys of our exceptional alumni who are now
          excelling in top tech companies around the world.
        </p>

        {/* Search */}
        <div className="mb-12 flex justify-center">
          <input
            type="text"
            placeholder="Search alumni by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-1/2 px-5 py-3 rounded-xl bg-white/10 border border-teal-400/40 
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>

        {/* Grid */}
        {filteredAlumni.length === 0 ? (
          <p className="text-gray-300">No alumni found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {filteredAlumni.map((alum) => (
              <div
                key={alum._id}
                onClick={() => navigate(`/alumni/${alum._id}`)}
                className="cursor-pointer p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl 
                           hover:shadow-2xl transition-all transform hover:-translate-y-2 text-center"
              >
                <img
                  src={
                    alum.image ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt={alum.name}
                  className="w-28 h-28 mx-auto rounded-full object-cover mb-4 border-4 border-teal-200"
                />

                <h3 className="text-xl font-bold text-teal-400">{alum.name}</h3>
                <p className="text-gray-300">{alum.role}</p>
                <p className="text-sm text-gray-400 mb-2">
                  {alum.company} • Batch {alum.batch}
                </p>

                {alum.linkedin && (
                  <a
                    href={alum.linkedin}
                    onClick={(e) => e.stopPropagation()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-teal-300 hover:text-teal-500 font-medium mt-2"
                  >
                    🔗 LinkedIn
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default AlumniSection;
