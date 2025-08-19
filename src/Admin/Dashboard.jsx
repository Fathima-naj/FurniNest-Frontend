import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser, totalRevenues } from '../slice/AdminSlice';
import { fetchProduct } from '../slice/ProductSlice';
//import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';


function Dashboard() {
  const dispatch = useDispatch();
  const { user, totalRevenue } = useSelector(state => state.admin);
  const { product, pagination } = useSelector(state => state.product);
    
  useEffect(() => {
    dispatch(fetchUser({}));  
    dispatch(fetchProduct({})); 
    dispatch(totalRevenues());
  }, [dispatch]);

  // Blocked users count
  const blockedUserCount = user?.filter(itm => itm.isBlock === true)?.length || 0;

  // Graph Data
  const chartData = [
    { name: 'Users', value: user?.length || 0 },
    { name: 'Blocked Users', value: blockedUserCount },
    { name: 'Products', value: pagination?.total || 0 },
    { name: 'Revenue', value: totalRevenue || 0 }
  ];

  return (
    <div className='min-h-screen py-10 p-5'>
      <h2 className='text-3xl md:text-4xl font-bold text-center text-gray-800 mb-10'>Welcome to Admin Panel</h2>
      
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* Total Users */}
        <Link to='/adminUsers' className='block'>
          <div className='bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition'>
            <h2 className='text-lg md:text-xl font-semibold text-gray-700'>Total Users</h2>
            <p className='text-2xl md:text-3xl font-bold text-gray-900 mt-2'>{user?.length || 0}</p>
          </div>
        </Link>

        {/* Total Products */}
        <Link to='/adminProduct' className='block'>
          <div className='bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition'>
            <h2 className='text-lg md:text-xl font-semibold text-gray-700'>Total Products</h2>
            <p className='text-2xl md:text-3xl font-bold text-gray-900 mt-2'>{pagination?.total || 0}</p>
          </div> 
        </Link>

        {/* Blocked Users */}
        <Link to='/adminUsers' className='block'>
          <div className='bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition'>
            <h2 className='text-lg md:text-xl font-semibold text-gray-700'>Blocked Users</h2>
            <p className='text-2xl md:text-3xl font-bold text-gray-900 mt-2'>{blockedUserCount}</p>
          </div>
        </Link>

        {/* Total Revenue */}
        <div className='bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition'>
          <h2 className='text-lg md:text-xl font-semibold text-gray-700'>Total Revenue</h2>
          <p className='text-2xl md:text-3xl font-bold text-gray-900 mt-2'>₹ {totalRevenue ?? 0}</p>
        </div>
      </div>

      {/* Graph Section */}
      <div className="mt-10 bg-white p-6 shadow-md rounded-lg">
        
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="value" fill="#4CAF50" barSize={40} />
  </BarChart>
</ResponsiveContainer>
      </div>
      
    </div>
    
  );
}

export default Dashboard;
