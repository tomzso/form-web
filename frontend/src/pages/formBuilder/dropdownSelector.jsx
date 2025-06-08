const DropdownSelector = ({ selectedType, isDropdownOpen, formType, toggleDropdown, handleTypeSelect }) => (
  <div className="dropdown-button-container">
    <div className="dropdown">
      <button onClick={toggleDropdown} className="dropdown-button">
        {selectedType}
      </button>
      {isDropdownOpen && (
        <ul className="dropdown-list">
          {formType.map((type, index) => (
            <li key={index} className="dropdown-item" onClick={() => handleTypeSelect(type)}>
              {type}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

export default DropdownSelector;
