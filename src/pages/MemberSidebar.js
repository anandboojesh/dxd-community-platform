import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/MemberSidebar.css';

function MemberSidebar() {
    return (
        <nav className="member-sidebar">
          <ul className="member-sidebar-list">
            <li className="member-sidebar-item">
              <Link to="/communities" activeClassName="active">
                Profile
              </Link>
            </li>
            <li className="member-sidebar-item">
              <Link to="/communities" activeClassName="active">
                Communities
              </Link>
            </li>
            <li className="member-sidebar-item">
              <Link to="/leaderboard" activeClassName="active">
                Leaderboard
              </Link>
            </li>
            <li className="member-sidebar-item">
              <Link to="/discover" activeClassName="active">
                Discover
              </Link>
            </li>
          </ul>
        </nav>
      );
}

export default MemberSidebar;
