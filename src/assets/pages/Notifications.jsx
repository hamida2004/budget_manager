import React, { useEffect, useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  padding: 20px;
  width:100%;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  position:relative;
  margin: 20px auto;
`;

const NotificationItem = styled.div`
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const ExpandButton = styled.button`
  background-color: #001A82;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
`;

const Notifications = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const notifs = await window.api.getNotifications();
      setNotifications(notifs);
      console.log(notifs)
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 10);

  return (
    <Container>
      <IoArrowBackOutline  size={20} color="grey" onClick={()=>{
        navigate('/')
      }}
      style={{
        position:'absolute',
        top:20,
        left:20,
        cursor:"pointer"
      }}
      />
      <h2 style={{ textAlign: "center", color: "#001A82" }}>Notifications</h2>
      {displayedNotifications.length > 0 ? (
        displayedNotifications.reverse().map((notif) => (
          <NotificationItem key={notif.id}>
            <strong>{notif.title}</strong>
            <p>{notif.content}</p>
            <small>{new Date(notif.created_at).toLocaleString()}</small>
          </NotificationItem>
        ))
      ) : (
        <p>No notifications found.</p>
      )}
      {!showAll && notifications.length > 10 && (
        <ExpandButton onClick={() => setShowAll(true)}>Show All</ExpandButton>
      )}
    </Container>
  );
};

export default Notifications;