import { useLocation,Link, useNavigate } from "react-router-dom";
import "../styles/components/SearchResults.css"

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate()
  const { results, query } = location.state || {};

  if (!results || !query) {
    navigate('/');
    return <div></div>;
  }

  return (
    <div className="search-results-container">
      <h2>Search Results for "{query}"</h2>
      <div className="results-section">
        {results.communities.length > 0 ? (
          results.communities.map((community) => (
            <Link to={`/community/${community.id}`} key={community.id}>
              <div className="search-result-item">{community.name}</div>
            </Link>
          ))
        ) : (
         ""
        )}
      </div>

      <div className="results-section">
        {results.events.length > 0 ? (
          results.events.map((event) => (
            <Link to={`/event/${event.id}`} key={event.id}>
              <div className="search-result-item">{event.title}</div>
            </Link>
          ))
        ) : (
         ""
        )}
      </div>

      <div className="results-section">
        {results.courses.length > 0 ? (
          results.courses.map((course) => (
            <Link to={`/course/${course.id}`} key={course.id}>
              <div className="search-result-item">{course.name}</div>
            </Link>
          ))
        ) : (
      ""
        )}
      </div>
    </div>
  );
};

export default SearchResults;
