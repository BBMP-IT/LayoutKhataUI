const Error_Page = ({ error }) => {
  // Defensive coding: handle when error is null/undefined
  const errorLocation = error?.errorLocation || 'Unknown location';
  const message = error?.message || 'An unexpected error occurred';

  return (
    <div style={{ padding: 40 }}>
      <h2>Something went wrong</h2>
      <p>{message}</p>
      <p>Error location: {errorLocation}</p>
    </div>
  );
};

export default Error_Page;
