import { FormContext } from "../../context/form-context";
import { Pie, Bar } from "react-chartjs-2";
import { useParams } from "react-router-dom";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import React, { useState, useContext, useEffect } from "react";
import { getFormByUrl } from "../../services/api/formApi";
import "./stats.css";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

// Register required components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  BarElement,
  ChartDataLabels
);

export const Stats = () => {
  const [form, setForm] = useState(null);
  const { "*": statPath } = useParams();
  const { token, userId } = useContext(FormContext);
  const [pageNotAvailable, setPageNotAvailable] = useState(false);

  const getForm = async () => {
    console.log("Stat Path:", statPath);
    if (statPath === undefined) {
      setPageNotAvailable(true);
      return;
    }
    try {
      const response = await getFormByUrl(token, statPath);
      if (userId !== response.data.userId) setPageNotAvailable(true);
      if (response.success) {
        setForm(response.data);
      }
      console.log("Form:", response.data);
    } catch (error) {
      console.error("Error:", error);
      setPageNotAvailable(true);
    }
  };

  useEffect(() => {
    getForm();
  }, [statPath]);

  const chartColors = [
    "#FF6384", "#36A2EB", "#4BC0C0", "#FFCE56", "#9966FF", "#FF9F40", "#66FF66",
    "#FF6666", "#33FFCC", "#FF33CC", "#3399FF", "#CCFF33", "#FF9933", "#33FF99",
    "#99FF33", "#33CCFF", "#FF3366", "#66CCFF", "#FF33FF", "#FFFF33", "#FF6633",
    "#33FF66", "#33FFFF", "#CC33FF", "#FF33CC", "#33FF33", "#6633FF", "#FFCC33",
    "#33FFCC", "#FF9933"
  ];

  const generatePieChartData = (field) => {
    const labels = field.options.map((option) => option.optionValue);
    const data = field.options.map((option) => option.responseCount);
    const total = data.reduce((sum, count) => sum + count, 0);

    return {
      labels,
      datasets: [
        {
          label: `Responses for "${field.label}"`,
          data,
          backgroundColor: chartColors.slice(0, labels.length),
          hoverBackgroundColor: chartColors.slice(0, labels.length),
        },
      ],
    };
  };

  const generateBarChartData = (field) => {
    const labels = field.options.map((option) => option.optionValue);
    const data = field.options.map((option) => option.responseCount);

    return {
      labels,
      datasets: [
        {
          label: "Response Count",
          data,
          backgroundColor: chartColors.slice(0, labels.length),
          borderColor: chartColors.slice(0, labels.length),
          borderWidth: 1,
        },
      ],
    };
  };

  // Chart options for Pie chart
  const pieChartOptions = (label) => ({
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: label,
      },
      datalabels: {
        display: true,
        color: "white",
        font: {
          weight: "bold",
          size: 14,
        },
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
          const percentage = ((value / total) * 100).toFixed(0);
          return `${percentage}%`;
        },
        anchor: "center",
        align: "center",
      },
    },
  });

  // Chart options for Bar chart
  const barChartOptions = (label) => ({
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: label,
      },
      datalabels: {
        display: true,
        color: "white",
        font: {
          weight: "bold",
          size: 14,
        },
        formatter: (value) => value,
        anchor: "center",
        align: "center",
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value) {
            return Number.isInteger(value) ? value : "";
          },
          stepSize: 1,
        },
      },
    },
  });

  if (pageNotAvailable) {
    return (
      <div className="error-container">
        <h2>Page is not available</h2>
      </div>
    );
  }

  if (!form) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {pageNotAvailable ? (
        <div>

        </div>
      ) : (
        <div className="stats-container">
          <h2>Statistics of {form.title}</h2>
          {form.formFields.map((field) => (
            <div key={field.id} className="chart-row">
              <div className="chart-container">
                <h3 style={{ color: "blue" }}>{field.label}</h3>
                {field.options.length > 0 ? (
                  <div className="chart-wrapper">
                    <Pie
                      data={generatePieChartData(field)}
                      options={pieChartOptions(field.label)}
                    />
                    <Bar
                      data={generateBarChartData(field)}
                      options={barChartOptions(field.label)}
                    />
                  </div>
                ) : (
                  <p>No options available for this question.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

};
