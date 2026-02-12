import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import "./styles.css";

import {
  DndContext,
  closestCenter
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

/* ================= SORTABLE ITEM ================= */

function SortableItem({ id, task }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-item"
    >
      {task}
    </li>
  );
}

/* ================= HOME PAGE ================= */

function HomePage() {
  const [formData, setFormData] = useState({
    goal: "",
    users: "",
    constraints: "",
    template: "web"
  });

  const [result, setResult] = useState(null);
  const [editableTasks, setEditableTasks] = useState(null);
  const [recentSpecs, setRecentSpecs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecent();
  }, []);

  const fetchRecent = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/specs/recent"
      );
      setRecentSpecs(response.data);
    } catch (error) {
      console.error("Failed to fetch recent specs");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.goal || !formData.users) {
      alert("Goal and Users are required");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/specs/generate",
        formData
      );

      setResult(response.data);
      setEditableTasks(response.data.engineeringTasks);
      fetchRecent();
    } catch (error) {
      alert("Generation failed");
    }

    setLoading(false);
  };

  const handleDragEnd = (event, category) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = editableTasks[category].indexOf(active.id);
      const newIndex = editableTasks[category].indexOf(over.id);

      const updated = arrayMove(
        editableTasks[category],
        oldIndex,
        newIndex
      );

      setEditableTasks({
        ...editableTasks,
        [category]: updated
      });
    }
  };

  const generateMarkdown = () => {
    if (!result) return "";

    let md = `# Feature Specification\n\n`;

    md += `## User Stories\n`;
    result.userStories.forEach((story) => {
      md += `- ${story}\n`;
    });

    md += `\n## Engineering Tasks\n`;
    Object.entries(editableTasks || {}).forEach(
      ([category, tasks]) => {
        md += `\n### ${category}\n`;
        tasks.forEach((task) => {
          md += `- ${task}\n`;
        });
      }
    );

    md += `\n## Risks\n`;
    result.risks.forEach((risk) => {
      md += `- ${risk}\n`;
    });

    return md;
  };

  const downloadMarkdown = () => {
    const markdown = generateMarkdown();
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "specification.md";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="main-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <h3>Recent Specs</h3>
        <ul>
          {recentSpecs.map((spec) => (
            <li
              key={spec.id}
              className="sidebar-item"
              onClick={() => {
                setResult(spec.output);
                setEditableTasks(spec.output.engineeringTasks);
              }}
            >
              {spec.goal}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        <h1>Tasks Generator</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Goal:</label>
            <textarea
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Users:</label>
            <input
              name="users"
              value={formData.users}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Constraints:</label>
            <input
              name="constraints"
              value={formData.constraints}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Template:</label>
            <select
              name="template"
              value={formData.template}
              onChange={handleChange}
            >
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="internal">Internal Tool</option>
            </select>
          </div>

          <button type="submit">
            {loading ? "Generating..." : "Generate"}
          </button>
        </form>

        {result && (
          <div className="card">
            <h2>User Stories</h2>
            <ul>
              {result.userStories.map((story, index) => (
                <li key={index}>{story}</li>
              ))}
            </ul>

            <h2>Engineering Tasks (Drag to reorder)</h2>

            {editableTasks &&
              Object.entries(editableTasks).map(
                ([category, tasks]) => (
                  <div key={category}>
                    <h3>{category}</h3>

                    <DndContext
                      collisionDetection={closestCenter}
                      onDragEnd={(event) =>
                        handleDragEnd(event, category)
                      }
                    >
                      <SortableContext
                        items={tasks}
                        strategy={
                          verticalListSortingStrategy
                        }
                      >
                        <ul className="task-list">
                          {tasks.map((task) => (
                            <SortableItem
                              key={task}
                              id={task}
                              task={task}
                            />
                          ))}
                        </ul>
                      </SortableContext>
                    </DndContext>
                  </div>
                )
              )}

            <h2>Risks</h2>
            <ul>
              {result.risks.map((risk, index) => (
                <li key={index}>{risk}</li>
              ))}
            </ul>

            <button onClick={downloadMarkdown}>
              Download as Markdown
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= STATUS PAGE ================= */

function StatusPage() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/status")
      .then((res) => setStatus(res.data))
      .catch(() =>
        setStatus({
          backend: "error",
          database: "error",
          llm: "error"
        })
      );
  }, []);

  if (!status) return <p>Checking system status...</p>;

  return (
    <div className="card">
      <h2>System Status</h2>
      <p>Backend: {status.backend}</p>
      <p>Database: {status.database}</p>
      <p>LLM: {status.llm}</p>
    </div>
  );
}

/* ================= MAIN APP ================= */

function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div>
          <Link to="/">Home</Link>
          <Link to="/status">Status</Link>
        </div>
        <button onClick={toggleTheme}>
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/status" element={<StatusPage />} />
      </Routes>
    </div>
  );
}

export default App;
