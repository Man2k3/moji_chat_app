import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { LogOut } from "lucide-react";

const Logout = () => {
  const { signOut } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await signOut();
    navigate("/signin");
  };
  return (
    <Button variant="completeGhost" onClick={handleLogout}>
      <LogOut className="text-destructive" />
      Log out
    </Button>
  );
};

export default Logout;
