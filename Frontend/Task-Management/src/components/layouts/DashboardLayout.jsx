import React, { useContext, useState } from 'react'
import { UserContext } from '../../context/userContext';
import Navbar from './Navbar';
import SideMenu from './SideMenu';

const DashboardLayout = ({children, activeMenu}) => {
    const { user } = useContext(UserContext);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="page-shell">
            <Navbar activeMenu={activeMenu} />

            {user && (
                <div className="flex">
                    <div className="max-[1080px]:hidden">
                        <SideMenu activeMenu={activeMenu} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                    </div>

                    <div className="grow px-4 pb-8 pt-2 md:px-6 lg:px-8">{children}</div>
                </div>
            )}
            
        </div>
    )
}

export default DashboardLayout
