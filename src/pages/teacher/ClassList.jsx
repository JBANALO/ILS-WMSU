import { useState } from "react";
import { ViewColumnsIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export default function ClassList() {
  // Mock class data (replace later with API or shared state)
  const mockClasses = [
    { id: 1, grade: "Grade 6", section: "A" },
    { id: 2, grade: "Grade 6", section: "B" },
    { id: 3, grade: "Grade 5", section: "C" },
  ];

  // Mock student data (normally fetched per class)
  const mockStudents = {
    "Grade 6-A": [
      { lrn: "12345", name: "Alice Santos", generalAverage: 92 },
      { lrn: "12346", name: "Ben Cruz", generalAverage: 89 },
      { lrn: "12347", name: "Cara Dela Cruz", generalAverage: 95 },
    ],
    "Grade 6-B": [
      { lrn: "12348", name: "Daniel Reyes", generalAverage: 84 },
      { lrn: "12349", name: "Ella Lim", generalAverage: 90 },
    ],
  };

  const [query, setQuery] = useState("");
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);

  const handleSearch = () => {
    const results = mockClasses.filter((c) =>
      `${c.grade} ${c.section}`.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredClasses(results);
    setSelectedClass(null);
    setStudents([]);
  };

  const handleSelectClass = (grade, section) => {
    const key = `${grade}-${section}`;
    const classStudents = mockStudents[key] || [];

    // Sort by general average descending
    const sorted = [...classStudents].sort(
      (a, b) => b.generalAverage - a.generalAverage
    );

    // Add rank automatically
    const ranked = sorted.map((s, i) => ({
      ...s,
      rank: i + 1,
      grade,
      section,
    }));

    setSelectedClass({ grade, section });
    setStudents(ranked);
  };

  // 🏆 Color-coded ranks
  const getRankColor = (rank) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-700 font-semibold";
    if (rank === 2) return "bg-gray-100 text-gray-700 font-semibold";
    if (rank === 3) return "bg-orange-100 text-orange-700 font-semibold";
    return "";
  };

  return (
    <div className="space-y-6"> 
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-300 border-b-red-800 border-b-4 flex items-center justify-between print:hidden">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ViewColumnsIcon className="w-10 h-10 text-red-800" />
          Class List
        </h2>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-2 flex items-center gap-2 max-w-lg">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search by Grade or Section (e.g., Grade 6 A)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 border-none outline-none text-gray-700 placeholder-gray-400"
        />
        <button
          onClick={handleSearch}
          className="bg-red-800 text-white px-3 py-1 rounded-md hover:bg-red-900 transition"
        >
          Search
        </button>
      </div>

      {/* Search Results */}
      {filteredClasses.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <h2 className="font-semibold text-gray-700 mb-2">Search Results:</h2>
          <div className="space-y-2">
            {filteredClasses.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectClass(c.grade, c.section)}
                className="block text-left w-full border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition"
              >
                {c.grade} - {c.section}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Class Table */}
      {selectedClass && (
        <div className="bg-white rounded-lg shadow-md border border-gray-300 overflow-hidden">
          <div className="bg-red-800 text-white px-6 py-3 text-lg font-semibold">
            {selectedClass.grade} - {selectedClass.section}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold border-b">
                <tr>
                  <th className="px-3 py-2 border">Rank</th>
                  <th className="px-3 py-2 border">LRN</th>
                  <th className="px-3 py-2 border text-left">Name</th>
                  <th className="px-3 py-2 border">Grade</th>
                  <th className="px-3 py-2 border">Section</th>
                  <th className="px-3 py-2 border">General Average</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((s) => (
                    <tr key={s.lrn} className={`${getRankColor(s.rank)} hover:bg-gray-50`}>
                      <td className="border px-3 py-2">{s.rank}</td>
                      <td className="border px-3 py-2">{s.lrn}</td>
                      <td className="border px-3 py-2 text-left">{s.name}</td>
                      <td className="border px-3 py-2">{s.grade}</td>
                      <td className="border px-3 py-2">{s.section}</td>
                      <td className="border px-3 py-2 font-semibold">
                        {s.generalAverage}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-4 text-gray-500 italic">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
