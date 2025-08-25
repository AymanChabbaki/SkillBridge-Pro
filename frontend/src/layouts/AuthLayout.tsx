import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">SkillBridge Pro</h1>
          <p className="text-muted-foreground">Professional Freelancer Platform</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;