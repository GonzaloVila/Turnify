export default function LoadingSpinner({ fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="spinner-fullscreen">
        <div className="spinner" />
      </div>
    );
  }
  return <div className="spinner" />;
}
