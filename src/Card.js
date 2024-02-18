import React from 'react';
import './Card.css'; // 引入专门的CSS文件

function Card({ word, count }) {
  return (
    <div >
      <p className="card">{word} {count}</p>
    </div>
  );
}

export default Card;
