const ScoreDisplay = ({ score, maxScore }) => (
  <div className="score-container">
    <p>Your Score: {score} / {maxScore}</p>
  </div>
);

export default ScoreDisplay;
