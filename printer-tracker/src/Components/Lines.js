import React, { useRef, useEffect, useState } from "react";

const queueTypes = [
  { level: "Priority", type: "priority" },
  { level: "Reorder", type: "reorder" },
  { level: "Backstock", type: "backstock" },
];

function Lines({ group, onSelect, reset }) {
  const larges = [0];
  const cells = [0];
  let listRef = useRef();
  const [selectedItem, setSelectedItem] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    let handler = (e) => {
      if (listRef.current && !listRef.current.contains(e.target)) {
        setSelectedItem(null);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  useEffect(() => {
    if (reset) {
      setCheckedItems({}); // Clear all checked items when reset changes
    }
  }, [reset]);

  const handleClick = (e, queuetype) => {
    e.stopPropagation();
    setSelectedItem((prevDropdown) => (prevDropdown === queuetype ? null : queuetype));
  };

  const preventClose = (e) => {
    e.stopPropagation(); // Prevent the dropdown from closing when clicking inside the ul.lines
  };

  const handleSelect = (e, level) => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    setCheckedItems((prev) => ({
      ...prev,
      [level]: {
        ...prev[level],
        [value]: isChecked
      }
    }));

    onSelect(level, isChecked, value);
  };

  const isChecked = (level, value) => {
    return checkedItems[level] && checkedItems[level][value];
  };

  if (group === "Larges") {
    for (let i = 0; i < 7; i++) {
      larges.push(
        <li key={i}>
          <input
            type="checkbox"
            value={i}
            checked={isChecked("Larges", i) || false}
            onChange={(e) => handleSelect(e, "Larges")}
          />
          {i + 1}
        </li>
      );
    }

    return (
      <div className="container" ref={listRef}>
        {queueTypes.map((queue) => (
          <div id={queue.type} className="list" key={queue.type}>
            <div onClick={(e) => handleClick(e, queue.type)} className={`dropdown ${selectedItem === queue.type ? 'visible' : 'hidden'}`}>
              <span className="anchor">{queue.level}</span>
              <ul className="lines" onClick={preventClose}>
                {larges.map((item, index) => (
                  <li key={index}>
                    <input
                      type="checkbox"
                      value={index}
                      checked={isChecked(queue.level, index) || false}
                      onChange={(e) => handleSelect(e, queue.level)}
                    />
                    {index === 0 ? "All" : index}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (group === "Cells") {
    for (let i = 0; i < 14; i++) {
      cells.push(
        <li key={i}>
          <input
            type="checkbox"
            value={i}
            checked={isChecked("Cells", i) || false}
            onChange={(e) => handleSelect(e, "Cells")}
          />
          {i === 0 ? "All" : i}
        </li>
      );
    }

    return (
      <div className="container" ref={listRef}>
        {queueTypes.map((queue) => (
          <div id={queue.type} className="list" key={queue.type}>
            <div onClick={(e) => handleClick(e, queue.type)} className={`dropdown ${selectedItem === queue.type ? 'visible' : 'hidden'}`}>
              <span className="anchor">{queue.level}</span>
              <ul className="lines" onClick={preventClose}>
                {cells.map((item, index) => (
                  <li key={index}>
                    <input
                      type="checkbox"
                      value={index}
                      checked={isChecked(queue.level, index) || false}
                      onChange={(e) => handleSelect(e, queue.level)}
                    />
                    {index === 0 ? "All" : index}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

export default Lines;
