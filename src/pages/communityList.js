import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../services/firebase";
import "../styles/components/Communities.css";

const defaultprofile = require('./assets/upload_photo.jpg')

const Communities = () => {
  const [activeTab, setActiveTab] = useState("Community");
  const [activeSidebar, setActiveSidebar] = useState("Community");
  const [communities, setCommunities] = useState([]);
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCommunities, setSelectedCommunities] = useState([]);  // For tracking selected communities
  const [bulkAction, setBulkAction] = useState(""); // For storing the current bulk action
  const [showBulkActions, setShowBulkActions] = useState(false);  // Show bulk actions when any card is clicked
  const [suspendedSearchTerm, setSuspendedSearchTerm] = useState("");
  const [blockedSearchTerm, setBlockedSearchTerm] = useState("");
  const [selectedSuspendedCommunities, setSelectedSuspendedCommunities] = useState([]);
  const [selectedBlockedCommunities, setSelectedBlockedCommunities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState("");



  const communitiesPerPage = 8; // Number of communities per page

  const navigate = useNavigate();

  const handleCardSelect = (id) => {
    if (selectedCommunities.includes(id)) {
      setSelectedCommunities(selectedCommunities.filter((communityId) => communityId !== id));
    } else {
      setSelectedCommunities([...selectedCommunities, id]);
    }
  
    // Show the bulk actions box when any card is selected
    setShowBulkActions(selectedCommunities.length > 0 || !selectedCommunities.includes(id));
  };
  

  const handleSelectCommunity = (id) => {
    if (selectedCommunities.includes(id)) {
      setSelectedCommunities(selectedCommunities.filter((communityId) => communityId !== id));
    } else {
      setSelectedCommunities([...selectedCommunities, id]);
    }
  };
  
  
  

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const communitiesRef = collection(db, "communities");
        const snapshot = await getDocs(communitiesRef);
        const communityList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCommunities(communityList);
        setFilteredCommunities(communityList);
      } catch (error) {
        console.error("Error fetching communities: ", error);
      }
    };

    fetchCommunities();
  }, []);

  useEffect(() => {
    const results = communities.filter(community =>
      community.communityName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCommunities(results);
    setCurrentPage(1); // Reset to the first page when searching
  }, [searchTerm, communities]);

  // Pagination calculations
  const indexOfLastCommunity = currentPage * communitiesPerPage;
  const indexOfFirstCommunity = indexOfLastCommunity - communitiesPerPage;
  const currentCommunities = filteredCommunities.slice(
    indexOfFirstCommunity,
    indexOfLastCommunity
  );

  const totalPages = Math.ceil(filteredCommunities.length / communitiesPerPage);

  const goToPage = pageNumber => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const executeBulkAction = async () => {
    const batch = db.batch();
  
    selectedCommunities.forEach((communityId) => {
      const communityRef = doc(db, "communities", communityId);
  
      if (bulkAction === "suspend") {
        batch.update(communityRef, { status: "suspended" });
      } else if (bulkAction === "block") {
        batch.update(communityRef, { status: "blocked" });
      }
    });
  
    await batch.commit();
    alert(`${selectedCommunities.length} communities have been ${bulkAction}ed!`);
    setSelectedCommunities([]);  // Clear selection
    setShowBulkActions(false);  // Hide bulk actions box
    setBulkAction("");  // Reset the bulk action
  };

  const handleSidebarClick = (section) => {
      setActiveSidebar(section);
  };
  
  const handleTabClick = (tab) => setActiveTab(tab);

  const suspendedCommunities = communities.filter((community) => community.status === "suspended");
  const blockedCommunities = communities.filter((community) => community.status === "blocked");


  const filteredSuspendedCommunities = suspendedCommunities.filter(community =>
    community.communityName?.toLowerCase().includes(suspendedSearchTerm.toLowerCase())
  );

  const handleSuspendedSelect = (id) => {
    if (selectedSuspendedCommunities.includes(id)) {
      setSelectedSuspendedCommunities(
        selectedSuspendedCommunities.filter((communityId) => communityId !== id)
      );
    } else {
      setSelectedSuspendedCommunities([...selectedSuspendedCommunities, id]);
    }
  };

  const activateSuspendedCommunities = async () => {
    if (selectedSuspendedCommunities.length === 0) {
      alert("No communities selected.");
      return;
    }

    const batch = writeBatch(db); // Use writeBatch for batch operations
    selectedSuspendedCommunities.forEach((communityId) => {
      const communityRef = doc(db, "communities", communityId);
      batch.update(communityRef, { status: "active" });
    });

    try {
      await batch.commit();
      alert(`${selectedSuspendedCommunities.length} communities have been activated.`);
      setSelectedSuspendedCommunities([]); // Clear selection

      // Fetch updated communities
      const updatedSnapshot = await getDocs(collection(db, "communities"));
      const updatedCommunities = updatedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCommunities(updatedCommunities); // Update community state
    } catch (error) {
      console.error("Error activating communities: ", error);
      alert("An error occurred while activating communities.");
    }
  };

  const filteredBlockedCommunities = blockedCommunities.filter(community =>
    community.communityName?.toLowerCase().includes(blockedSearchTerm.toLowerCase())
  );

  const handleBlockedSelect = id => {
    if (selectedBlockedCommunities.includes(id)) {
      setSelectedBlockedCommunities(
        selectedBlockedCommunities.filter(communityId => communityId !== id)
      );
    } else {
      setSelectedBlockedCommunities([...selectedBlockedCommunities, id]);
    }
  };


  const handleBlockedAction = async () => {
    if (selectedBlockedCommunities.length === 0) {
      alert("No communities selected.");
      return;
    }
  
    const confirmation = window.confirm(
      `Are you sure you want to unblock this ${selectedBlockedCommunities.length} community?`
    );
  
    if (!confirmation) {
      // Exit if the user cancels the confirmation
      return;
    }
  
    const batch = writeBatch(db); // Use writeBatch for batch operations
    selectedBlockedCommunities.forEach((communityId) => {
      const communityRef = doc(db, "communities", communityId);
      batch.update(communityRef, { status: "active" });
    });
  
    try {
      await batch.commit();
      alert(`${selectedBlockedCommunities.length} communities have been unblocked.`);
      setSelectedBlockedCommunities([]); // Clear selection
  
      // Fetch updated communities
      const updatedSnapshot = await getDocs(collection(db, "communities"));
      const updatedCommunities = updatedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCommunities(updatedCommunities); // Update community state
    } catch (error) {
      console.error("Error activating communities: ", error);
      alert("An error occurred while unblocking communities.");
    }
  };

  const handleDeleteCommunities = async () => {
    if (selectedBlockedCommunities.length === 0) {
      alert("No communities selected.");
      return;
    }
  
    const confirmation = window.confirm(
      `Are you sure you want to permanently delete ${selectedBlockedCommunities.length} communities? This action cannot be undone.`
    );
  
    if (!confirmation) {
      return; // Exit if the user cancels the confirmation
    }
  
    const batch = writeBatch(db); // Use writeBatch for batch operations
    selectedBlockedCommunities.forEach((communityId) => {
      const communityRef = doc(db, "communities", communityId);
      batch.delete(communityRef); // Permanently delete the document
    });
  
    try {
      await batch.commit();
      alert(`${selectedBlockedCommunities.length} communities have been deleted.`);
  
      setSelectedBlockedCommunities([]); // Clear selection
  
      // Fetch updated communities
      const updatedSnapshot = await getDocs(collection(db, "communities"));
      const updatedCommunities = updatedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCommunities(updatedCommunities); // Update community state
    } catch (error) {
      console.error("Error deleting communities: ", error);
      alert("An error occurred while deleting communities.");
    }
  };
  
  

  const openModal = action => {
    if (selectedCommunities.length > 0) {
      setModalAction(action);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalAction("");
  };

  const confirmAction = async () => {
    if (selectedCommunities.length === 0) {
      alert("No communities selected for this action.");
      return;
    }
  
    const batchOperation = writeBatch(db); // Use writeBatch
    selectedCommunities.forEach(communityId => {
      const communityRef = doc(db, "communities", communityId);
      const status = modalAction === "suspend" ? "suspended" : "blocked";
      batchOperation.update(communityRef, { status });
    });
  
    try {
      await batchOperation.commit();
      alert(`${selectedCommunities.length} communities have been ${modalAction}ed.`);
      setSelectedCommunities([]);
      closeModal();
  
      // Update community list
      const updatedSnapshot = await getDocs(collection(db, "communities"));
      const updatedCommunities = updatedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCommunities(updatedCommunities);
    } catch (error) {
      console.error("Error updating communities: ", error);
      alert("An error occurred while updating communities. Please try again.");
    }
  };

  
  return (
    <div className="communities-container">
      <h1 style={{textAlign:'center', margin:'20px'}}>Manage Communities</h1>
      {/* Sidebar */}
      <div style={{display:'flex', flexDirection:'column', padding:'10px'}} >
      <div className="communities-admin-action-tabs">
        {["Community", "Analytics", "Suspended", "Blocked", "Reports"].map(
          (tab) => (
            <div
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </div>
          )
        )}
        {activeTab === "Community" && (
          <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', width:'100%'}}>
        <input
        type="text"
        placeholder="Search communities..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="search-bar"
        style={{width:'100%'}}
      />

{showBulkActions && selectedCommunities.length > 0 ? (
 <div className="bulk-actions">
 <button
   onClick={() => openModal("suspend")}
   disabled={selectedCommunities.length === 0}
   className="bulk-action-button suspend-button"
 >
   Suspend
 </button>
 <button
   onClick={() => openModal("block")}
   disabled={selectedCommunities.length === 0}
   className="bulk-action-button block-button"
 >
   Block
 </button>
</div>

):(
  <div>
    <button style={{ fontSize:'13px'}}>Create Community</button>
    </div>
)}
</div>
)}

{activeTab === "Suspended" && (
  <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', width:'100%'}}>
            <input
              type="text"
              placeholder="Search suspended communities..."
              value={suspendedSearchTerm}
              onChange={e => setSuspendedSearchTerm(e.target.value)}
              className="search-bar"
              style={{width:'100%'}}
            />

{selectedSuspendedCommunities.length > 0 && (
              <button
                className="bulk-action-button activate-button"
                onClick={activateSuspendedCommunities}
                style={{ marginLeft: "10px" }}
              >
                Activate
              </button>
            )}
  </div>
)}

{activeTab === "Blocked" && (
  <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', width:'80%'}}>
            <input
              type="text"
              placeholder="Search blocked communities..."
              value={blockedSearchTerm}
              onChange={e => setBlockedSearchTerm(e.target.value)}
              className="search-bar"
              style={{width:'80%'}}
            />

            {selectedBlockedCommunities.length>0 && (
              <div className="bulk-actions">
              <button className="bulk-action-button un-block-button"
                onClick={handleBlockedAction}
                style={{fontSize:'14px', padding:"8px", width:'100px', textAlign:'center', justifyContent:'center', alignItems:'center'}}
                >un block</button>
              <button style={{ marginLeft: "10px", fontSize:'12px',  padding:"8px" }}
              className="bulk-action-button un-block-button"
              onClick={handleDeleteCommunities}>delete permanently</button>
              </div>
            )}
  </div>
)}
      </div>

</div>
        <div className="communities-content">
          
        {activeTab === "Community" && (
          <div className="communities-community-section">
      

      <div className="communities-grid">
        {currentCommunities.map(community => (
          <div key={community.id} className="community-card" onClick={() => handleCardSelect(community.id)}>
            {showBulkActions && selectedCommunities.length > 0 && (
            <input
              type="checkbox"
              checked={selectedCommunities.includes(community.id)}
              onChange={() => handleSelectCommunity(community.id)}
              className="select-checkbox"
            />)}
            <img
              src={community.profilePhoto || defaultprofile}
              alt={community.communityName || "Community"}
              className="community-image"
            />
            <h2 className="community-name">
              {community.communityName || "Untitled Community"}
            </h2>
            <p className="community-description">
              {(community.communityDescription || "No description available").slice(0, 100)}...
            </p>

              <div style={{display:'flex', flexDirection:"column", justifyContent:'center'}}>
            <div className={`status-badge ${community.status.toLowerCase()}`}>
              {community.status.toUpperCase()}
            </div>
            <button
              className="community-button"
              onClick={() => navigate(`/community/${community.communityId}`)}
            >
              Inspect
            </button>
            </div>
          </div>
        ))}
      </div>

       {/* Pagination Controls */}
       <div className="pagination">
        <button
          className="pagination-button"
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          Previous
        </button>
        {[...Array(totalPages).keys()].map(page => (
          <button
            key={page + 1}
            className={`pagination-button ${
              currentPage === page + 1 ? "active" : ""
            }`}
            onClick={() => goToPage(page + 1)}
          >
            {page + 1}
          </button>
        ))}
        <button
          className="pagination-button"
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
      </div>)}

       {/* Suspended Tab */}
       {activeTab === "Suspended" && (
          <div className="communities-grid">
           {suspendedCommunities.length > 0 ? (
      filteredSuspendedCommunities.map((community) => (
        <div key={community.id} className="community-card" onClick={() => handleSuspendedSelect(community.id)}>
          {selectedSuspendedCommunities.length > 0 && (
              <input
                    type="checkbox"
                    checked={selectedSuspendedCommunities.includes(community.id)}
                    onChange={() => handleSuspendedSelect(community.id)}
                    className="select-checkbox"
                  />)}
          <img
            src={community.profilePhoto || defaultprofile}
            alt={community.communityName || "Community"}
            className="community-image"
          />
          <h2 className="community-name">{community.communityName || "Untitled Community"}</h2>
          <p className="community-description">
            {(community.communityDescription || "No description available").slice(0, 100)}...
          </p>
        </div>
      ))
    ) : (
      <p style={{ textAlign: "center", fontSize: "1.2rem", color: "#555" }}>
        No suspended communities found.
      </p>
    )}
          </div>
        )}

        {/* Blocked Tab */}
        {activeTab === "Blocked" && (
          <div className="communities-grid">
          {blockedCommunities.length > 0 ? (
      filteredBlockedCommunities.map((community) => (
        <div key={community.id} className="community-card" onClick={() => handleBlockedSelect(community.id)}>
          {selectedBlockedCommunities.length>0 && (
             <input
             type="checkbox"
             checked={selectedBlockedCommunities.includes(community.id)}
             onChange={() => handleBlockedSelect(community.id)}
             className="select-checkbox"
           />)}
          <img
            src={community.profilePhoto || defaultprofile}
            alt={community.communityName || "Community"}
            className="community-image"
          />
          <h2 className="community-name">{community.communityName || "Untitled Community"}</h2>
          <p className="community-description">
            {(community.communityDescription || "No description available").slice(0, 100)}...
          </p>
        </div>
      ))
    ) : (
      <p style={{ textAlign: "center", fontSize: "1.2rem", color: "#555" }}>
        No blocked communities found.
      </p>
    )}
          </div>
        )}

      </div>
      {showModal && (
        <div className="community-action-modal">
          <div className="community-action-modal-content">
            <h2>{modalAction === "suspend" ? "Suspend" : "Block"} Communities</h2>
            <p>
              Are you sure you want to {modalAction} the following communities?
            </p>
            <ul>
              {selectedCommunities.map(id => {
                const community = communities.find(c => c.id === id);
                return <li key={id}>{community?.communityName || "Unknown Community"}</li>;
              })}
            </ul>
            <div className="community-action-modal-actions">
              <button onClick={confirmAction}>Confirm</button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div style={{padding:'40px'}}/>
    </div>
  );
};

export default Communities;
