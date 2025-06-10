// src/components/Breadcrumbs.js
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Breadcrumbs.css';

const Breadcrumbs = () => {
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    
    const pathnames = location.pathname.split('/').filter((x) => x);
    const currentPath = `/${pathnames.join('/')}`; 
    const storedBreadcrumbs = JSON.parse(localStorage.getItem('breadcrumbs')) || [];
    if(currentPath === "/" || currentPath === "/ErrorPage"){
      localStorage.clear()
      setBreadcrumbs(storedBreadcrumbs);
      return
    }
    if (!storedBreadcrumbs.includes(currentPath)) {
      storedBreadcrumbs.push(currentPath);
      localStorage.setItem('breadcrumbs', JSON.stringify(storedBreadcrumbs));
    }
    else {
      const currentIndex = storedBreadcrumbs.findIndex(path => path === currentPath);
      if (currentIndex !== -1) {
    //  storedBreadcrumbs.pop();
    storedBreadcrumbs.splice(currentIndex + 1);
      }
      localStorage.setItem('breadcrumbs', JSON.stringify(storedBreadcrumbs));
    }
    setBreadcrumbs(storedBreadcrumbs);
  }, [location]);

  return (
    <div className="breadcrumb">
      {breadcrumbs.map((path, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const pathnames = path.split('/').filter((x) => x);

        return (
          <Link key={path} to={path} className={`breadcrumb__step ${isLast ? 'breadcrumb__step--active' : ''}`}>
            {pathnames[pathnames.length - 1] || 'Login'}
          </Link>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;

