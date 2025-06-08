import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const SearchBars = ({ searchTitle, setSearchTitle, searchUrl, setSearchUrl, onUrlSearch }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") onUrlSearch();
  };

  return (
    <div className="full-width-container">
      <div className="search-url-bar">
        <input
          type="text"
          placeholder="Search form by URL"
          value={searchUrl}
          onChange={(e) => setSearchUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          className="search-input"
        />
        <button className="search-url-button" onClick={onUrlSearch}>
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
      </div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search your form by title"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          className="search-input"
        />
      </div>
    </div>
  );
};

export default SearchBars;
