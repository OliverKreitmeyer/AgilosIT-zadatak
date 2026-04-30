// File upload component - lets the user pick a CSV file
function FileUpload({ onFileSelect }) {
  function handleChange(event) {
    const file = event.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  }

  return (
    <div className="file-upload">
      <label htmlFor="csv-upload">Upload CSV file:</label>
      <input
        id="csv-upload"
        type="file"
        accept=".csv"
        onChange={handleChange}
      />
    </div>
  );
}

export default FileUpload;
