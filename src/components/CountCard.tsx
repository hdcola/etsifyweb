import { useState } from 'react';

const CountCard = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="card">
      <button onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </button>
      <p>
        Edit <code>src/App.tsx</code> and save to test HMR
      </p>
      <p>Hello world. This is a simple example of a React component.</p>
    </div>
  );
};

export default CountCard;
