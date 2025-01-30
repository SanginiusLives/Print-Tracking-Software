import React from "react";

function PrintLines({ selectedLines }) {
  const sortedLines = [...selectedLines].sort((a, b) => a.value - b.value);



  return (
    <div className="grid">
      {sortedLines.map((line, index) => (
        <div key={index}
        className={`${line.level} lineItem`}
        id={line.value === '0' ? "All" : undefined}>
          {line.value === '0' ? "All" : line.value}
        </div>
      ))}
    </div>
  );
}

export default PrintLines;
