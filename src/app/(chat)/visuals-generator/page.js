"use client";

import React, { useRef, useState } from "react";
import mermaid from "mermaid";
import { toPng } from "html-to-image";
import { Bar, Pie, Line } from "react-chartjs-2";

import jsPDF from "jspdf";

import { ChartColumn, BarChart, ChartBar } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { parse } from "mathjs";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
);

const options = [
  {
    key: "flowchart",
    label: "Flowchart",
    icon: <ChartColumn className="w-4 h-4 mr-2" />,
  },
  {
    key: "charts",
    label: "Charts",
    icon: <BarChart className="w-4 h-4 mr-2" />,
  },
  {
    key: "graphs",
    label: "Graphs",
    icon: <ChartBar className="w-4 h-4 mr-2" />,
  },
];

export default function VisualGenerator() {
  const mermaidRef = useRef(null);

  const exportAsPng = async () => {
    if (mermaidRef.current) {
      const dataUrl = await toPng(mermaidRef.current,{
        pixelRatio: 3,
      backgroundColor: "#ffffff",
      cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = "visual.png";
      link.href = dataUrl;
      link.click();
    }
  };

  const exportAsPdf = async () => {
    if (mermaidRef.current) {
      const dataUrl = await toPng(mermaidRef.current,{
        pixelRatio: 3, 
      backgroundColor: "#ffffff", 
      cacheBust: true,
      });
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("visual.pdf");
    }
  };

  const [funcExpression, setFuncExpression] = useState("");
  const [xMin, setXMin] = useState("-10");
  const [xMax, setXMax] = useState("10");
  const [xStep, setXStep] = useState("0.1");



  const [mode, setMode] = useState("flowchart");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [chartTitle, setChartTitle] = useState("");
  const [legendLabel, setLegendLabel] = useState("");
  const [chartType, setChartType] = useState<"bar" | "pie" | "line">("bar");

  const [dataPoints, setDataPoints] = useState([{ label: "", value: "" }]);

  const extractMermaidCode = (text) => {
    const match = text.match(/```mermaid([\s\S]*?)```/);
    return match ? match[1].trim() : text.trim();
  };

  const generate = async () => {
    if (!prompt.trim() && mode !== "charts" && mode !== "graphs") {
      toast.error("Please enter a prompt.");
      return;
    }
    if (mode === "graphs") {
      if (!funcExpression.trim()) {
        toast.error("Please enter a function expression.");
        return;
      }
      if (
        isNaN(Number(xMin)) ||
        isNaN(Number(xMax)) ||
        isNaN(Number(xStep)) ||
        Number(xMin) >= Number(xMax) ||
        Number(xStep) <= 0
      ) {
        toast.error("Please enter valid numeric ranges for x.");
        return;
      }
    }

    setLoading(true);
    setOutput("");
    setGraphData(null);

    try {
      if (mode === "charts") {
        const labels = dataPoints.map((p) => p.label);
        const values = dataPoints.map((p) => Number(p.value));
        const dataset = {
          label: legendLabel,
          data: values,
          backgroundColor: ["#60a5fa", "#f472b6", "#34d399", "#facc15"],
          borderColor: "#3b82f6",
          borderWidth: 1,
        };

        setGraphData({
          labels,
          datasets: [dataset],
          options: {
            plugins: {
              title: {
                display: !!chartTitle,
                text: chartTitle,
                font: { size: 18 },
              },
              legend: {
                display: true,
                labels: {
                  color: "#000",
                },
              },
            },
          },
        });
      } 
      
      else if (mode === "flowchart") {
        const res = await axios.post("/api/visual-generator", {
          mode,
          prompt,
        });
        setOutput(extractMermaidCode(res.data.mermaid));
        setTimeout(() => mermaid.init(undefined, ".mermaid"), 100);
      }
      else if (mode === "graphs") {
        // Generate x and y points for function graph
        const xStart = Number(xMin);
        const xEnd = Number(xMax);
        const step = Number(xStep);

        const xValues = [];
        const yValues = [];

        let node;
        try {
          node = parse(funcExpression);
        } catch (err) {
          toast.error("Invalid function expression");
          setLoading(false);
          return;
        }

        for (let x = xStart; x <= xEnd; x += step) {
          xValues.push(x);
          try {
            // const y = node.evaluate({ x });
            const y = node.evaluate({ x: (x * Math.PI) / 180 });

            if (typeof y === "number" && isFinite(y)) {
              yValues.push(y);
            } else {
              yValues.push(NaN);
            }
          } catch {
            yValues.push(NaN);
          }
        }

        setGraphData({
          labels: xValues.map((v) => v.toFixed(2)),
          datasets: [
            {
              label: `y = ${funcExpression}`,
              data: yValues,
              fill: false,
              borderColor: "rgba(37, 99, 235, 1)", // blue
              backgroundColor: "rgba(37, 99, 235, 0.5)",
              pointRadius: 0,
              borderWidth: 2,
              tension: 0.3, // smooth curves
            },
          ],
          options: {
            scales: {
              x: {
                title: {
                  display: true,
                  text: "x",
                },
              },
              y: {
                title: {
                  display: true,
                  text: "y",
                },
              },
            },
            plugins: {
              title: {
                display: true,
                text: `Graph of y = ${funcExpression}`,
                font: { size: 18 },
              },
              legend: {
                display: true,
              },
            },
            elements: {
              line: {
                borderJoinStyle: "round",
              },
            },
          },
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const updateDataPoint = (index, field, value) => {
    const updated = [...dataPoints];
    updated[index][field] = value;
    setDataPoints(updated);
  };

  const addDataPoint = () => {
    setDataPoints([...dataPoints, { label: "", value: "" }]);
  };

  return (
    <div className="flex w-full min-h-screen px-6 py-10 gap-6">
      {/* Sidebar */}
      <div className="w-52 rounded-2xl border border-accent/20 shadow-2xl p-4">
        <h3 className="text-lg font-semibold mb-4">Select Type</h3>
        <ul className="space-y-2">
          {options.map((opt) => (
            <li key={opt.key}>
              <button
                className={`w-full flex items-center px-3 py-2 rounded-lg border hover:bg-accent/10 ${
                  mode === opt.key
                    ? "border-accent text-accent font-bold"
                    : "border-muted text-muted-foreground"
                }`}
                onClick={() => setMode(opt.key)}
              >
                {opt.icon}
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main */}
      <div className="flex-1 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Visual Generator</h1>

        {mode === "charts" && (
          <>
            <div className="mt-4 border shadow-lg p-5 space-y-2">
              <h4 className="text-sm font-semibold">Select Chart Type</h4>
              {["bar", "pie", "line"].map((type) => (
                <button
                  key={type}
                  className={`w-full max-w-[200px] shadow-lg border flex text-left px-3 py-1 rounded-lg ${
                    chartType === type
                      ? "bg-accent/10 font-semibold text-accent"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setChartType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)} Chart
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Chart Title"
                  className="w-full p-2 border border-muted rounded-md"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Legend Label"
                  className="w-full p-2 border border-muted rounded-md"
                  value={legendLabel}
                  onChange={(e) => setLegendLabel(e.target.value)}
                />
              </div>

              {dataPoints.map((point, idx) => (
                <div key={idx} className="flex gap-4">
                  <input
                    placeholder="Label"
                    className="flex-1 p-2 border border-muted rounded-md"
                    value={point.label}
                    onChange={(e) =>
                      updateDataPoint(idx, "label", e.target.value)
                    }
                  />
                  <input
                    placeholder="Value"
                    type="number"
                    className="flex-1 p-2 border border-muted rounded-md"
                    value={point.value}
                    onChange={(e) =>
                      updateDataPoint(idx, "value", e.target.value)
                    }
                  />
                </div>
              ))}
              <button
                onClick={addDataPoint}
                className="text-sm underline text-accent hover:text-accent/80"
              >
                + Add Data Point
              </button>
            </div>
          </>
        )}

        {mode === "flowchart" && (
          <textarea
            rows={3}
            className="w-full p-3 border border-accent/40 rounded-xl shadow-sm resize-none"
            placeholder={`Enter prompt for ${mode} generation...`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        )}
        {mode === "graphs" && (
      <div className="space-y-4">
        <label className="block font-semibold">Function (in x):</label>
        <input
          type="text"
          value={funcExpression}
          onChange={(e) => setFuncExpression(e.target.value)}
          className="w-full p-2 border border-muted rounded-md"
          placeholder="e.g. x^2 - 3*x + 2 and for trignometric functions use x in degrees"
        />
        <div className="flex gap-4">
          <div>
            <label className="block font-semibold">x Min</label>
            <input
              type="number"
              value={xMin}
              onChange={(e) => setXMin(e.target.value)}
              className="p-2 border border-muted rounded-md"
            />
          </div>
          <div>
            <label className="block font-semibold">x Max</label>
            <input
              type="number"
              value={xMax}
              onChange={(e) => setXMax(e.target.value)}
              className="p-2 border border-muted rounded-md"
            />
          </div>
          <div>
            <label className="block font-semibold">x Step</label>
            <input
              type="number"
              value={xStep}
              onChange={(e) => setXStep(e.target.value)}
              className="p-2 border border-muted rounded-md"
            />
          </div>
        </div>
      </div>
    )}

<div className="flex  mb-2 gap-4">
        <button
          onClick={generate}
          disabled={loading}
          className="mt-6 bg-accent text-white px-6 py-2 rounded-lg shadow-md hover:bg-accent/90 transition"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
                <button
                  onClick={exportAsPng}
                  className="mt-6 bg-accent text-white px-6 py-2 rounded-lg shadow-md hover:bg-accent/90 transition"
                >
                  Export PNG
                </button>
                <button
                  onClick={exportAsPdf}
                  className="mt-6 bg-accent text-white px-6 py-2 rounded-lg shadow-md hover:bg-accent/90 transition"
                >
                  Export PDF
                </button>
              </div>

        <div className="mt-8 border border-dashed rounded-xl p-6 shadow-md min-h-[200px] bg-white text-black">
          <h2 className="text-lg font-semibold mb-4">Output</h2>

          {mode === "flowchart" && output && (
            <>
              

              <div
                ref={mermaidRef}
                className="mermaid text-sm bg-white p-4 rounded-md shadow-inner"
              >
                {output}
              </div>
            </>
          )}

          {mode === "charts" && graphData && chartType === "bar" && (
            <>
              <div className="flex justify-end mb-2 gap-4"
              ref={mermaidRef}
              >
                
          <Bar data={graphData} options={graphData.options} />
          </div>
        </>
      )}

      {mode === "charts" && graphData && chartType === "pie" && (
        <>
          <div className="flex justify-end mb-2 gap-4"
          ref={mermaidRef}
          >
            
          <Pie data={graphData} options={graphData.options} />
          </div>
        </>
      )}

      {mode === "charts" && graphData && chartType === "line" && (
        <>
          <div className="flex justify-end mb-2 gap-4"
          ref={mermaidRef}  
          >
            
          <Line data={graphData} options={graphData.options} />
          </div>
        </>
      )}
      {mode === "graphs" && graphData && (
        <div className="flex justify-end mb-2 gap-4"
          ref={mermaidRef}  
          >

        <Line data={graphData} options={graphData.options} />
        </div>
      )}
    </div>
  </div>
</div>
  );
}