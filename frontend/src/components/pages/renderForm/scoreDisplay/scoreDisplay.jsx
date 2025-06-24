import "./scoreDisplay.css";

export const ScoreDisplay = ({ score, maxScore }) => (
  <div className="score-container">
    <p>Your Score: {score} / {maxScore}</p>
  </div>
);


