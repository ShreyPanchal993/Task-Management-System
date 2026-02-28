import React from 'react'
import { useUserAuth } from '../../hooks/useUserAuth';

const UserDashboard = () => {
  useUserAuth(); // Custom hook to check user authentication
  return (
    <div>UserDashboard</div>
  )
}

export default UserDashboard