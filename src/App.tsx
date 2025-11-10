import { LandingPage } from './components/onboarding/LandingPage';
import { RegisterPage } from './components/onboarding/RegisterPage';
import { LoginPage } from './components/onboarding/LoginPage';
import { RoleSelectionPage } from './components/onboarding/RoleSelectionPage';
import { ClubCreationPage } from './components/onboarding/ClubCreationPage';
import { TeamSetupPage } from './components/onboarding/TeamSetupPage';
import { ClubSelectionPage } from './components/onboarding/ClubSelectionPage';
import { TeamSelectionPage } from './components/onboarding/TeamSelectionPage';
import { FamilyProfileSetupPage } from './components/onboarding/FamilyProfileSetupPage';
import { CoordinatorLayout } from './components/coordinator/CoordinatorLayout';
import { CoordinatorDashboard } from './components/coordinator/CoordinatorDashboard';
import { EventCreator } from './components/coordinator/EventCreator';
import { BulkEventCreator } from './components/coordinator/BulkEventCreator';
import { MultiDayBulkCreator } from './components/coordinator/MultiDayBulkCreator';
import { EventsList } from './components/coordinator/EventsList';
import { ManualShiftAssignment } from './components/coordinator/ManualShiftAssignment';
import { ShiftAssignment } from './components/coordinator/ShiftAssignment';
import { ImportFamilies } from './components/coordinator/ImportFamilies';
import { ManageFamilies } from './components/coordinator/ManageFamilies';
import { FamilyRegistration } from './components/family/FamilyRegistration';
import { FamilyDashboard } from './components/family/FamilyDashboard';
import { MyShiftsPage } from './components/family/MyShiftsPage';
import { FamilyMembersPage } from './components/family/FamilyMembersPage';
import { PointsTierPage } from './components/family/PointsTierPage';
import { SubstituteMarketplacePage } from './components/substitute/SubstituteMarketplacePage';
import { MySubstituteJobsPage } from './components/substitute/MySubstituteJobsPage';
import './App.css';

function App() {
  const path = window.location.pathname;

  // Simple router based on URL path
  const renderPage = () => {
    switch (path) {
      case '/':
        return <LandingPage />;
      case '/register':
        return <RegisterPage />;
      case '/login':
        return <LoginPage />;
      case '/role-selection':
        return <RoleSelectionPage />;
      case '/create-club':
        return <ClubCreationPage />;
      case '/setup-team':
        return <TeamSetupPage />;
      case '/select-club':
        return <ClubSelectionPage />;
      case '/select-team':
        return <TeamSelectionPage />;
      case '/setup-family':
        return <FamilyProfileSetupPage />;
      
      // Coordinator routes - WRAPPED in CoordinatorLayout
      case '/coordinator-dashboard':
        return (
          <CoordinatorLayout>
            <CoordinatorDashboard />
          </CoordinatorLayout>
        );
      case '/create-event':
        return (
          <CoordinatorLayout>
            <EventCreator />
          </CoordinatorLayout>
        );
      case '/bulk-event-creator':
        return (
          <CoordinatorLayout>
            <BulkEventCreator />
          </CoordinatorLayout>
        );
      case '/multiday-bulk-creator':
        return (
          <CoordinatorLayout>
            <MultiDayBulkCreator />
          </CoordinatorLayout>
        );
      case '/shift-assignment':
        return (
          <CoordinatorLayout>
            <ShiftAssignment />
          </CoordinatorLayout>
        );
      case '/manual-shift-assignment':
        return (
          <CoordinatorLayout>
            <ManualShiftAssignment />
          </CoordinatorLayout>
        );
      case '/events-list':
        return (
          <CoordinatorLayout>
            <EventsList />
          </CoordinatorLayout>
        );
      case '/import-families':
        return (
          <CoordinatorLayout>
            <ImportFamilies />
          </CoordinatorLayout>
        );
      case '/family-registration':
        // Handle token-based family registration (without CoordinatorLayout)
        return <FamilyRegistration />;
      case '/manage-families':
        return (
          <CoordinatorLayout>
            <ManageFamilies />
          </CoordinatorLayout>
        );
      
      // Family routes
      case '/family-dashboard':
        return <FamilyDashboard />;
      case '/my-shifts':
        return <MyShiftsPage />;
      case '/family-members':
        return <FamilyMembersPage />;
      case '/points-tier':
        return <PointsTierPage />;
      
      // Substitute routes
      case '/substitute-marketplace':
        return <SubstituteMarketplacePage />;
      case '/my-substitute-jobs':
        return <MySubstituteJobsPage />;
      
      default:
        return <LandingPage />;
    }
  };

  return <div className="app">{renderPage()}</div>;
}

export default App;



