import React from 'react';
import './Card.css'; // 引入专门的CSS文件

function Card({className, word, count }) {
  const backgroundColor = `rgba(255, 226, 151, ${count === 3 ? 1 : count === 2 ? 0.7 : 0.3})`;
  return (
    <div >
      <p className="card">{word} {count}</p>
    </div>
  );
}

export default Card;
