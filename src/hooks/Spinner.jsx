import React from "react";

const Spinner = ({ msg }) => {
  return (
    <>
      <div className="loadingSpinnerContainer">
        <div className="loadingSpinner"></div>
        <div className=""> {msg}</div>
      </div>
    </>
  );
};

export default Spinner;
