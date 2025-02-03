import React, { useState, useContext, useEffect } from "react";
import { FormContext } from "../../context/form-context";
import { getFormByUser } from "../../api/formApi";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";
import "./home.css";
import {deleteForm} from "../../api/formApi";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faChartPie,
  faTrashCan,
  faPen,

} from "@fortawesome/free-solid-svg-icons";

export const Home = () => {
  const { token } = useContext(FormContext);
  const [formList, setFormList] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchUrl, setSearchUrl] = useState(""); // New state for URL search
  const [currentPage, setCurrentPage] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [offset, setOffset] = useState(0);
  const [currentForms, setCurrentForms] = useState([]);
  const navigate = useNavigate();

  const formsPerPage = 8; // 2 rows, 4 columns = 8 items per page

  const getForm = async () => {
    try {
      const response = await getFormByUser(token);
      if (response.success) {
        setFormList(response.data);
        setFilteredForms(response.data);
        const offsetLocal = currentPage * formsPerPage;
        const currentFormsLocal = filteredForms.slice(offset, offset + formsPerPage);
        setOffset(offsetLocal);
        setCurrentForms(currentFormsLocal);
        setLoggedIn(true);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    getForm();
  }, []);

  // Recalculate currentForms when filteredForms or currentPage change
  useEffect(() => {
    const offsetLocal = currentPage * formsPerPage;
    const currentFormsLocal = filteredForms.slice(offsetLocal, offsetLocal + formsPerPage);
    setCurrentForms(currentFormsLocal);
    setOffset(offsetLocal); // Update offset as well

    const marginTop = 1550 - (formsPerPage - currentFormsLocal.length) * 230; // Adjust as needed
    document.documentElement.style.setProperty('--dynamic-margin-top', `${marginTop}px`);
    console.log("currentForms.length", currentForms.length);

  }, [filteredForms, currentPage]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTitle(value);
    setFilteredForms(
      formList.filter((form) => form.title.toLowerCase().includes(value))
    );
    setCurrentPage(0); // Reset to the first page on new search
  };

  const handleUrlSearch = () => {
    // Navigate to the URL entered in the search field
    if (searchUrl) {
      navigate(`${import.meta.env.VITE_API_BASE_URL}/${searchUrl}`);
    }
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Handler for Edit button
  const handleEdit = (url) => {
    navigate(`${import.meta.env.VITE_API_BASE_URL}/edit/${url}`);
  };

  // Handler for Statistics button
  const handleStatistics = (url) => {
    navigate(`${import.meta.env.VITE_API_BASE_URL}/stats/${url}`);
  };

  const handleDelete = async (id) => {
    try {
      await deleteForm(token, id);
      getForm();

    } catch (error) {
      console.error("Error:", error);
    } 
  };


  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleUrlSearch();
    }
  };

  return (
    <div>
      {loggedIn ? (
        <div className="home-container">

          <div className="full-width-container" >
            <div className="search-url-bar">
              {/* URL Search Input */}
              <input
                type="text"
                placeholder="Search form by URL"
                value={searchUrl}
                onChange={(e) => setSearchUrl(e.target.value)}
                className="search-input"
                onKeyDown={handleKeyDown}
              />
              {/* Button to trigger navigation */}
              <button
                className="search-url-button"
                onClick={handleUrlSearch}
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} className="search-button" />
              </button>
            </div>

            <div className="search-bar">
              <input
                type="text"
                placeholder="Search your form by title"
                value={searchTitle}
                onChange={handleSearch}
                className="search-input"
              />
            </div>
          </div>

          <div className="form-grid">
            {currentForms.map((form) => (
              <div key={form.id} className="form-card">
                <p className="form-title2">{form.title}</p>
                <p className="form-description">{form.description}</p>
                <p className="form-date">
                  Created: {new Date(form.createdAt).toLocaleDateString()}
                </p>
                <p className="form-type">Type: {form.type}</p>
                <p className="form-url">
                  Url: <strong>{form.url}</strong>
                </p>
                <div className="form-actions">
                  <button
                    className="action-button edit-button"
                    onClick={() => handleEdit(form.url)}
                  >
                    <FontAwesomeIcon icon={faPen} className="edit-icon" />
                  </button>
                  <button
                    className="action-button stats-button"
                    onClick={() => handleStatistics(form.url)}
                  >
                    <FontAwesomeIcon icon={faChartPie} className="stat-icon" />
                  </button>
                  <button
                    className="action-button deleting-button"
                    onClick={() => handleDelete(form.id)}
                  >
                    <FontAwesomeIcon icon={faTrashCan} className="delete-icon" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="pagination-container">
            <ReactPaginate
              previousLabel={"◀"}
              nextLabel={"▶"}
              breakLabel={"..."}
              pageCount={Math.ceil(filteredForms.length / formsPerPage)}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageClick}
              containerClassName={"pagination"}
              pageClassName={"page-item"}
              pageLinkClassName={"page-link"}
              previousClassName={"page-item"}
              previousLinkClassName={"page-link"}
              nextClassName={"page-item"}
              nextLinkClassName={"page-link"}
              activeClassName={"active"}
            />
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};