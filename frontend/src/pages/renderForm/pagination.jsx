import React from "react";

const Pagination = ({ currentPage, maxPage, onNext, onBack }) => (
  <div className="pagination-buttons">
    <button
      className="button"
      disabled={currentPage === 1}
      onClick={onBack}
    >
      Back
    </button>
    <button
      className="button"
      disabled={currentPage === maxPage}
      onClick={onNext}
    >
      Next
    </button>
  </div>
);

export default Pagination;
