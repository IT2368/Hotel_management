//src/utils/getDashboardPath

const getDashboardPath = (role, options = {}) => {
  const { tab } = options;
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "manager":
      return "/manager/dashboard";
    case "staff": {
      // allow deep-linking to specific tab
      const base = "/staff/dashboard";
      return tab ? `${base}?tab=${encodeURIComponent(tab)}` : base;
    }
    case "guest":
      return "/guest/dashboard";
    default:
      return "/";
  }
};

export default getDashboardPath;
