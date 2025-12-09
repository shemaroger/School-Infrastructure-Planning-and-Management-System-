import { Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import "./App.css";
import 'react-toastify/dist/ReactToastify.css';
import Login from "./components/autho/Login";
import Layout from "./components/layout/layout";
import SchoolManagement from "./components/school/SchoolManagement";
import UserManagement from "./components/User/UserManagement"
import SchoolAdditionalInfo from './components/school/SchoolAdditionalInfo';
import Prediction from './components/Prediction/Prediction'
import PredictionList from './components/Prediction/PredictionList'
import PredictionLocation from './components/Prediction/PredictionLocation';
import Adduser from './components/User/Adduser';
import EditUser from './components/User/EditUser';
import NotificationList from './components/Notification/NotificationList';
import SchoolPredictions from './components/school/SchoolPredictions';
import PredictionReports from './components/Prediction/PredictionReports';
import PredictionReportsByLocation from './components/Prediction/PredictionReportsByLocation';

import AdminDashboard from './components/Dashboard/AdminDashboard';
import DistrictDashboard from './components/Dashboard/DistrictDashboard';
import UmurengeDashboard from './components/Dashboard/UmurengeDashboard';

import Userprofile from './components/User/Userprofile';
import ViewUser from './components/User/ViewUser';
import SendNotification from './components/Notification/SendNotification';

import ActionLogs from './components/ActionLogs/ActionLogs';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<Layout />}>
          <Route path="schools/list" element={<SchoolManagement />} />
          <Route path="users/list" element={<UserManagement />} />
          <Route path="users/add" element={<Adduser />} />
          <Route path="users/edit/:id" element={<EditUser />} />
          <Route path="school/additionalinfo" element={<SchoolAdditionalInfo />} />
          <Route path="predictions/add" element={<Prediction />} />
          <Route path="predictions/list" element={<PredictionList />} />
          <Route path="predictions/district/add" element={<PredictionLocation />} />
          <Route path="notification/list" element={<NotificationList />} />
          <Route path="notification/send" element={<SendNotification />} />
          <Route path="school/prictions/list" element={<SchoolPredictions />} />
          <Route path="predictions/doc" element={<PredictionReports />} />
          <Route path="predictions/mineduc" element={<PredictionReportsByLocation />} />


          <Route path="admindashboard" element={<AdminDashboard />} />
          <Route path="districtdashboard" element={<DistrictDashboard />} />
          <Route path="umurengedashboard" element={<UmurengeDashboard />} />


          <Route path="users/profile" element={<Userprofile />} />
          <Route path="users/views/profile" element={<ViewUser />} />

          <Route path="action/logs" element={<ActionLogs />} />





        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="light"
        toastStyle={{
          backgroundColor: '#ffffff',
          color: '#333333',
          borderRadius: '8px',
          border: '1px solid #ddd',
          padding: '10px',
          boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
          maxWidth: '500px',
          minWidth: '300px',
          fontSize: '14px',
          textAlign: 'center',
        }}

      />

    </>
  );
}

export default App;
