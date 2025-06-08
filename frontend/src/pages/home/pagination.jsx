import ReactPaginate from "react-paginate";

const Pagination = ({ pageCount, onPageChange }) => (
  <div className="pagination-container">
    <ReactPaginate
      previousLabel={"◀"}
      nextLabel={"▶"}
      breakLabel={"..."}
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={3}
      onPageChange={onPageChange}
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
);

export default Pagination;
