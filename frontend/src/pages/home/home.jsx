import "./home.css";

import React, { useState, useContext, useEffect } from "react";
import { FormContext } from "../../context/form-context";
import { getFormByUser, deleteForm } from "../../api/formApi";
import { useNavigate } from "react-router-dom";
import FormCard from "./formCard";
import SearchBars from "./searchBars";
import Pagination from "./pagination";

export const Home = () => {
  const { token } = useContext(FormContext);
  const [formList, setFormList] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchUrl, setSearchUrl] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [currentForms, setCurrentForms] = useState([]);
  const navigate = useNavigate();
  const formsPerPage = 8;

  const fetchForms = async () => {
    try {
      const response = await getFormByUser(token);
      if (response.success) {
        setFormList(response.data);
        setFilteredForms(response.data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    const offset = currentPage * formsPerPage;
    const current = filteredForms.slice(offset, offset + formsPerPage);
    setCurrentForms(current);

    // Adjust the dynamic margin-top based on the number of forms on mobile
    const marginTop = 1550 - (formsPerPage - current.length) * 230;
    document.documentElement.style.setProperty('--dynamic-margin-top', `${marginTop}px`);
  }, [filteredForms, currentPage]);

  const handleSearchTitle = (value) => {
    setSearchTitle(value);
    setFilteredForms(formList.filter(form => form.title.toLowerCase().includes(value.toLowerCase())));
    setCurrentPage(0);
  };

  const handleUrlSearch = () => {
    if (searchUrl) navigate(`${import.meta.env.VITE_API_BASE_URL}/${searchUrl}`);
  };

  const handleDelete = async (id) => {
    try {
      await deleteForm(token, id);
      fetchForms();
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  const handleCopyUrl = (url) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).catch((err) => {
        console.error("Clipboard API failed:", err);
        fallbackCopy(url);
      });
    } else {
      fallbackCopy(url);
    }
  };

  const fallbackCopy = (text) => {
    const input = document.createElement("input");
    input.value = text;
    document.body.appendChild(input);
    input.select();
    input.setSelectionRange(0, 99999); 
    document.execCommand("copy");
    document.body.removeChild(input);
  };


  return (
    <div className="home-container">
      <SearchBars
        searchTitle={searchTitle}
        setSearchTitle={handleSearchTitle}
        searchUrl={searchUrl}
        setSearchUrl={setSearchUrl}
        onUrlSearch={handleUrlSearch}
      />
      <div className="form-grid">
        {currentForms.map(form => (
          <FormCard
            key={form.id}
            form={form}
            onEdit={(url) => navigate(`${import.meta.env.VITE_API_BASE_URL}/edit/${url}`)}
            onStats={(url) => navigate(`${import.meta.env.VITE_API_BASE_URL}/stats/${url}`)}
            onDelete={() => handleDelete(form.id)}
            onCopyUrl={handleCopyUrl}
          />
        ))}
      </div>
      <Pagination
        pageCount={Math.ceil(filteredForms.length / formsPerPage)}
        onPageChange={({ selected }) => setCurrentPage(selected)}
      />
    </div>
  );
};

