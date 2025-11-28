import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";

const Me = () => {


  const { auth } = useAuth();
  const [profile, setProfile] = React.useState(null);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth?.accessToken) return;
      try {
        const res = await axios.get("/api/users/me", {
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
          withCredentials: true,
        });

        setProfile(res.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data.");
      }
    };
    fetchProfile();
  }, [auth]);


  return (
    <div className="container mx-auto mt-10 p-8">
        <h2 className="text-2xl font-bold mb-4">Me</h2>
        {error && <p className="text-red-500">{error}</p>}
        {profile && (
            <div className="bg-white p-4 rounded shadow">
                <p><strong>Username:</strong> {profile.username}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Role:</strong> {profile.role}</p>
            </div>
        )}
    </div>
  )
}

export default Me