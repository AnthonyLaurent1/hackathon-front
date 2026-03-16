const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner">
      <div className="spinner-circle"></div>
      <div className="spinner-circle"></div>
      <div className="spinner-circle"></div>
    </div>
    <div className="spinner-text">
      <p>Chargement en cours</p>
      <div className="dots">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </div>
    </div>
  </div>
);

export default LoadingSpinner;
