import Plotly from "plotly.js-dist";
import createPlotlyComponent from "react-plotly.js/factory.js";

const Plot = createPlotlyComponent.default
  ? createPlotlyComponent.default(Plotly)
  : createPlotlyComponent(Plotly);

// Interactive chart that shows historical data and the forecast
function ForecastChart({ data }) {
  if (!data) return null;

  // Historical data trace (light green to match the text)
  const historicalTrace = {
    x: data.dates,
    y: data.historical,
    type: "scatter",
    mode: "lines",
    name: "Historical",
    line: { color: "#acdfb1" },
  };

  // Forecast trace (gold accent color)
  const forecastTrace = {
    x: data.forecast_dates,
    y: data.forecast,
    type: "scatter",
    mode: "lines",
    name: "Forecast",
    line: { color: "#c8a415", dash: "dash" },
  };

  const traces = [historicalTrace, forecastTrace];

  // If Prophet returned confidence intervals, show them as a shaded area
  if (data.lower_ci && data.upper_ci) {
    const ciTrace = {
      x: [...data.forecast_dates, ...[...data.forecast_dates].reverse()],
      y: [...data.upper_ci, ...[...data.lower_ci].reverse()],
      fill: "toself",
      fillcolor: "rgba(200, 164, 21, 0.15)",
      line: { color: "transparent" },
      type: "scatter",
      name: "Confidence Interval",
    };
    traces.push(ciTrace);
  }

  return (
    <Plot
      data={traces}
      layout={{
        title: { text: "Consumption Forecast", font: { color: "#acdfb1" } },
        xaxis: {
          title: { text: "Date", font: { color: "#acdfb1" } },
          tickfont: { color: "#acdfb1" },
          gridcolor: "#3a5c48",
          linecolor: "#3a5c48",
          zerolinecolor: "#3a5c48",
        },
        yaxis: {
          title: { text: "Consumption", font: { color: "#acdfb1" } },
          tickfont: { color: "#acdfb1" },
          gridcolor: "#3a5c48",
          linecolor: "#3a5c48",
          zerolinecolor: "#3a5c48",
        },
        paper_bgcolor: "#1e3128",
        plot_bgcolor: "#1e3128",
        legend: { font: { color: "#acdfb1" } },
        hovermode: "x unified",
        hoverlabel: {
          bgcolor: "#263f33",
          font: { color: "#acdfb1" },
          bordercolor: "#3a5c48",
        },
      }}
      config={{ responsive: true }}
      style={{ width: "100%", height: "500px" }}
    />
  );
}

export default ForecastChart;
