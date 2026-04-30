// Shows a preview table of the uploaded CSV data
function DataPreview({ rows }) {
  if (!rows || rows.length === 0) return null;

  // Show first and last few rows if the dataset is large
  const maxRows = 10;
  const showAll = rows.length <= maxRows;
  const topRows = rows.slice(0, 5);
  const bottomRows = rows.slice(-5);

  return (
    <div className="data-preview">
      <h3>Data Preview ({rows.length} rows)</h3>
      <table>
        <thead>
          <tr>
            <th>Datum</th>
            <th>Potrošnja</th>
          </tr>
        </thead>
        <tbody>
          {showAll
            ? rows.map((row, i) => (
                <tr key={i}>
                  <td>{row.date}</td>
                  <td>{row.value}</td>
                </tr>
              ))
            : (
              <>
                {topRows.map((row, i) => (
                  <tr key={i}>
                    <td>{row.date}</td>
                    <td>{row.value}</td>
                  </tr>
                ))}
                <tr className="ellipsis-row">
                  <td>...</td>
                  <td>...</td>
                </tr>
                {bottomRows.map((row, i) => (
                  <tr key={`bottom-${i}`}>
                    <td>{row.date}</td>
                    <td>{row.value}</td>
                  </tr>
                ))}
              </>
            )
          }
        </tbody>
      </table>
    </div>
  );
}

export default DataPreview;
