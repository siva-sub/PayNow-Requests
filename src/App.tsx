import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CreateRequest from './components/CreateRequest';
import ViewRequest from './components/ViewRequest';

function App() {
  useEffect(() => {
    document.title = 'PayNow Requests - Privacy-Preserving Payment Requests';
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-indigo-600">
                PayNow Requests
              </span>
            </Link>
            <Link
              to="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
            >
              Create New
            </Link>
          </div>
        </nav>

        <main className="max-w-2xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<CreateRequest />} />
            <Route path="/request/:encodedData" element={<ViewRequest />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
            <p>
              Privacy-Preserving Payment Requests • Built for Singapore PayNow
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
