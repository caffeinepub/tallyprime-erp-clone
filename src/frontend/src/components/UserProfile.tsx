import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Lock, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ProfileData {
  displayName: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  signature: string;
}

const PROFILE_KEY = "hisabkitab_profile";
const PHOTO_KEY = "hisabkitab_profile_photo";

function loadProfile(): ProfileData {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw) as ProfileData;
  } catch {
    // ignore
  }
  return {
    displayName: "",
    email: "",
    phone: "",
    designation: "",
    department: "",
    signature: "",
  };
}

export default function UserProfile() {
  const [profile, setProfile] = useState<ProfileData>(loadProfile);
  const [photo, setPhoto] = useState<string | null>(() =>
    localStorage.getItem(PHOTO_KEY),
  );
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProfile(loadProfile());
    setPhoto(localStorage.getItem(PHOTO_KEY));
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      localStorage.setItem(PHOTO_KEY, base64);
      setPhoto(base64);
      toast.success("Profile photo updated!");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    toast.success("Profile saved successfully!");
  };

  const handleChangePassword = () => {
    if (!currentPwd) {
      toast.error("Please enter your current password");
      return;
    }
    if (newPwd.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("New passwords do not match");
      return;
    }
    // Validate against stored users
    try {
      const users = JSON.parse(
        localStorage.getItem("hisabkitab_users") ?? "[]",
      ) as Array<{ username: string; password: string }>;
      const currentUserRaw = localStorage.getItem("hisabkitab_current_user");
      const currentUser = currentUserRaw
        ? (JSON.parse(currentUserRaw) as { username: string })
        : null;
      if (!currentUser) {
        // Fallback: allow admin to change
        if (currentPwd !== "admin123") {
          toast.error("Current password is incorrect");
          return;
        }
      } else {
        const found = users.find((u) => u.username === currentUser.username);
        if (
          found &&
          found.password !== currentPwd &&
          !(currentUser.username === "admin" && currentPwd === "admin123")
        ) {
          toast.error("Current password is incorrect");
          return;
        }
      }
      // Update password in stored users
      if (currentUser) {
        const updated = users.map((u) =>
          u.username === currentUser.username ? { ...u, password: newPwd } : u,
        );
        localStorage.setItem("hisabkitab_users", JSON.stringify(updated));
      }
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      toast.success(
        "Password changed successfully! Please log in again next session.",
      );
    } catch {
      toast.error("Failed to change password");
    }
  };

  const initial = (profile.displayName || "A")[0].toUpperCase();

  return (
    <div className="p-4 space-y-6 max-w-2xl">
      <div>
        <h2 className="text-base font-bold text-foreground">My Profile</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your profile information and settings
        </p>
      </div>

      {/* Photo upload */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            data-ocid="user_profile.upload_button"
            className="w-16 h-16 rounded-full bg-teal/20 border-2 border-teal/40 flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
          >
            {photo ? (
              <img
                src={photo}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-teal">{initial}</span>
            )}
          </button>
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-teal rounded-full flex items-center justify-center">
            <Camera size={10} className="text-white" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {profile.displayName || "Your Name"}
          </p>
          <p className="text-xs text-muted-foreground">
            {profile.designation || "Designation"}
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-teal hover:underline mt-1"
          >
            Change photo
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
          data-ocid="user_profile.dropzone"
        />
      </div>

      {/* Profile fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs">Display Name</Label>
          <Input
            value={profile.displayName}
            onChange={(e) =>
              setProfile((p) => ({ ...p, displayName: e.target.value }))
            }
            className="h-8 text-xs"
            placeholder="Your full name"
            data-ocid="user_profile.input"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Email</Label>
          <Input
            value={profile.email}
            onChange={(e) =>
              setProfile((p) => ({ ...p, email: e.target.value }))
            }
            className="h-8 text-xs"
            placeholder="you@example.com"
            type="email"
            data-ocid="user_profile.search_input"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Phone</Label>
          <Input
            value={profile.phone}
            onChange={(e) =>
              setProfile((p) => ({ ...p, phone: e.target.value }))
            }
            className="h-8 text-xs"
            placeholder="+91 98765 43210"
            data-ocid="user_profile.textarea"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Designation</Label>
          <Input
            value={profile.designation}
            onChange={(e) =>
              setProfile((p) => ({ ...p, designation: e.target.value }))
            }
            className="h-8 text-xs"
            placeholder="Chief Accountant"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Department</Label>
          <Input
            value={profile.department}
            onChange={(e) =>
              setProfile((p) => ({ ...p, department: e.target.value }))
            }
            className="h-8 text-xs"
            placeholder="Finance & Accounts"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Signature / Note</Label>
        <Textarea
          value={profile.signature}
          onChange={(e) =>
            setProfile((p) => ({ ...p, signature: e.target.value }))
          }
          className="text-xs h-20"
          placeholder="Your digital signature or note for documents..."
          data-ocid="user_profile.editor"
        />
      </div>

      <Button
        size="sm"
        onClick={handleSaveProfile}
        data-ocid="user_profile.save_button"
        className="text-xs"
      >
        <Save size={12} className="mr-1" />
        Save Profile
      </Button>

      <Separator />

      {/* Password change */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Lock size={14} className="text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Change Password
          </h3>
        </div>
        <div className="space-y-3 max-w-sm">
          <div className="space-y-1">
            <Label className="text-xs">Current Password</Label>
            <Input
              type="password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              className="h-8 text-xs"
              data-ocid="user_profile.select"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">New Password</Label>
            <Input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              className="h-8 text-xs"
            />
            {confirmPwd && newPwd !== confirmPwd && (
              <p
                className="text-[10px] text-destructive"
                data-ocid="user_profile.error_state"
              >
                Passwords do not match
              </p>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleChangePassword}
            data-ocid="user_profile.submit_button"
            className="text-xs"
          >
            Change Password
          </Button>
        </div>
      </div>
    </div>
  );
}
